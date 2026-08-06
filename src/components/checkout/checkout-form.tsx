"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  Gift,
  Lock,
  Mail,
  MapPin,
  Truck,
  User,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useSiteSettings } from "@/components/site-settings-provider";
import {
  storeLabel,
  whatsappUrl,
  type SiteSettingsView,
} from "@/lib/site-settings";
import { cn, formatCOP } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { WhatsappIcon } from "@/components/ui/social-icons";
import { Reveal } from "@/components/motion/reveal";

/** Cuando el panel no tiene medios de pago, el pedido se coordina después. */
const PAYMENT_TO_ARRANGE = "Por coordinar";

/**
 * Compra sin crear cuenta. Solo pedimos lo indispensable para entregar
 * el pedido; el correo es obligatorio porque es el canal de confirmación.
 */
const schema = z.object({
  name: z
    .string()
    .min(3, "Escribe tu nombre completo")
    .max(70, "Ese nombre es muy largo"),
  email: z
    .string()
    .min(1, "El correo es obligatorio: ahí te enviamos la confirmación")
    .email("Revisa el correo, parece que le falta algo"),
  phone: z
    .string()
    .min(7, "Escribe tu celular para coordinar la entrega")
    .regex(/^[0-9+()\s-]+$/, "El celular solo puede tener números"),
  address: z.string().min(6, "Escribe la dirección completa con número"),
  neighborhood: z.string().min(1, "Selecciona tu barrio"),
  payment: z.string().min(1, "Elige un método de pago"),
  notes: z.string().max(400, "Máximo 400 caracteres").optional(),
  isGift: z.boolean().optional(),
});

type Values = z.infer<typeof schema>;

