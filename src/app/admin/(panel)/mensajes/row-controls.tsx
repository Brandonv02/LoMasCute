"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";
import type { ContactStatus } from "@/lib/supabase/types";
import { CONTACT_STATUSES } from "@/lib/supabase/types";
import {
  deleteContactMessageAction,
  setContactStatusAction,
} from "@/app/admin/(panel)/mensajes/actions";
import { CONTACT_STATUS_META } from "@/app/admin/(panel)/mensajes/message-meta";
import { cn } from "@/lib/utils";

/**
 * Controles en línea de la bandeja de mensajes.
 *
 * Islas de cliente dentro de una tabla que se renderiza en el servidor: cada
 * fila hidrata sus dos controles, no la tabla entera.
 */

function Failure({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <span role="alert" className="mt-1 block text-[0.7rem] text-[#b3607f]">
      {message}
    </span>
  );
}

const STATUS_TONE: Record<ContactStatus, string> = {
  nuevo: "tone-rose",
  leido: "tone-gold",
  respondido: "tone-mint",
  archivado: "tone-neutral",
};

export function ContactStatusSelect({
  id,
  status,
}: {
  id: string;
  status: ContactStatus;
}) {
  const [value, setValue] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const change = (next: ContactStatus) => {
    const previous = value;
    setValue(next);
    setError(null);
    startTransition(async () => {
      const result = await setContactStatusAction(id, next);
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
        onChange={(event) => change(event.target.value as ContactStatus)}
        aria-label="Estado del mensaje"
        className={cn(
          "admin-pill admin-pill-plain cursor-pointer appearance-none border-0 py-1 pl-3 pr-3 outline-none transition-opacity",
          STATUS_TONE[value],
          pending && "opacity-50",
        )}
      >
        {CONTACT_STATUSES.map((option) => (
          <option key={option} value={option}>
            {CONTACT_STATUS_META[option].label}
          </option>
        ))}
      </select>
      <Failure message={error} />
    </span>
  );
}

export function MessageRowActions({ id, name }: { id: string; name: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const remove = () => {
    const confirmed = window.confirm(
      `¿Eliminar el mensaje de ${name}? No se puede deshacer. Si solo quieres sacarlo de la bandeja, archívalo.`,
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteContactMessageAction(id);
      if (!result.ok) setError(result.message);
    });
  };

  return (
    <span className="inline-block text-right">
      <span className="inline-flex items-center gap-1.5">
        <Link
          href={`/admin/mensajes/${id}`}
          aria-label={`Leer el mensaje de ${name}`}
          className="admin-icon-btn size-8"
        >
          <Eye className="size-3.5" strokeWidth={1.9} />
        </Link>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label={`Eliminar el mensaje de ${name}`}
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
 * Cambiar estado desde la ficha.
 *
 * Botones y no un desplegable: en la ficha se está leyendo el mensaje, y lo que
 * se quiere es marcar «respondido» de un clic, no abrir una lista.
 */
export function MessageStatusButtons({
  id,
  status,
}: {
  id: string;
  status: ContactStatus;
}) {
  const [value, setValue] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const change = (next: ContactStatus) => {
    if (next === value) return;
    const previous = value;
    setValue(next);
    setError(null);
    startTransition(async () => {
      const result = await setContactStatusAction(id, next);
      if (!result.ok) {
        setValue(previous);
        setError(result.message);
      }
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {CONTACT_STATUSES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => change(option)}
            disabled={pending}
            aria-pressed={value === option}
            className={cn(
              "admin-btn px-4 py-2 text-[0.82rem] disabled:opacity-40",
              value === option && "admin-btn-primary",
            )}
          >
            {CONTACT_STATUS_META[option].label}
          </button>
        ))}
      </div>
      <Failure message={error} />
    </div>
  );
}

/** Eliminar desde la ficha: al terminar hay que salir, el mensaje ya no existe. */
export function DeleteMessageButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const remove = () => {
    const confirmed = window.confirm(
      `¿Eliminar el mensaje de ${name}? No se puede deshacer. Si solo quieres sacarlo de la bandeja, archívalo.`,
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteContactMessageAction(id);
      if (result.ok) router.push("/admin/mensajes?eliminado=1");
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
        {pending ? "Eliminando…" : "Eliminar mensaje"}
      </button>
      <Failure message={error} />
    </span>
  );
}
