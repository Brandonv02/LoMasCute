"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import {
  CONTACT_LIMITS,
  CONTACT_TOPICS,
  HONEYPOT_FIELD,
  contactSubmissionSchema,
  type ContactSubmission,
} from "@/lib/contact";
import { submitContactMessage } from "@/app/actions/contact";

/**
 * Formulario de contacto.
 *
 * El esquema de validación es el mismo que usa el servidor
 * (`src/lib/contact.ts`): aquí sirve para avisar mientras se escribe, allí para
 * no creerse lo que llega. Al enviar, el mensaje se guarda en
 * `contact_messages` y aparece en /admin/mensajes.
 *
 * Si el envío falla, el formulario **no** se vacía ni se cambia por la pantalla
 * de éxito: lo que se escribió sigue ahí para volver a intentarlo. Perder un
 * mensaje ya redactado por un fallo de red es la peor forma de fallar aquí.
 */
export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactSubmission>({
    resolver: zodResolver(contactSubmissionSchema),
    defaultValues: { topic: "" },
  });

  const onSubmit = async (values: ContactSubmission) => {
    setFailure(null);

    const result = await submitContactMessage(values);

    if (!result.ok) {
      setFailure(result.message);
      toast.error(result.message, { id: "contact" });
      return;
    }

    toast.success("¡Mensaje enviado! Te respondemos muy pronto 💌", { id: "contact" });
    setSent(true);
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
          className="decor-bob decor-loop text-5xl"
          aria-hidden
          style={
            {
              "--bob": "-12px",
              "--bob-duration": "3s",
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
            maxLength={CONTACT_LIMITS.name}
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
            maxLength={CONTACT_LIMITS.email}
            placeholder="tucorreo@ejemplo.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field
          label="Celular"
          htmlFor="c-phone"
          hint="Opcional, si prefieres que te escribamos por WhatsApp"
          error={errors.phone?.message}
        >
          <Input
            id="c-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={CONTACT_LIMITS.phone}
            placeholder="300 000 0000"
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
        </Field>

        <Field label="Tema" htmlFor="c-topic" required error={errors.topic?.message}>
          <Select id="c-topic" aria-invalid={!!errors.topic} {...register("topic")}>
            <option value="">¿De qué se trata?</option>
            {CONTACT_TOPICS.map((topic) => (
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
            maxLength={CONTACT_LIMITS.message}
            placeholder="Hola, quería saber si tienen disponible…"
            aria-invalid={!!errors.message}
            {...register("message")}
          />
        </Field>
      </div>

      {/*
        Trampa para robots. Nadie la ve —está fuera de la pantalla, oculta al
        lector de pantalla y fuera del orden de tabulación— pero un bot que
        rellena todos los campos de la página sí la completa, y entonces el
        servidor descarta el envío sin decirle por qué.

        Va con estilo en línea y no con `sr-only`: esa clase la deja anunciable
        por lectores de pantalla, y una persona ciega no puede caer en una
        trampa pensada para robots.
      */}
      <div aria-hidden style={{ position: "absolute", left: "-9999px" }}>
        <label htmlFor="c-website">No rellenes este campo</label>
        <input
          id="c-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register(HONEYPOT_FIELD)}
        />
      </div>

      {failure && (
        <p
          role="alert"
          className="mt-6 rounded-2xl bg-[#fdeef2] px-5 py-4 text-sm leading-relaxed text-[#b3607f] ring-1 ring-[#d98aa6]/30"
        >
          {failure}
        </p>
      )}

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
