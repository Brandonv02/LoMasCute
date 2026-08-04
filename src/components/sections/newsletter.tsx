"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Reveal } from "@/components/motion/reveal";
import { Twinkles } from "@/components/atmosphere/ambient";

const schema = z.object({
  email: z
    .string()
    .min(1, "Escribe tu correo para poder avisarte")
    .email("Ese correo no se ve bien, revísalo"),
  name: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function Newsletter() {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    // Punto de integración: aquí va la llamada a Mailchimp / Klaviyo / API propia.
    await new Promise((resolve) => setTimeout(resolve, 900));
    toast.success("¡Listo! Te escribimos pronto 💌", { id: "newsletter" });
    setDone(true);
    return values;
  };

  return (
    <Reveal kind="blur" className="relative scroll-mt-28" id="club-cute">
      <div className="grain relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/80 via-rose-mist/70 to-lavender-soft/70 p-8 shadow-soft ring-1 ring-white/80 backdrop-blur-xl md:p-14">
        <Twinkles count={10} />

        {/* Manchas de luz */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 size-64 animate-drift rounded-full bg-[radial-gradient(circle,rgba(248,182,200,0.5),transparent_68%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-12 size-72 animate-drift rounded-full bg-[radial-gradient(circle,rgba(191,220,213,0.45),transparent_68%)] blur-2xl [animation-delay:-8s]"
        />

        <div className="relative grid items-center gap-9 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 font-display text-xs uppercase tracking-[0.2em] text-ink-soft shadow-petal">
              <Sparkles className="size-3.5 text-gold" strokeWidth={2} />
              Club Cute
            </span>
            <h2 className="mt-5 font-display text-3xl leading-[1.1] text-ink md:text-[2.6rem]">
              Entérate primero de{" "}
              <span className="text-gradient">lo nuevo y lo lindo</span>
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink-soft">
              Lanzamientos, restocks y un cupón de bienvenida del 10%. Escribimos
              poquito y solo cuando vale la pena.
            </p>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
              {["10% en tu primera compra", "Acceso anticipado", "Sin spam, prometido"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span aria-hidden className="text-rose">
                      ♡
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[2rem] bg-white/85 p-8 text-center shadow-soft ring-1 ring-white/80"
            >
              <motion.p
                className="text-4xl"
                aria-hidden
                animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.12, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.6 }}
              >
                💌
              </motion.p>
              <p className="mt-4 font-display text-xl text-ink">¡Bienvenida al club!</p>
              <p className="mt-2 text-sm text-ink-soft">
                Revisa tu correo, ahí va tu cupón de bienvenida.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="rounded-[2rem] bg-white/72 p-6 shadow-soft ring-1 ring-white/80 md:p-7"
            >
              <div className="space-y-3">
                <div>
                  <label htmlFor="nl-name" className="sr-only">
                    Tu nombre
                  </label>
                  <Input
                    id="nl-name"
                    placeholder="Tu nombre (opcional)"
                    autoComplete="given-name"
                    {...register("name")}
                  />
                </div>
                <div>
                  <label htmlFor="nl-email" className="sr-only">
                    Tu correo
                  </label>
                  <Input
                    id="nl-email"
                    type="email"
                    inputMode="email"
                    placeholder="tucorreo@ejemplo.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "nl-email-error" : undefined}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p id="nl-email-error" role="alert" className="mt-2 text-sm text-[#b3607f]">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" size="lg" className="mt-4 w-full" disabled={isSubmitting}>
                {isSubmitting ? "Un momentito…" : "Quiero mi 10%"}
              </Button>

              <p className="mt-3 text-center text-xs text-ink-muted">
                Al suscribirte aceptas nuestra política de privacidad. Puedes salirte
                cuando quieras.
              </p>
            </form>
          )}
        </div>
      </div>
    </Reveal>
  );
}
