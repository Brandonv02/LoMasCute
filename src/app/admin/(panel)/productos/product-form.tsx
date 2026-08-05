"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ImagePlus, Save } from "lucide-react";
import type { ProductStatus } from "@/lib/supabase/types";
import type { ProductImage } from "@/lib/product-images";
import type { CategoryOption } from "@/services/categories";
import type { Product } from "@/services/products";
import {
  createProductAction,
  updateProductAction,
  type ActionResult,
} from "@/app/admin/(panel)/productos/actions";
import { Field, Input, Label, Select, Textarea } from "@/components/ui/field";
import { Panel, PanelHeader } from "@/components/admin/ui";
import { ImageManager } from "@/app/admin/(panel)/productos/image-manager";
import { slugify } from "@/lib/utils";

/**
 * Formulario de producto. Sirve para crear y para editar: la diferencia es la
 * acción que recibe y si trae valores por defecto.
 *
 * Guarda exactamente los campos de esta fase: nombre, slug, descripción,
 * precio, precio anterior, categoría, stock, estado y destacado. Las imágenes
 * llegan en la siguiente.
 */

const STATUS_OPTIONS: { value: ProductStatus; label: string; hint: string }[] = [
  { value: "draft", label: "Borrador", hint: "Solo visible en el panel" },
  { value: "published", label: "Publicado", hint: "Visible en la tienda" },
  { value: "archived", label: "Archivado", hint: "Fuera de catálogo, sin borrar" },
];

export function ProductForm({
  categories,
  product,
  images = [],
}: {
  categories: CategoryOption[];
  product?: Product;
  images?: ProductImage[];
}) {
  const isEdit = Boolean(product);
  const action = isEdit ? updateProductAction : createProductAction;
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action,
    null,
  );

  // El slug se sugiere solo mientras nadie lo haya tocado a mano.
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "draft");

  const onNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const statusHint = STATUS_OPTIONS.find((option) => option.value === status)?.hint;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {isEdit && <input type="hidden" name="id" value={product!.id} />}

      {state && !state.ok && (
        <div
          role="alert"
          className="tone-rose flex items-start gap-3 rounded-2xl px-5 py-4 text-sm"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Datos principales */}
        <Panel className="admin-in">
          <PanelHeader
            title="Información"
            description="Lo que la clienta ve en la ficha del producto"
          />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field
              label="Nombre"
              htmlFor="p-name"
              required
              className="sm:col-span-2"
            >
              <Input
                id="p-name"
                name="name"
                required
                maxLength={140}
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="Labial Satinado Cloud Kiss"
              />
            </Field>

            <Field
              label="Slug"
              htmlFor="p-slug"
              required
              hint="Se usa en la URL: /producto/mi-slug"
              className="sm:col-span-2"
            >
              <Input
                id="p-slug"
                name="slug"
                required
                maxLength={140}
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
                onBlur={(event) => setSlug(slugify(event.target.value))}
                placeholder="labial-satinado-cloud-kiss"
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
              />
            </Field>

            <Field label="Descripción" htmlFor="p-description" className="sm:col-span-2">
              <Textarea
                id="p-description"
                name="description"
                rows={6}
                defaultValue={product?.description ?? ""}
                placeholder="Cuéntale a la clienta por qué este producto vale la pena…"
              />
            </Field>
          </div>
        </Panel>

        {/* Publicación y organización */}
        <div className="flex flex-col gap-6">
          <Panel className="admin-in">
            <PanelHeader title="Publicación" description="Dónde y cómo aparece" />

            <div className="mt-6 flex flex-col gap-5">
              <Field label="Estado" htmlFor="p-status" required hint={statusHint}>
                <Select
                  id="p-status"
                  name="status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ProductStatus)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Categoría" htmlFor="p-category">
                <Select
                  id="p-category"
                  name="categoryId"
                  defaultValue={product?.categoryId ?? ""}
                >
                  <option value="">Sin categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <div>
                <Label htmlFor="p-featured">Destacado</Label>
                <label
                  htmlFor="p-featured"
                  className="admin-inset flex cursor-pointer items-start gap-3 p-4"
                >
                  <input
                    id="p-featured"
                    name="isFeatured"
                    type="checkbox"
                    defaultChecked={product?.isFeatured ?? false}
                    className="mt-0.5 size-4 shrink-0 rounded-md accent-[#F8B6C8]"
                  />
                  <span className="admin-soft text-sm leading-snug">
                    Aparece en los carruseles de la portada
                  </span>
                </label>
              </div>
            </div>
          </Panel>

          <Panel className="admin-in">
            <PanelHeader title="Precio e inventario" description="Valores en pesos" />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Precio" htmlFor="p-price" required hint="Sin puntos ni símbolos">
                <Input
                  id="p-price"
                  name="price"
                  inputMode="numeric"
                  required
                  defaultValue={product ? String(product.price) : ""}
                  placeholder="48900"
                />
              </Field>

              <Field
                label="Precio anterior"
                htmlFor="p-compare"
                hint="Opcional. Debe ser mayor que el precio."
              >
                <Input
                  id="p-compare"
                  name="compareAtPrice"
                  inputMode="numeric"
                  defaultValue={product?.compareAtPrice ? String(product.compareAtPrice) : ""}
                  placeholder="62900"
                />
              </Field>

              <Field label="Stock" htmlFor="p-stock" required className="sm:col-span-2">
                <Input
                  id="p-stock"
                  name="stock"
                  type="number"
                  min={0}
                  step={1}
                  required
                  defaultValue={product ? String(product.stock) : "0"}
                />
              </Field>
            </div>
          </Panel>
        </div>
      </div>

      {/* Imágenes. Solo al editar: hasta que el producto no existe no hay a qué
          colgarlas, y subirlas antes dejaría archivos huérfanos si se abandona
          el formulario. */}
      {isEdit ? (
        <ImageManager productId={product!.id} initialImages={images} />
      ) : (
        <Panel className="admin-in">
          <PanelHeader
            title="Imágenes"
            description="Disponibles en cuanto guardes el producto"
          />
          <div className="admin-inset mt-5 flex items-center gap-3.5 p-5">
            <span className="tone-neutral grid size-10 shrink-0 place-items-center rounded-2xl">
              <ImagePlus className="size-5" strokeWidth={1.7} />
            </span>
            <p className="admin-soft text-sm leading-relaxed">
              Guarda el producto y te llevamos a su ficha para añadir las fotos.
            </p>
          </div>
        </Panel>
      )}

      {/* Acciones */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link href="/admin/productos" className="admin-btn">
          Cancelar
        </Link>
        <button type="submit" disabled={pending} className="admin-btn admin-btn-primary">
          <Save className="size-4" strokeWidth={1.9} />
          {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
