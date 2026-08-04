/**
 * El logo original llega con fondo blanco sólido. Aquí lo volvemos
 * transparente para poder usarlo sobre cualquier degradado pastel.
 *
 * En vez de "quitar todo lo blanco" (que borraría el borde tipo sticker,
 * que es parte del diseño), hacemos un flood fill desde los bordes: solo
 * desaparece el blanco conectado al exterior de la imagen.
 *
 *   node scripts/prepare-logo.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(root, "public", "brand", "logo-lo-mas-cute.webp");
const OUT_PNG = path.join(root, "public", "brand", "logo-lo-mas-cute.png");

/**
 * TRAVERSE es deliberadamente bajo: solo se recorta el blanco puro del fondo.
 * El borde crema tipo sticker (#FFF7F4, distancia 11) sobrevive porque es
 * parte del diseño del logo. El dentado del recorte se resuelve después
 * difuminando únicamente el canal alfa.
 */
const TRAVERSE = 9;

const distanceFromWhite = (r, g, b) => Math.max(255 - r, 255 - g, 255 - b);

async function main() {
  const image = sharp(SOURCE).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const pixels = new Uint8ClampedArray(data);

  const visited = new Uint8Array(width * height);
  const queue = [];

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const o = idx * channels;
    const dist = distanceFromWhite(pixels[o], pixels[o + 1], pixels[o + 2]);
    if (dist > TRAVERSE) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  // Semillas: todo el perímetro
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  // Flood fill 4-direccional con alfa graduado
  while (queue.length) {
    const idx = queue.pop();
    const x = idx % width;
    const y = (idx - x) / width;
    pixels[idx * channels + 3] = 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  // Difuminado del canal alfa (dos pasadas de kernel 3×3). Quita el dentado
  // del recorte sin tocar el color, así el sticker no pierde su borde crema.
  const at = (x, y) => (y * width + x) * channels + 3;
  for (let pass = 0; pass < 4; pass++) {
    const snapshot = new Uint8ClampedArray(width * height);
    for (let i = 0; i < width * height; i++) snapshot[i] = pixels[i * channels + 3];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = snapshot[y * width + x];
        let sum = 0;
        let edge = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const a = snapshot[(y + dy) * width + (x + dx)];
            sum += a;
            if (a !== center) edge = true;
          }
        }
        // Solo suavizamos la frontera; el interior opaco se deja intacto
        if (edge) pixels[at(x, y)] = Math.round(sum / 9);
      }
    }
  }

  const cleaned = sharp(Buffer.from(pixels.buffer), {
    raw: { width, height, channels },
  });

  // Recortamos el aire sobrante para que el logo llene su caja
  await cleaned
    .trim({ threshold: 1 })
    .png({ compressionLevel: 9 })
    .toFile(OUT_PNG);

  const out = await sharp(OUT_PNG).metadata();
  console.log(`✔ logo transparente: ${out.width}×${out.height}px`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
