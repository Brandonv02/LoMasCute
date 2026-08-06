import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { storeLabel } from "@/lib/site-settings";
import { getSiteSettings } from "@/services/site-settings";
import { Aurora, PetalDivider, Twinkles } from "@/components/atmosphere/ambient";
import { Input, Label } from "@/components/ui/field";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Entrar",
    description: `Acceso al panel de ${storeLabel(await getSiteSettings())}.`,
  };
}

/**
 * Pantalla de acceso.
 *
 * No hay autenticación: el botón entra directo al panel. La pantalla existe
 * para que el módulo tenga su puerta y para fijar el tono — un panel puede ser
 * serio y seguir siendo bonito.
 */
export default async function AdminLoginPage() {
  const settings = await getSiteSettings();
  const name = storeLabel(settings);
  const owner = settings.legalName || settings.storeName;

  return (
    <div className="admin-shell grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Escenario de marca */}
      <aside
        className="relative isolate hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12"
        style={{ background: "var(--admin-canvas-deep)" }}
      >
        <Aurora intensity={0.7} />
        <Twinkles count={14} />

        <div className="relative">
          <Image
            src="/brand/logo-lo-mas-cute.png"
            alt={name}
            width={320}
            height={320}
            priority
            sizes="200px"
            className="h-16 w-auto"
          />
        </div>

        <div className="relative max-w-md">
          <span className="admin-pill tone-gold admin-pill-plain gap-2 px-4 py-1.5">
            <Sparkles className="size-3.5" strokeWidth={2} />
            Panel de administración
          </span>
          <h2 className="admin-title mt-6 text-[2.6rem] leading-[1.08]">
            Todo lo lindo,{" "}
            <span className="text-gradient">bajo control</span>
          </h2>
          <p className="admin-soft mt-4 leading-relaxed">
            Pedidos, inventario, clientas y catálogo en un solo lugar. La misma
            calma de la tienda, ahora del lado de quien la atiende.
          </p>

          <PetalDivider className="mt-8 max-w-xs" />
        </div>

        <p className="admin-muted relative text-xs">
          © {new Date().getFullYear()}
          {owner && ` ${owner}`}
          {settings.storeCity && ` · Hecho en ${settings.storeCity}`}
        </p>
      </aside>

      {/* Formulario */}
      <main className="relative flex items-center justify-center px-5 py-14 sm:px-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Image
              src="/brand/logo-lo-mas-cute.png"
              alt={name}
              width={280}
              height={280}
              priority
              sizes="160px"
              className="mx-auto h-14 w-auto"
            />
          </div>

          <div className="admin-panel admin-in mt-8 p-8 sm:p-10 lg:mt-0">
            <p className="admin-eyebrow">Bienvenida de vuelta</p>
            <h1 className="admin-title mt-2.5 text-[1.9rem] leading-tight">
              Entrar al panel
            </h1>
            <p className="admin-soft mt-2 text-sm leading-relaxed">
              Usa la cuenta del equipo de {name}.
            </p>

            <form className="mt-8 flex flex-col gap-5" action="/admin/dashboard">
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
                    placeholder="••••••••••"
                    defaultValue="demostracion"
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

              {/* Sin autenticación: el envío simplemente lleva al panel */}
              <Link
                href="/admin/dashboard"
                className="admin-btn admin-btn-primary mt-1 h-12 text-[0.95rem]"
              >
                Entrar al panel
                <ArrowRight className="size-4" strokeWidth={2} />
              </Link>
            </form>

            <div className="admin-rule my-7" />

            <p className="admin-muted flex items-start gap-2.5 text-xs leading-relaxed">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-mint" strokeWidth={1.9} />
              Módulo de demostración: no hay autenticación ni base de datos
              conectadas. Cualquier dato que veas dentro es simulado.
            </p>
          </div>

          <p className="admin-muted mt-6 text-center text-xs">
            <Link href="/" className="underline decoration-rose/50 underline-offset-4">
              Volver a la tienda
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