export function CheckoutForm() {
  const { lines, lineKey, subtotal, shipping, total, count, shippingKnown, clearCart } =
    useStore();
  const settings = useSiteSettings();
  const [orderId, setOrderId] = useState<string | null>(null);

  const payments = settings.paymentMethods;
  const neighborhoods = settings.shippingNeighborhoods;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      payment: payments[0] ?? PAYMENT_TO_ARRANGE,
      neighborhood: "",
    },
  });

  const selectedPayment = watch("payment");
  const isGift = watch("isGift");

  // El pedido por WhatsApp solo existe si hay un número guardado en el panel.
  const whatsappOrder = whatsappUrl(
    settings.whatsappNumber,
    `¡Hola ${storeLabel(settings)}! 🌸 Quiero hacer un pedido:\n\n${lines
      .map((l) => `• ${l.quantity} × ${l.name}${l.shade ? ` (${l.shade})` : ""}`)
      .join("\n")}\n\nTotal aprox: ${formatCOP(total)}`,
  );

  const onSubmit = async (values: Values) => {
    // Punto de integración: aquí se crea el pedido en el backend y se
    // dispara el correo de confirmación. Hoy simulamos la respuesta.
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const id = `LMC-${Math.floor(100000 + Math.random() * 899999)}`;
    setOrderId(id);
    toast.success("¡Pedido recibido! Revisa tu correo 💌", { id: "order" });
    clearCart();
    return values;
  };

  if (orderId) {
    return <OrderConfirmation orderId={orderId} settings={settings} />;
  }

  if (count === 0) {
    return (
      <div className="container-cute">
        <div className="mx-auto max-w-lg rounded-[2.5rem] bg-white/62 p-12 text-center ring-1 ring-white/75 backdrop-blur-md">
          <p className="text-5xl" aria-hidden>
            🛍️
          </p>
          <h2 className="mt-5 font-display text-2xl text-ink">
            Tu bolsa está vacía
          </h2>
          <p className="mt-2.5 text-ink-soft">
            Agrega algo lindo y vuelve, aquí te esperamos.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/tienda">Ir a la tienda</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-cute">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12"
      >
        {/* Datos */}
        <div className="space-y-6">
          <Reveal kind="up">
            <fieldset className="rounded-[2rem] bg-white/62 p-7 ring-1 ring-white/75 backdrop-blur-md md:p-8">
              <legend className="sr-only">Tus datos</legend>
              <StepTitle icon={User} step={1}>
                Tus datos
              </StepTitle>
              <p className="mb-6 text-sm text-ink-soft">
                No necesitas crear cuenta. Solo esto y listo.
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Nombre completo"
                  htmlFor="name"
                  required
                  error={errors.name?.message}
                  className="sm:col-span-2"
                >
                  <Input
                    id="name"
                    autoComplete="name"
                    placeholder="Tu nombre y apellido"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                  />
                </Field>

                <Field
                  label="Correo electrónico"
                  htmlFor="email"
                  required
                  error={errors.email?.message}
                  hint="Aquí te llega la confirmación del pedido"
                >
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="tucorreo@ejemplo.com"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                </Field>

                <Field
                  label="Celular / WhatsApp"
                  htmlFor="phone"
                  required
                  error={errors.phone?.message}
                  hint="Para coordinar la entrega"
                >
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="300 000 0000"
                    aria-invalid={!!errors.phone}
                    {...register("phone")}
                  />
                </Field>
              </div>
            </fieldset>
          </Reveal>

          <Reveal kind="up" delay={0.08}>
            <fieldset className="rounded-[2rem] bg-white/62 p-7 ring-1 ring-white/75 backdrop-blur-md md:p-8">
              <legend className="sr-only">Dirección de entrega</legend>
              <StepTitle icon={MapPin} step={2}>
                ¿Dónde te lo dejamos?
              </StepTitle>
              {(settings.shippingZone || settings.shippingText) && (
                <p className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                  {settings.shippingZone && (
                    <span className="rounded-full bg-mint-soft px-3 py-1 text-xs text-[#3f6a61]">
                      Solo {settings.shippingZone}
                    </span>
                  )}
                  {settings.shippingText}
                </p>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Dirección"
                  htmlFor="address"
                  required
                  error={errors.address?.message}
                  hint="Incluye apartamento, torre o punto de referencia"
                  className="sm:col-span-2"
                >
                  <Input
                    id="address"
                    autoComplete="street-address"
                    placeholder="Cra. 43A #1-50, Torre 2, Apto 803"
                    aria-invalid={!!errors.address}
                    {...register("address")}
                  />
                </Field>

                <Field
                  label="Barrio"
                  htmlFor="neighborhood"
                  required
                  error={errors.neighborhood?.message}
                >
                  {/* Con barrios configurados, lista; sin ellos, campo libre:
                      mejor que un desplegable vacío. */}
                  {neighborhoods.length > 0 ? (
                    <Select
                      id="neighborhood"
                      aria-invalid={!!errors.neighborhood}
                      {...register("neighborhood")}
                    >
                      <option value="">Selecciona tu barrio</option>
                      {neighborhoods.map((hood) => (
                        <option key={hood} value={hood}>
                          {hood}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      id="neighborhood"
                      placeholder="¿En qué barrio estás?"
                      aria-invalid={!!errors.neighborhood}
                      {...register("neighborhood")}
                    />
                  )}
                </Field>

                {settings.storeCity && (
                  <Field label="Ciudad" htmlFor="city">
                    <Input
                      id="city"
                      value={settings.storeCity}
                      readOnly
                      className="bg-cream/70"
                    />
                  </Field>
                )}
              </div>
            </fieldset>
          </Reveal>

          <Reveal kind="up" delay={0.16}>
            <fieldset className="rounded-[2rem] bg-white/62 p-7 ring-1 ring-white/75 backdrop-blur-md md:p-8">
              <legend className="sr-only">Método de pago</legend>
              <StepTitle icon={Lock} step={3}>
                ¿Cómo prefieres pagar?
              </StepTitle>
              <p className="mb-6 text-sm text-ink-soft">
                No pedimos datos de tarjeta. Al confirmar te enviamos las
                instrucciones por correo y WhatsApp.
              </p>

              {payments.length > 0 ? (
                <div className="grid gap-3">
                  {payments.map((method) => (
                    <label
                      key={method}
                      className={cn(
                        "flex cursor-pointer items-center gap-4 rounded-2xl p-4 ring-1 transition-all duration-500",
                        selectedPayment === method
                          ? "bg-gradient-to-r from-rose-mist to-lavender-soft ring-rose/45 shadow-petal"
                          : "bg-white/70 ring-white/80 hover:bg-white",
                      )}
                    >
                      <input
                        type="radio"
                        value={method}
                        className="peer sr-only"
                        {...register("payment")}
                      />
                      <span
                        aria-hidden
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-full ring-1 transition-all duration-400",
                          selectedPayment === method ? "ring-rose" : "ring-rose/35",
                        )}
                      >
                        {selectedPayment === method && (
                          <span className="size-2.5 rounded-full bg-gradient-to-br from-rose to-lavender" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[0.95rem] text-ink">
                          {method}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                /* Sin medios de pago configurados no se inventa ninguno */
                <div className="rounded-2xl bg-cream/80 p-4">
                  <input
                    type="hidden"
                    value={PAYMENT_TO_ARRANGE}
                    {...register("payment")}
                  />
                  <p className="text-sm leading-relaxed text-ink-soft">
                    Coordinamos el medio de pago contigo al confirmar el pedido.
                  </p>
                </div>
              )}
              <FieldErrorText>{errors.payment?.message}</FieldErrorText>
            </fieldset>
          </Reveal>

          <Reveal kind="up" delay={0.24}>
            <fieldset className="rounded-[2rem] bg-white/62 p-7 ring-1 ring-white/75 backdrop-blur-md md:p-8">
              <legend className="sr-only">Notas del pedido</legend>
              <StepTitle icon={Gift} step={4}>
                Notas y detallitos
              </StepTitle>

              <label
                className={cn(
                  "mb-5 flex cursor-pointer items-start gap-3.5 rounded-2xl p-4 ring-1 transition-all duration-500",
                  isGift
                    ? "bg-rose-mist ring-rose/40"
                    : "bg-white/70 ring-white/80 hover:bg-white",
                )}
              >
                <input type="checkbox" className="peer sr-only" {...register("isGift")} />
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-lg ring-1 transition-all duration-400",
                    isGift
                      ? "bg-gradient-to-br from-rose to-lavender ring-rose"
                      : "bg-white ring-rose/35",
                  )}
                >
                  {isGift && (
                    <svg viewBox="0 0 24 24" className="size-3.5 text-white">
                      <path
                        d="M5 13l4 4L19 7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span>
                  <span className="block font-display text-[0.95rem] text-ink">
                    Es un regalo 🎁
                  </span>
                  <span className="block text-sm text-ink-soft">
                    Le sumamos tarjeta escrita a mano y no incluimos la factura
                    dentro de la caja.
                  </span>
                </span>
              </label>

              <Field
                label={isGift ? "Mensaje para la tarjeta y notas" : "Notas del pedido"}
                htmlFor="notes"
                error={errors.notes?.message}
                hint={
                  isGift
                    ? "Escribe el mensaje tal como quieres que quede en la tarjeta"
                    : "Tono que prefieres, horario de entrega, indicaciones del portero…"
                }
              >
                <Textarea
                  id="notes"
                  placeholder={
                    isGift
                      ? "Escribe aquí el mensaje de la tarjeta ♡"
                      : "Indicaciones para la entrega o preferencias del pedido"
                  }
                  {...register("notes")}
                />
              </Field>
            </fieldset>
          </Reveal>
        </div>

        {/* Resumen */}
        <div>
          <div className="lg:sticky lg:top-32">
            <Reveal kind="blur">
              <div className="rounded-[2rem] bg-white/72 p-7 ring-1 ring-white/80 backdrop-blur-xl">
                <h2 className="font-display text-xl text-ink">Resumen del pedido</h2>

                <ul className="mt-5 space-y-3.5">
                  {lines.map((line) => (
                    <li key={lineKey(line)} className="flex gap-3.5">
                      <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
                        <Image
                          src={line.image}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                        <span className="absolute bottom-0 right-0 grid size-5 place-items-center rounded-tl-lg bg-white/92 text-[0.65rem] font-medium text-ink">
                          {line.quantity}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-sm text-ink">
                          {line.name}
                        </span>
                        {line.shade && (
                          <span className="block text-xs text-ink-soft">{line.shade}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-sm text-ink">
                        {formatCOP(line.price * line.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="rule-pastel my-5" />

                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between text-ink-soft">
                    <dt>Subtotal</dt>
                    <dd className="text-ink">{formatCOP(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-ink-soft">
                    <dt className="flex items-center gap-1.5">
                      <Truck className="size-3.5 text-mint" strokeWidth={2} />
                      Envío
                    </dt>
                    <dd
                      className={
                        shippingKnown && shipping === 0
                          ? "font-medium text-[#3f6a61]"
                          : "text-ink"
                      }
                    >
                      {!shippingKnown
                        ? "Por confirmar"
                        : shipping === 0
                          ? "Gratis"
                          : formatCOP(shipping)}
                    </dd>
                  </div>
                  <div className="rule-pastel my-3" />
                  <div className="flex items-baseline justify-between">
                    <dt className="font-display text-lg text-ink">Total</dt>
                    <dd className="font-display text-2xl text-ink">{formatCOP(total)}</dd>
                  </div>
                </dl>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-6 w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando tu pedido…" : "Confirmar pedido"}
                </Button>

                <p className="mt-3.5 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
                  <Mail className="mt-0.5 size-3.5 shrink-0 text-rose" strokeWidth={2} />
                  Al confirmar te llega un correo con el resumen y los datos para
                  pagar. Nada se cobra automáticamente.
                </p>

                {whatsappOrder && (
                  <>
                    <div className="rule-pastel my-5" />

                    <a
                      href={whatsappOrder}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-full bg-mint-soft px-5 py-3 text-sm text-[#33604f] ring-1 ring-mint/50 transition-all duration-500 hover:-translate-y-0.5 hover:bg-mint"
                    >
                      <WhatsappIcon className="size-4" />
                      ¿Prefieres pedir por WhatsApp?
                    </a>
                  </>
                )}
              </div>
            </Reveal>

            <Reveal kind="up" delay={0.1} className="mt-4">
              <ul className="space-y-2.5 rounded-[1.75rem] bg-white/50 p-6 text-sm text-ink-soft ring-1 ring-white/70">
                {[
                  "Sin crear cuenta ni contraseñas",
                  "Envolvemos todo a mano, siempre",
                  "5 días para cambios",
                  "Te escribe una persona real",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <BadgeCheck className="size-4 shrink-0 text-mint" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </form>
    </div>
  );
}

function StepTitle({
  icon: Icon,
  step,
  children,
}: {
  icon: typeof User;
  step: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center gap-3">
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-rose-soft to-lavender text-[#7a4a5e]"
      >
        <Icon className="size-5" strokeWidth={1.9} />
      </span>
      <h2 className="font-display text-xl text-ink">
        <span className="text-ink-muted">{step}.</span> {children}
      </h2>
    </div>
  );
}

function FieldErrorText({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-3 text-sm text-[#b3607f]">
      {children}
    </p>
  );
}

function OrderConfirmation({
  orderId,
  settings,
}: {
  orderId: string;
  settings: SiteSettingsView;
}) {
  const confirmHref = whatsappUrl(
    settings.whatsappNumber,
    `¡Hola ${storeLabel(settings)}! 🌸 Acabo de hacer el pedido ${orderId} y quiero confirmar el pago.`,
  );

  return (
    <div className="container-cute">
      <div
        className="cute-in mx-auto max-w-xl overflow-hidden rounded-[2.5rem] bg-white/72 p-10 text-center ring-1 ring-white/80 backdrop-blur-xl md:p-14"
        style={
          {
            "--in-scale": "0.94",
            "--in-blur": "14px",
            "--in-duration": "0.8s",
          } as React.CSSProperties
        }
      >
        <p
          className="text-6xl"
          aria-hidden
          style={{ animation: "giftWiggle 3.8s ease-in-out infinite" }}
        >
          🎀
        </p>

        <h1 className="mt-6 font-display text-3xl leading-tight text-ink md:text-4xl">
          ¡Gracias! Tu pedido ya{" "}
          <span className="text-gradient">está con nosotras</span>
        </h1>

        <p className="mt-5 leading-relaxed text-ink-soft">
          Te acabamos de enviar un correo con el resumen y los datos para pagar.
          En cuanto confirmemos el pago, lo envolvemos y sale para tu casa.
        </p>

        <p className="mt-7 inline-block rounded-2xl bg-cream px-6 py-4 ring-1 ring-rose/25">
          <span className="block text-xs uppercase tracking-[0.16em] text-ink-muted">
            Número de pedido
          </span>
          <span className="mt-1 block font-display text-2xl text-ink">{orderId}</span>
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          {confirmHref && (
            <Button asChild variant="mint" size="lg">
              <a href={confirmHref} target="_blank" rel="noopener noreferrer">
                <WhatsappIcon className="size-4.5" />
                Confirmar pago por WhatsApp
              </a>
            </Button>
          )}
          <Button asChild variant="cream" size="lg">
            <Link href="/tienda">Seguir comprando</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
