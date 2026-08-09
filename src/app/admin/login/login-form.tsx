"use client";

import { useActionState } from "react";
import { ArrowRight, Lock, Mail, TriangleAlert } from "lucide-react";
import { signInAction, type LoginResult } from "@/app/admin/actions";
import { Input, Label } from "@/components/ui/field";

/**
 * El formulario de acceso.
 *
 * Es la única parte de la pantalla que necesita cliente: el resto —marca,
 * atmósfera, textos— se sigue pintando en el servidor. El marcado es el mismo
 * que tenía la maqueta; lo que cambia es que ahora el envío va a Supabase Auth
 * en vez de navegar directamente al panel.
 */
export function LoginForm({ volver = "" }: { volver?: string }) {
  const [state, formAction, pending] = useActionState<LoginResult, FormData>(
    signInAction,
    null,
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      {/* A dónde ir después de entrar; el servidor solo acepta rutas de /admin */}
      <input type="hidden" name="volver" value={volver} />

      <div>
        <Label htmlFor="admin-email">Correo</Label>
        <div className="relative">
          <Mail
            aria-hidden
            className="admin-muted pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2"
            strokeWidth={1.9}
          />
          <Input
            id="admin-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(state)}
            placeholder="tucorreo@tutienda.co"
            className="pl-11"
          />
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor="admin-password">Contraseña</Label>
          <span className="admin-muted mb-2 text-xs">¿La olvidaste?</span>
        </div>
        <div className="relative">
          <Lock
            aria-hidden
            className="admin-muted pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2"
            strokeWidth={1.9}
          />
          <Input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(state)}
            placeholder="••••••••••"
            className="pl-11"
          />
        </div>
      </div>

      <label className="admin-soft flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="remember"
          defaultChecked
          className="size-4 rounded-md accent-[#F8B6C8]"
        />
        Mantener la sesión abierta
      </label>

      {state && (
        <p
          role="alert"
          className="tone-rose flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="admin-btn admin-btn-primary mt-1 h-12 text-[0.95rem] disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar al panel"}
        <ArrowRight className="size-4" strokeWidth={2} />
      </button>
    </form>
  );
}
