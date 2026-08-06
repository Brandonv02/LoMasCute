/**
 * Slug a partir de un nombre legible: "Labios & Gloss" → "labios-gloss".
 *
 * Vive aquí, y no en el servicio de categorías, porque el formulario del panel
 * necesita el mismo criterio en el navegador para proponer el slug mientras se
 * escribe el nombre. El equivalente en SQL es `public.slugify()`
 * (0010_catalog_taxonomy.sql): las dos versiones deben dar el mismo resultado.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
