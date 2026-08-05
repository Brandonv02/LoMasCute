"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

const schema = z.object({
  email: z
    .string()
    .min(1, "Escribe tu correo para poder avisarte")
    .email("Ese correo no se ve bien, revísalo"),
  name: z.string().optional(),
});

type Values = z.infer<typeof schema>;

/** Único trozo de cliente del bloque Club Cute: el formulario. */
export function NewsletterForm() {
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

  if (done) {
    return (
      <div
        className="cute-in rounded-[2rem] bg-white/85 p-8 text-center shadow-soft ring-1 ring-white/80"
        style={
          {
            "--in-scale": "0.94",
            "--in-duration": "0.6s",
          } as React.CSSProperties
        }
      >
        <p
          className="text-4xl"
          aria-hidden
          style={{ animation: "letterWiggle 4s ease-in-out infinite" }}
        >
          💌
        </p>
        <p className="mt-4 font-display text-xl text-ink">¡Bienvenida al club!</p>
        <p className="mt-2 text-sm text-ink-soft">
          Revisa tu correo, ahí va tu cupón de bienvenida.
        </p>
      </div>
    );
  }

  return (
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
  );
}
