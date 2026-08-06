/**
 * Barrido de QA visual. Recorre todas las rutas en cuatro viewports
 * (iPhone, tablet, escritorio y ultrawide) y reporta:
 *
 *   · desbordamiento horizontal (la causa nº1 de que algo se vea roto en móvil)
 *   · imágenes que no cargaron
 *   · páginas sin <h1>
 *   · errores de consola
 *
 * Uso:
 *   npm run build && npm start          (en otra terminal)
 *   npm run qa -- http://localhost:3000
 *
 * Si Chrome no está en la ruta por defecto, define CHROME_PATH.
 */
import { spawn } from "node:child_process";

const CHROME =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = Number(process.env.CDP_PORT ?? 9345);
const base = process.argv[2] ?? "http://localhost:3000";

/**
 * Rutas fijas del sitio. No se listan fichas de producto ni categorías: los
 * slugs dependen del catálogo real de cada base, así que se pasan como
 * argumentos extra si se quieren revisar:
 *
 *   npm run qa -- http://localhost:3000 /producto/mi-slug
 */
const ROUTES = [
  "/",
  "/tienda",
  "/tienda?orden=nuevo",
  "/checkout",
  "/favoritos",
  "/comparar",
  "/nosotros",
  "/contacto",
  "/legal/envios",
  "/legal/privacidad",
  "/no-existe-esta-pagina",
  ...process.argv.slice(3),
];

const VIEWPORTS = [
  { name: "iphone", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "ultrawide", width: 2560, height: 1200 },
];

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--disable-gpu",
    "--no-first-run",
    "--hide-scrollbars",
    `--user-data-dir=${process.env.TEMP}\\lmc-sweep-${Date.now()}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const j = await r.json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("sin Chrome");
}

function client(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
    } else {
      listeners.forEach((fn) => fn(m));
    }
  });
  const ready = new Promise((res, rej) => {
    ws.addEventListener("open", res);
    ws.addEventListener("error", rej);
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const msgId = ++id;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
    });
  return { send, ready, onEvent: (fn) => listeners.push(fn) };
}

const MEASURE = `JSON.stringify({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  title: document.title,
  h1: (document.querySelector('h1')?.textContent || '').slice(0, 60),
  imgsBroken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src).slice(0, 5),
  jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
})`;

async function main() {
  const { send, ready, onEvent } = client(await wsUrl());
  await ready;

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Log.enable", {}, sessionId);
  await send("Network.enable", {}, sessionId);
  await send(
    "Page.addScriptToEvaluateOnNewDocument",
    { source: `try { sessionStorage.setItem('lmc.splash.seen','1'); } catch(e){}` },
    sessionId,
  );

  let logs = [];
  let failed = [];
  onEvent((m) => {
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
      logs.push(m.params.args.map((a) => a.value ?? a.description ?? "?").join(" "));
    }
    if (m.method === "Log.entryAdded" && m.params.entry.level === "error") {
      logs.push(m.params.entry.text);
    }
    if (m.method === "Runtime.exceptionThrown") {
      logs.push(m.params.exceptionDetails.text ?? "excepción");
    }
    if (m.method === "Network.loadingFailed") {
      failed.push(m.params.errorText);
    }
  });

  const problems = [];

  for (const vp of VIEWPORTS) {
    await send(
      "Emulation.setDeviceMetricsOverride",
      {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 640,
      },
      sessionId,
    );

    for (const route of ROUTES) {
      logs = [];
      failed = [];
      await send("Page.navigate", { url: base + route }, sessionId);
      await sleep(1700);

      const { result } = await send(
        "Runtime.evaluate",
        { expression: MEASURE, returnByValue: true },
        sessionId,
      );
      const data = JSON.parse(result.value);

      const issues = [];
      if (data.scrollWidth > data.clientWidth + 1) {
        issues.push(`overflow-x ${data.scrollWidth}>${data.clientWidth}`);
      }
      if (data.imgsBroken.length) issues.push(`imgs roto: ${data.imgsBroken.join(", ")}`);
      if (!data.h1) issues.push("sin h1");
      if (logs.length) issues.push(`consola: ${[...new Set(logs)].slice(0, 2).join(" | ")}`);

      const status = issues.length ? `✗ ${issues.join(" · ")}` : "ok";
      console.log(
        `${vp.name.padEnd(10)} ${route.padEnd(42)} ${status}${issues.length ? "" : `  [${data.jsonLd} JSON-LD]`}`,
      );
      if (issues.length) problems.push(`${vp.name} ${route}: ${issues.join(" · ")}`);
    }
  }

  console.log(
    problems.length
      ? `\n${problems.length} problema(s) encontrados`
      : "\n✔ Sin problemas en el barrido",
  );

  await send("Target.closeTarget", { targetId });
  chrome.kill();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});
