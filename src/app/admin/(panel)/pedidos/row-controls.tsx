"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";
import type { OrderStatus } from "@/lib/supabase/types";
import { ORDER_STATUSES } from "@/lib/supabase/types";
import {
  deleteOrderAction,
  setOrderStatusAction,
} from "@/app/admin/(panel)/pedidos/actions";
import { ORDER_STATUS_META } from "@/app/admin/(panel)/pedidos/order-meta";
import { cn } from "@/lib/utils";

/**
 * Controles en línea de la tabla de ventas.
 *
 * Son islas de cliente dentro de una tabla que se renderiza en el servidor:
 * cada fila solo hidrata sus dos controles, no la tabla entera.
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

const STATUS_TONE: Record<OrderStatus, string> = {
  pendiente: "tone-gold",
  pagado: "tone-mint",
  entregado: "tone-lavender",
  cancelado: "tone-neutral",
};

export function OrderStatusSelect({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const [value, setValue] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const change = (next: OrderStatus) => {
    const previous = value;
    setValue(next);
    setError(null);
    startTransition(async () => {
      const result = await setOrderStatusAction(id, next);
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
        onChange={(event) => change(event.target.value as OrderStatus)}
        aria-label="Estado de la venta"
        className={cn(
          "admin-pill admin-pill-plain cursor-pointer appearance-none border-0 py-1 pl-3 pr-3 outline-none transition-opacity",
          STATUS_TONE[value],
          pending && "opacity-50",
        )}
      >
        {ORDER_STATUSES.map((option) => (
          <option key={option} value={option}>
            {ORDER_STATUS_META[option].label}
          </option>
        ))}
      </select>
      <Failure message={error} />
    </span>
  );
}

export function OrderRowActions({ id, code }: { id: string; code: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const remove = () => {
    const confirmed = window.confirm(
      `¿Eliminar la venta ${code}? Se devolverá al inventario el stock de sus productos y no se puede deshacer.`,
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteOrderAction(id);
      if (!result.ok) setError(result.message);
    });
  };

  return (
    <span className="inline-block text-right">
      <span className="inline-flex items-center gap-1.5">
        <Link
          href={`/admin/pedidos/${id}`}
          aria-label={`Ver la venta ${code}`}
          className="admin-icon-btn size-8"
        >
          <Eye className="size-3.5" strokeWidth={1.9} />
        </Link>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label={`Eliminar la venta ${code}`}
          className="admin-icon-btn size-8 hover:text-[#b3607f] disabled:opacity-40"
        >
          <Trash2 className="size-3.5" strokeWidth={1.9} />
        </button>
      </span>
      <Failure message={error} />
    </span>
  );
}

/**
 * Eliminar desde la ficha. Igual que en la tabla, pero al terminar hay que
 * salir: la venta que se estaba viendo ya no existe.
 */
export function DeleteOrderButton({ id, code }: { id: string; code: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const remove = () => {
    const confirmed = window.confirm(
      `¿Eliminar la venta ${code}? Se devolverá al inventario el stock de sus productos y no se puede deshacer.`,
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteOrderAction(id);
      if (result.ok) router.push("/admin/pedidos");
      else setError(result.message);
    });
  };

  return (
    <span className="inline-block">
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="admin-btn hover:text-[#b3607f] disabled:opacity-40"
      >
        <Trash2 className="size-4" strokeWidth={1.9} />
        {pending ? "Eliminando…" : "Eliminar venta"}
      </button>
      <Failure message={error} />
    </span>
  );
}
