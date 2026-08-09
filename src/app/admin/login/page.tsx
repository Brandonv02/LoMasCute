import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import { storeLabel } from "@/lib/site-settings";
import { getSiteSettings } from "@/services/site-settings";
import { Aurora, PetalDivider, Twinkles } from "@/components/atmosphere/ambient";
import { LoginForm } from "@/app/admin/login/login-form";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Entrar",
    description: `Acceso al panel de ${storeLabel(await getSiteSettings())}.`,
  };
}

/**
 * Pantalla de acceso.
 *
 * La identidad la resuelve Supabase Auth (ver `src/app/admin/actions.ts`); el
 * middleware manda aquí a quien no tenga sesión y devuelve al panel a quien sí.
 * Esta pantalla solo pone la marca y el formulario.
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string }>;
}) {
  const { volver } = await searchParams;
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

            <LoginForm volver={volver ?? ""} />

            <div className="admin-rule my-7" />

            <p className="admin-muted flex items-start gap-2.5 text-xs leading-relaxed">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-mint" strokeWidth={1.9} />
              El acceso lo gestiona Supabase Auth. Las cuentas las crea el
              equipo desde Supabase: aquí no hay registro público.
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
