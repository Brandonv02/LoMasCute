/**
 * Sube el arte del catálogo al bucket "products" y lo registra en la tabla
 * `product_images`.
 *
 *   npm run seed:images
 *
 * Hasta ahora las ilustraciones vivían en `public/products/` y la tienda las
 * servía como archivos estáticos. Para que el catálogo salga entero de
 * Supabase tienen que estar en Storage, que es de donde las lee la tienda.
 *
 * Es idempotente: un producto que ya tiene imágenes se salta. Para rehacerlas,
 * bórralas primero desde el panel.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

/* ------------------------------------------------------------------ env */

const envPath = path.join(root, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && match[2] && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "\nFaltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.\n",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

/* ---------------------------------------------------------------- proceso */

const ART_DIR = path.join(root, "public", "products");

const { data: products, error } = await admin
  .from("products")
  .select("id, slug, name")
  .order("created_at");

if (error) {
  console.error("\nNo se pudo leer el catálogo:", error.message, "\n");
  process.exit(1);
}

let uploaded = 0;
let skipped = 0;
let missing = 0;

for (const product of products ?? []) {
  const { count } = await admin
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", product.id);

  if ((count ?? 0) > 0) {
    skipped++;
    continue;
  }

  // El arte sigue la convención `{slug}-1.svg`, `-2`, `-3`.
  const files = [1, 2, 3]
    .map((n) => ({ n, file: path.join(ART_DIR, `${product.slug}-${n}.svg`) }))
    .filter((entry) => fs.existsSync(entry.file));

  if (!files.length) {
    console.log(`  · ${product.slug}: sin arte en public/products`);
    missing++;
    continue;
  }

  for (const [index, entry] of files.entries()) {
    const storagePath = `${product.id}/${entry.n}.svg`;
    const body = fs.readFileSync(entry.file);

    const { error: uploadError } = await admin.storage
      .from("products")
      .upload(storagePath, body, { contentType: "image/svg+xml", upsert: true });

    if (uploadError) {
      console.error(`  ✗ ${storagePath}: ${uploadError.message}`);
      continue;
    }

    const { error: rowError } = await admin.from("product_images").insert({
      product_id: product.id,
      storage_path: storagePath,
      alt: product.name,
      position: index,
      is_primary: index === 0,
    });

    if (rowError) console.error(`  ✗ ${storagePath}: ${rowError.message}`);
    else uploaded++;
  }

  console.log(`  ✓ ${product.slug}: ${files.length} imágenes`);
}

console.log(
  `\n${uploaded} imágenes subidas · ${skipped} productos ya tenían · ${missing} sin arte\n`,
);
