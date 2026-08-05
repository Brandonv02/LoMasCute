/**
 * Verifica que el proyecto de Supabase está listo para el módulo Productos.
 *
 *   npm run supabase:check
 *
 * Lee `.env.local` y comprueba, contra el proyecto remoto:
 *   1. Que las tres variables están puestas.
 *   2. Que las tablas existen (migración 0001).
 *   3. Que RLS protege de verdad: la clave anónima no debe ver borradores.
 *   4. Que el bucket "products" existe (migración 0003).
 *
 * Se ejecuta en tu máquina con tus claves: la `service_role` no tiene que
 * salir de `.env.local` ni compartirse con nadie.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const ok = (msg) => console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
const bad = (msg) => console.log(`  \x1b[31m✗\x1b[0m ${msg}`);
const warn = (msg) => console.log(`  \x1b[33m!\x1b[0m ${msg}`);

/* ------------------------------------------------------------------ env */

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const value = match[2].replace(/^["']|["']$/g, "");
    if (value && !process.env[match[1]]) process.env[match[1]] = value;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("\nVariables de entorno");
let fatal = false;
for (const [name, value] of [
  ["NEXT_PUBLIC_SUPABASE_URL", url],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey],
  ["SUPABASE_SERVICE_ROLE_KEY", serviceKey],
]) {
  if (value) ok(name);
  else {
    bad(`${name} — falta en .env.local`);
    fatal = true;
  }
}

if (fatal) {
  console.log("\nCopia .env.example como .env.local y rellena los valores.\n");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const anon = createClient(url, anonKey, { auth: { persistSession: false } });

let failures = 0;

/* --------------------------------------------------------------- tablas */

console.log("\nTablas (migración 0001_init.sql)");
for (const table of ["categories", "products", "product_images"]) {
  const { count, error } = await admin
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    bad(`${table} — ${error.message}`);
    failures++;
  } else {
    ok(`${table} · ${count} ${count === 1 ? "fila" : "filas"}`);
  }
}

/* ------------------------------------------------------------------ RLS */

console.log("\nRLS (migración 0002_rls.sql)");
{
  const { data: created, error: createError } = await admin
    .from("products")
    .insert({
      slug: `verificacion-rls-${Date.now()}`,
      name: "Verificación RLS",
      price: 1000,
      status: "draft",
    })
    .select("id")
    .single();

  if (createError) {
    bad(`no se pudo escribir con service_role — ${createError.message}`);
    failures++;
  } else {
    ok("service_role puede escribir");

    const { data: seen, error: readError } = await anon
      .from("products")
      .select("id")
      .eq("id", created.id)
      .maybeSingle();

    if (readError) {
      warn(`lectura anónima devolvió un error: ${readError.message}`);
    } else if (seen) {
      bad("la clave anónima VE un borrador — RLS no está aplicado");
      failures++;
    } else {
      ok("la clave anónima no ve borradores");
    }

    const { error: writeError } = await anon
      .from("products")
      .update({ name: "No debería poder" })
      .eq("id", created.id);

    if (writeError) ok("la clave anónima no puede escribir");
    else {
      bad("la clave anónima PUEDE escribir — revisa las políticas");
      failures++;
    }

    await admin.from("products").delete().eq("id", created.id);
  }
}

/* -------------------------------------------------------------- storage */

console.log("\nStorage (migración 0003_storage.sql)");
{
  const { data, error } = await admin.storage.listBuckets();
  if (error) {
    bad(`no se pudieron listar los buckets — ${error.message}`);
    failures++;
  } else {
    const bucket = data.find((item) => item.id === "products");
    if (bucket) ok(`bucket "products" · ${bucket.public ? "público" : "privado"}`);
    else {
      bad('falta el bucket "products" — ejecuta 0003_storage.sql');
      failures++;
    }
  }
}

/* ------------------------------------------------------------ resultado */

if (failures === 0) {
  console.log("\n\x1b[32mTodo listo.\x1b[0m Abre /admin/productos.\n");
} else {
  console.log(
    `\n\x1b[31m${failures} ${failures === 1 ? "comprobación falló" : "comprobaciones fallaron"}.\x1b[0m ` +
      "Revisa supabase/README.md.\n",
  );
  process.exit(1);
}
