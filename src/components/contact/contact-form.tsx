"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

const schema = z.object({
  name: z.string().min(3, "¿Cómo te llamas?"),
  email: z.string().min(1, "Necesitamos tu correo para responderte").email("Revisa el correo"),
  phone: z.string().optional(),
  topic: z.string().min(1, "Elige un tema"),
  message: z
    .string()
    .min(10, "Cuéntanos un poquito más (mínimo 10 caracteres)")
    .max(1000, "Máximo 1000 caracteres"),
});

type Values = z.infer<typeof schema>;

const topics = [
  "Una pregunta sobre un producto",
  "El estado de mi pedido",
  "Cambios o devoluciones",
  "Pedidos al por mayor",
  "Colaboraciones y prensa",
  "Otra cosita",
];

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { topic: "" } });

  const onSubmit = async (values: Values) => {
    // Punto de integración: enviar a Resend / Formspree / API propia.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("¡Mensaje enviado! Te respondemos muy pronto 💌", { id: "contact" });
    setSent(true);
    return values;
  };

  if (sent) {
    return (
      <div
        className="cute-in rounded-[2.5rem] bg-white/72 p-10 text-center ring-1 ring-white/80 backdrop-blur-xl md:p-14"
        style={
          {
            "--in-scale": "0.94",
            "--in-blur": "12px",
            "--in-duration": "0.75s",
          } as React.CSSProperties
        }
      >
        <p
          className="text-5xl"
          aria-hidden
          style={
            {
              animation: "bobY 3s ease-in-out infinite",
              "--bob": "-12px",
            } as React.CSSProperties
          }
        >
          💌
        </p>
        <h2 className="mt-6 font-display text-2xl text-ink md:text-3xl">
          ¡Recibido! Te escribimos pronto
        </h2>
        <p className="mx-auto mt-3.5 max-w-md leading-relaxed text-ink-soft">
          Te responderemos al correo que nos dejaste. Si prefieres algo más
          directo, escríbenos por WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-[2.5rem] bg-white/68 p-8 ring-1 ring-white/78 backdrop-blur-xl md:p-10"
    >
      <h2 className="font-display text-2xl text-ink">Escríbenos</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Cuéntanos qué necesitas y te respondemos por correo.
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Tu nombre" htmlFor="c-name" required error={errors.name?.message}>
          <Input
            id="c-name"
            autoComplete="name"
            placeholder="Tu nombre y apellido"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </Field>

        <Field label="Tu correo" htmlFor="c-email" required error={errors.email?.message}>
          <Input
            id="c-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field
          label="Celular"
          htmlFor="c-phone"
          hint="Opcional, si prefieres que te escribamos por WhatsApp"
        >
          <Input
            id="c-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="300 000 0000"
            {...register("phone")}
          />
        </Field>

        <Field label="Tema" htmlFor="c-topic" required error={errors.topic?.message}>
          <Select id="c-topic" aria-invalid={!!errors.topic} {...register("topic")}>
            <option value="">¿De qué se trata?</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Tu mensaje"
          htmlFor="c-message"
          required
          error={errors.message?.message}
          className="sm:col-span-2"
        >
          <Textarea
            id="c-message"
            rows={5}
            placeholder="Hola, quería saber si tienen disponible…"
            aria-invalid={!!errors.message}
            {...register("message")}
          />
        </Field>
      </div>

      <Button type="submit" size="lg" className="mt-7 w-full sm:w-auto" disabled={isSubmitting}>
        <Send className="size-4.5" strokeWidth={1.9} />
        {isSubmitting ? "Enviando…" : "Enviar mensaje"}
      </Button>

      <p className="mt-4 text-xs leading-relaxed text-ink-muted">
        Usamos tus datos solo para responderte. Puedes leer nuestra política de
        privacidad si quieres el detalle completo.
      </p>
    </form>
  );
}
