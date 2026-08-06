"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ChevronDown,
  Eye,
  EyeOff,
  Layers,
  MoveDown,
  MoveUp,
  Plus,
  Trash2,
} from "lucide-react";
import type { BrandTone } from "@/lib/supabase/types";
import type { CategoryWithCounts } from "@/services/categories";
import { slugify } from "@/lib/slug";
import { formatCOP } from "@/lib/utils";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Meter, Panel, PanelHeader, StatusPill } from "@/components/admin/ui";
import {
  createCategoryAction,
  createSubcategoryAction,
  deleteCategoryAction,
  deleteSubcategoryAction,
  moveCategoryAction,
  moveSubcategoryAction,
  toggleCategoryAction,
  toggleSubcategoryAction,
  updateCategoryAction,
  updateSubcategoryAction,
  type ActionResult,
} from "@/app/admin/(panel)/categorias/actions";

/**
 * Gestor de la estructura del catálogo.
 *
 * Toda la taxonomía —categorías, su orden, su estado y sus subcategorías— se
 * edita aquí. La tienda lee de la base, así que nada de esto necesita un
 * despliegue: se guarda y la portada, el menú y los filtros ya lo reflejan.
 *
 * El componente es de cliente solo por los formularios y los botones; los datos
 * llegan ya resueltos del servidor y cada acción revalida la ruta.
 */

const TONES: BrandTone[] = ["rose", "mint", "lavender", "peach", "gold"];

/** Mensaje de error de una acción, con el mismo aspecto que en Configuración. */
function ActionError({ state }: { state: ActionResult | null }) {
  if (!state || state.ok) return null;
  return (
    <div
      role="alert"
      className="tone-rose mt-4 flex items-start gap-3 rounded-2xl px-5 py-4 text-sm"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
      <span>{state.message}</span>
    </div>
  );
}

