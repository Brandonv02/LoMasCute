"use server";

import { revalidatePath } from "next/cache";
import type { BrandTone } from "@/lib/supabase/types";
import { messageFor } from "@/services/errors";
import {
  createCategory,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  moveCategory,
  moveSubcategory,
  setCategoryActive,
  setSubcategoryActive,
  updateCategory,
  updateSubcategory,
  type CategoryInput,
  type SubcategoryInput,
} from "@/services/categories";

/**
 * Server Actions del módulo Categorías.
 *
 * Leen el FormData, delegan en el servicio y traducen cualquier fallo a un
 * mensaje presentable. La estructura del catálogo gobierna el menú, los filtros
 * y las páginas de categoría, así que cada cambio revalida el layout completo
 * de la tienda además de esta pantalla.
 */

export type ActionResult = { ok: true } | { ok: false; message: string };

const TONES: BrandTone[] = ["rose", "mint", "lavender", "peach", "gold"];

function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
}

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim();

const flag = (formData: FormData, name: string) => formData.get(name) === "on";

function categoryInput(formData: FormData): CategoryInput {
  const tone = field(formData, "tone") as BrandTone;

  return {
    name: field(formData, "name"),
    slug: field(formData, "slug"),
    claim: field(formData, "claim"),
    description: field(formData, "description"),
    imageUrl: field(formData, "imageUrl"),
    tone: TONES.includes(tone) ? tone : "rose",
    icon: field(formData, "icon"),
    seoTitle: field(formData, "seoTitle"),
    seoDescription: field(formData, "seoDescription"),
    isActive: flag(formData, "isActive"),
    comingSoon: flag(formData, "comingSoon"),
  };
}

function subcategoryInput(formData: FormData): SubcategoryInput {
  return {
    name: field(formData, "name"),
    slug: field(formData, "slug"),
    isActive: flag(formData, "isActive"),
  };
}

/** Envuelve la acción para que un fallo llegue como mensaje, no como pantalla roja. */
async function run(task: () => Promise<void>): Promise<ActionResult> {
  try {
    await task();
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
  refresh();
  return { ok: true };
}

/* ------------------------------------------------------------- categorías */

export async function createCategoryAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return run(() => createCategory(categoryInput(formData)));
}

export async function updateCategoryAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = field(formData, "id");
  return run(() => updateCategory(id, categoryInput(formData)));
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  return run(() => deleteCategory(id));
}

export async function toggleCategoryAction(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  return run(() => setCategoryActive(id, isActive));
}

export async function moveCategoryAction(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  return run(() => moveCategory(id, direction));
}

/* ---------------------------------------------------------- subcategorías */

export async function createSubcategoryAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const categoryId = field(formData, "categoryId");
  return run(() => createSubcategory(categoryId, subcategoryInput(formData)));
}

export async function updateSubcategoryAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = field(formData, "id");
  return run(() => updateSubcategory(id, subcategoryInput(formData)));
}

export async function deleteSubcategoryAction(id: string): Promise<ActionResult> {
  return run(() => deleteSubcategory(id));
}

export async function toggleSubcategoryAction(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  return run(() => setSubcategoryActive(id, isActive));
}

export async function moveSubcategoryAction(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  return run(() => moveSubcategory(id, direction));
}
