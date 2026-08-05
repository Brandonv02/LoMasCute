"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Minus, Pencil, Plus, Trash2 } from "lucide-react";
import type { ProductStatus } from "@/lib/supabase/types";
import {
  deleteProductAction,
  setProductStatusAction,
  setProductStockAction,
  type ActionResult,
} from "@/app/admin/(panel)/productos/actions";
import { cn } from "@/lib/utils";

/**
 * Controles en línea de la tabla de productos.
 *
 * Son islas de cliente dentro de una tabla que se renderiza en el servidor:
 * cada fila solo hidrata sus tres controles, no la tabla entera.
 */

/** Mensaje de error de una acción rápida, pegado al control que falló. */
function Failure({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <span role="alert" className="mt-1 block text-[0.7rem] text-[#b3607f]">
      {message}
    </span>
  );
}

const STATUS_LABEL: Record<ProductStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

const STATUS_TONE: Record<ProductStatus, string> = {
  draft: "tone-gold",
  published: "tone-mint",
  archived: "tone-neutral",
};

export function StatusSelect({
  id,
  status,
}: {
  id: string;
  status: ProductStatus;
}) {
  const [value, setValue] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const change = (next: ProductStatus) => {
    const previous = value;
    setValue(next);
    setError(null);
    startTransition(async () => {
      const result = await setProductStatusAction(id, next);
      if (!result.ok) {
        setValue(previous);
        setError(result.message);
      }
    });
  };

  return (
    <span className="inline-block">
      <select
        value={value}
        disabled={pending}
        onChange={(event) => change(event.target.value as ProductStatus)}
        aria-label="Estado del producto"
        className={cn(
          "admin-pill admin-pill-plain cursor-pointer appearance-none border-0 py-1 pl-3 pr-3 outline-none transition-opacity",
          STATUS_TONE[value],
          pending && "opacity-50",
        )}
      >
        {(Object.keys(STATUS_LABEL) as ProductStatus[]).map((option) => (
          <option key={option} value={option}>
            {STATUS_LABEL[option]}
          </option>
        ))}
      </select>
      <Failure message={error} />
    </span>
  );
}

export function StockStepper({ id, stock }: { id: string; stock: number }) {
  const [value, setValue] = useState(stock);
  const [draft, setDraft] = useState(String(stock));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const commit = (next: number) => {
    if (!Number.isInteger(next) || next < 0) {
      setDraft(String(value));
      return;
    }
    if (next === value) return;

    const previous = value;
    setValue(next);
    setDraft(String(next));
    setError(null);
    startTransition(async () => {
      const result = await setProductStockAction(id, next);
      if (!result.ok) {
        setValue(previous);
        setDraft(String(previous));
        setError(result.message);
      }
    });
  };

  return (
    <span className="inline-block">
      <span className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => commit(value - 1)}
          disabled={pending || value === 0}
          aria-label="Quitar una unidad"
          className="admin-icon-btn size-7 disabled:opacity-35"
        >
          <Minus className="size-3.5" strokeWidth={2.2} />
        </button>

        <input
          type="text"
          inputMode="numeric"
          value={draft}
          disabled={pending}
          onChange={(event) => setDraft(event.target.value.replace(/[^\d]/g, ""))}
          onBlur={() => commit(Number(draft || value))}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") setDraft(String(value));
          }}
          aria-label="Unidades en existencia"
          className="admin-input w-14 px-2 py-1 text-center text-[0.82rem]"
        />

        <button
          type="button"
          onClick={() => commit(value + 1)}
          disabled={pending}
          aria-label="Agregar una unidad"
          className="admin-icon-btn size-7"
        >
          <Plus className="size-3.5" strokeWidth={2.2} />
        </button>
      </span>
      <Failure message={error} />
    </span>
  );
}

export function RowActions({ id, name }: { id: string; name: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const remove = () => {
    const confirmed = window.confirm(
      `¿Eliminar "${name}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result: ActionResult = await deleteProductAction(id);
      if (!result.ok) setError(result.message);
    });
  };

  return (
    <span className="inline-block text-right">
      <span className="inline-flex items-center gap-1.5">
        <Link
          href={`/admin/productos/${id}`}
          aria-label={`Editar ${name}`}
          className="admin-icon-btn size-8"
        >
          <Pencil className="size-3.5" strokeWidth={1.9} />
        </Link>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label={`Eliminar ${name}`}
          className="admin-icon-btn size-8 hover:text-[#b3607f] disabled:opacity-40"
        >
          <Trash2 className="size-3.5" strokeWidth={1.9} />
        </button>
      </span>
      <Failure message={error} />
    </span>
  );
}