/** Campos compartidos por el alta y la edición de una categoría. */
function CategoryFields({
  category,
  idPrefix,
}: {
  category?: CategoryWithCounts;
  idPrefix: string;
}) {
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTocado, setSlugTocado] = useState(Boolean(category));

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Nombre" htmlFor={`${idPrefix}-name`} required>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          maxLength={80}
          required
          defaultValue={category?.name}
          onChange={(event) => {
            if (!slugTocado) setSlug(slugify(event.target.value));
          }}
          placeholder="Maquillaje"
        />
      </Field>

      <Field
        label="Slug"
        htmlFor={`${idPrefix}-slug`}
        hint="Es la URL: /categoria/maquillaje"
      >
        <Input
          id={`${idPrefix}-slug`}
          name="slug"
          maxLength={80}
          value={slug}
          onChange={(event) => {
            setSlugTocado(true);
            setSlug(event.target.value);
          }}
          placeholder="maquillaje"
        />
      </Field>

      <Field
        label="Claim"
        htmlFor={`${idPrefix}-claim`}
        hint="Frase corta bajo el nombre en la vitrina"
      >
        <Input
          id={`${idPrefix}-claim`}
          name="claim"
          maxLength={120}
          defaultValue={category?.claim ?? ""}
          placeholder="Tu cara lavada, pero mejor"
        />
      </Field>

      <Field label="Color" htmlFor={`${idPrefix}-tone`} hint="Acento pastel de la marca">
        <Select id={`${idPrefix}-tone`} name="tone" defaultValue={category?.tone ?? "rose"}>
          {TONES.map((tone) => (
            <option key={tone} value={tone}>
              {tone}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Descripción"
        htmlFor={`${idPrefix}-description`}
        className="md:col-span-2"
      >
        <Textarea
          id={`${idPrefix}-description`}
          name="description"
          rows={3}
          maxLength={400}
          defaultValue={category?.description ?? ""}
          placeholder="Qué encuentra la clienta en esta categoría."
        />
      </Field>

      <Field
        label="Imagen"
        htmlFor={`${idPrefix}-image`}
        hint="Ruta o URL de la imagen de la tarjeta. Vacío: la tarjeta va sin foto"
      >
        <Input
          id={`${idPrefix}-image`}
          name="imageUrl"
          maxLength={300}
          defaultValue={category?.imageUrl ?? ""}
          placeholder="/art/categoria-maquillaje.svg"
        />
      </Field>

      <Field
        label="Icono"
        htmlFor={`${idPrefix}-icon`}
        hint="Nombre de un icono de lucide, opcional"
      >
        <Input
          id={`${idPrefix}-icon`}
          name="icon"
          maxLength={40}
          defaultValue={category?.icon ?? ""}
          placeholder="sparkles"
        />
      </Field>

      <Field
        label="SEO · título"
        htmlFor={`${idPrefix}-seo-title`}
        hint="Vacío: se usa el nombre"
      >
        <Input
          id={`${idPrefix}-seo-title`}
          name="seoTitle"
          maxLength={120}
          defaultValue={category?.seoTitle ?? ""}
        />
      </Field>

      <Field
        label="SEO · descripción"
        htmlFor={`${idPrefix}-seo-description`}
        hint="Vacía: se usa la descripción"
      >
        <Input
          id={`${idPrefix}-seo-description`}
          name="seoDescription"
          maxLength={200}
          defaultValue={category?.seoDescription ?? ""}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-6 md:col-span-2">
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={category?.isActive ?? true}
            className="size-4 accent-[#d98aa6]"
          />
          Activa en la tienda
        </label>
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="comingSoon"
            defaultChecked={category?.comingSoon ?? false}
            className="size-4 accent-[#d98aa6]"
          />
          Anunciar como &laquo;muy pronto&raquo;
        </label>
        <p className="admin-muted text-xs">
          Una categoría sin productos no se muestra, salvo que esté anunciada.
        </p>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- alta nueva */

function NewCategory() {
  const [abierto, setAbierto] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (prev, formData) => {
      const result = await createCategoryAction(prev, formData);
      if (result.ok) setAbierto(false);
      return result;
    },
    null,
  );

  return (
    <Panel className="admin-in">
      <PanelHeader
        title="Nueva categoría"
        description="Se crea al final del orden; luego la puedes subir"
        action={
          <button
            type="button"
            onClick={() => setAbierto((open) => !open)}
            className="admin-btn"
            aria-expanded={abierto}
          >
            <Plus className="size-4" strokeWidth={2} />
            {abierto ? "Cerrar" : "Crear categoría"}
          </button>
        }
      />

      {abierto && (
        <form action={formAction} className="mt-6">
          <div className="admin-rule mb-6" />
          <CategoryFields idPrefix="nueva" />
          <ActionError state={state} />
          <button
            type="submit"
            disabled={pending}
            className="admin-btn admin-btn-primary mt-6 disabled:opacity-60"
          >
            {pending ? "Creando…" : "Crear categoría"}
          </button>
        </form>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------ subcategorías */

function Subcategories({ category }: { category: CategoryWithCounts }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);

  const [altaState, altaAction, altaPending] = useActionState<
    ActionResult | null,
    FormData
  >(createSubcategoryAction, null);

  const [edicionState, edicionAction, edicionPending] = useActionState<
    ActionResult | null,
    FormData
  >(async (prev, formData) => {
    const result = await updateSubcategoryAction(prev, formData);
    if (result.ok) setEditando(null);
    return result;
  }, null);

  /** Acciones de un clic: se lanzan en transición y refrescan la vista. */
  const run = (task: () => Promise<ActionResult>) =>
    startTransition(async () => {
      const result = await task();
      setError(result.ok ? null : result.message);
      if (result.ok) router.refresh();
    });

  return (
    <div className="mt-5">
      <div className="admin-rule mb-4" />
      <p className="admin-eyebrow flex items-center gap-2">
        <Layers className="size-3.5" strokeWidth={2} />
        Subcategorías ({category.subcategories.length})
      </p>

      {category.subcategories.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {category.subcategories.map((sub, index) => (
            <li key={sub.id}>
              {editando === sub.id ? (
                <form action={edicionAction} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="id" value={sub.id} />
                  <label className="min-w-0 flex-1">
                    <span className="sr-only">Nombre de la subcategoría</span>
                    <Input name="name" defaultValue={sub.name} maxLength={80} required />
                  </label>
                  <label className="min-w-0 flex-1">
                    <span className="sr-only">Slug de la subcategoría</span>
                    <Input name="slug" defaultValue={sub.slug} maxLength={80} />
                  </label>
                  <label className="flex items-center gap-2 pb-3 text-xs">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={sub.isActive}
                      className="size-4 accent-[#d98aa6]"
                    />
                    Activa
                  </label>
                  <button
                    type="submit"
                    disabled={edicionPending}
                    className="admin-btn admin-btn-primary px-4 py-2 text-[0.82rem] disabled:opacity-60"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditando(null)}
                    className="admin-btn px-4 py-2 text-[0.82rem]"
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 rounded-2xl bg-white/45 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setEditando(sub.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="admin-title block truncate text-sm">
                      {sub.name}
                    </span>
                    <span className="admin-muted block truncate text-[0.7rem]">
                      /{sub.slug} · {sub.productCount} producto
                      {sub.productCount === 1 ? "" : "s"}
                    </span>
                  </button>

                  {!sub.isActive && <StatusPill tone="neutral">Inactiva</StatusPill>}

                  <button
                    type="button"
                    disabled={pending || index === 0}
                    onClick={() => run(() => moveSubcategoryAction(sub.id, "up"))}
                    aria-label={`Subir ${sub.name}`}
                    className="admin-icon-btn size-8 shrink-0 disabled:opacity-30"
                  >
                    <MoveUp className="size-3.5" strokeWidth={1.9} />
                  </button>
                  <button
                    type="button"
                    disabled={pending || index === category.subcategories.length - 1}
                    onClick={() => run(() => moveSubcategoryAction(sub.id, "down"))}
                    aria-label={`Bajar ${sub.name}`}
                    className="admin-icon-btn size-8 shrink-0 disabled:opacity-30"
                  >
                    <MoveDown className="size-3.5" strokeWidth={1.9} />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      run(() => toggleSubcategoryAction(sub.id, !sub.isActive))
                    }
                    aria-label={sub.isActive ? `Desactivar ${sub.name}` : `Activar ${sub.name}`}
                    className="admin-icon-btn size-8 shrink-0 disabled:opacity-30"
                  >
                    {sub.isActive ? (
                      <Eye className="size-3.5" strokeWidth={1.9} />
                    ) : (
                      <EyeOff className="size-3.5" strokeWidth={1.9} />
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => deleteSubcategoryAction(sub.id))}
                    aria-label={`Eliminar ${sub.name}`}
                    className="admin-icon-btn size-8 shrink-0 hover:text-[#b3607f] disabled:opacity-30"
                  >
                    <Trash2 className="size-3.5" strokeWidth={1.9} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <form action={altaAction} className="mt-3 flex flex-wrap items-end gap-2">
        <input type="hidden" name="categoryId" value={category.id} />
        <input type="hidden" name="isActive" value="on" />
        <label className="min-w-0 flex-1">
          <span className="sr-only">Nombre de la subcategoría nueva</span>
          <Input name="name" placeholder="Añadir subcategoría" maxLength={80} required />
        </label>
        <button
          type="submit"
          disabled={altaPending}
          className="admin-btn px-4 py-2 text-[0.82rem] disabled:opacity-60"
        >
          <Plus className="size-3.5" strokeWidth={2.2} />
          Añadir
        </button>
      </form>

      <ActionError state={altaState} />
      <ActionError state={edicionState} />
      {error && (
        <div role="alert" className="tone-rose mt-3 rounded-2xl px-4 py-3 text-xs">
          {error}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------- tarjeta de categoría */

function CategoryCard({
  category,
  index,
  total,
  share,
}: {
  category: CategoryWithCounts;
  index: number;
  total: number;
  share: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);

  const [state, formAction, formPending] = useActionState<ActionResult | null, FormData>(
    async (prev, formData) => {
      const result = await updateCategoryAction(prev, formData);
      if (result.ok) setEditando(false);
      return result;
    },
    null,
  );

  const run = (task: () => Promise<ActionResult>) =>
    startTransition(async () => {
      const result = await task();
      setError(result.ok ? null : result.message);
      if (result.ok) router.refresh();
    });

  return (
    <article
      className="admin-panel admin-in overflow-hidden"
      style={{ "--admin-delay": `${index * 0.04}s` } as React.CSSProperties}
    >
      <div className="relative aspect-[16/7] overflow-hidden bg-cream-deep">
        {category.imageUrl && (
          <Image
            src={category.imageUrl}
            alt=""
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 30vw"
            className="object-cover"
          />
        )}
        <span className="absolute left-4 top-4">
          <StatusPill tone={category.tone} plain>
            {category.slug}
          </StatusPill>
        </span>
        <span className="absolute right-4 top-4 flex gap-1.5">
          {category.comingSoon && <StatusPill tone="neutral">Muy pronto</StatusPill>}
          {!category.isActive && <StatusPill tone="neutral">Inactiva</StatusPill>}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="admin-title text-lg">{category.name}</h2>
            {category.claim && (
              <p className="admin-muted mt-1 text-sm">{category.claim}</p>
            )}
          </div>

          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              disabled={pending || index === 0}
              onClick={() => run(() => moveCategoryAction(category.id, "up"))}
              aria-label={`Subir ${category.name}`}
              className="admin-icon-btn size-9 disabled:opacity-30"
            >
              <MoveUp className="size-3.5" strokeWidth={1.9} />
            </button>
            <button
              type="button"
              disabled={pending || index === total - 1}
              onClick={() => run(() => moveCategoryAction(category.id, "down"))}
              aria-label={`Bajar ${category.name}`}
              className="admin-icon-btn size-9 disabled:opacity-30"
            >
              <MoveDown className="size-3.5" strokeWidth={1.9} />
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(() => toggleCategoryAction(category.id, !category.isActive))
              }
              aria-label={
                category.isActive
                  ? `Desactivar ${category.name}`
                  : `Activar ${category.name}`
              }
              className="admin-icon-btn size-9 disabled:opacity-30"
            >
              {category.isActive ? (
                <Eye className="size-3.5" strokeWidth={1.9} />
              ) : (
                <EyeOff className="size-3.5" strokeWidth={1.9} />
              )}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => deleteCategoryAction(category.id))}
              aria-label={`Eliminar ${category.name}`}
              className="admin-icon-btn size-9 hover:text-[#b3607f] disabled:opacity-30"
            >
              <Trash2 className="size-3.5" strokeWidth={1.9} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <span>
            <span className="admin-eyebrow block">Productos</span>
            <span className="admin-title mt-1 block text-xl">{category.totalCount}</span>
          </span>
          <span className="text-right">
            <span className="admin-eyebrow block">Valor</span>
            <span className="admin-title mt-1 block text-sm">
              {formatCOP(category.stockValue)}
            </span>
          </span>
        </div>

        <Meter value={share} tone={category.tone} className="mt-4" />
        <p className="admin-muted mt-2 text-xs">
          {share.toFixed(0)}% del catálogo · {category.productCount} publicados
        </p>

        {error && (
          <div role="alert" className="tone-rose mt-3 rounded-2xl px-4 py-3 text-xs">
            {error}
          </div>
        )}

        <Subcategories category={category} />

        <div className="admin-rule mt-5" />
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditando((open) => !open)}
            aria-expanded={editando}
            className="admin-btn flex-1 px-4 py-2 text-[0.82rem]"
          >
            <ChevronDown
              className={`size-3.5 transition-transform duration-400 ${editando ? "rotate-180" : ""}`}
              strokeWidth={2}
            />
            {editando ? "Cerrar" : "Editar"}
          </button>
          <Link
            href={`/admin/productos?categoria=${category.slug}`}
            className="admin-btn flex-1 px-4 py-2 text-center text-[0.82rem]"
          >
            Sus productos
          </Link>
        </div>

        {editando && (
          <form action={formAction} className="mt-5">
            <input type="hidden" name="id" value={category.id} />
            <CategoryFields category={category} idPrefix={`cat-${category.id}`} />
            <ActionError state={state} />
            <button
              type="submit"
              disabled={formPending}
              className="admin-btn admin-btn-primary mt-5 disabled:opacity-60"
            >
              {formPending ? "Guardando…" : "Guardar cambios"}
            </button>
          </form>
        )}
      </div>
    </article>
  );
}

/* --------------------------------------------------------------------- raíz */

export function CategoriesManager({
  categories,
}: {
  categories: CategoryWithCounts[];
}) {
  const total = categories.reduce((sum, category) => sum + category.totalCount, 0);

  return (
    <>
      <NewCategory />

      {categories.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              total={categories.length}
              share={total ? (category.totalCount / total) * 100 : 0}
            />
          ))}
        </div>
      )}
    </>
  );
}
