"use client";

import { useActionState, useState } from "react";
import {
  AlertTriangle,
  Check,
  CreditCard,
  Globe,
  Mail,
  MapPin,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import type { SiteSettingsView } from "@/lib/site-settings";
import {
  saveSettingsAction,
  type ActionResult,
} from "@/app/admin/(panel)/configuracion/actions";
import { HeroImageField } from "@/app/admin/(panel)/configuracion/hero-image-field";
import { Field, Input, Textarea } from "@/components/ui/field";
import { PageHeading, Panel, PanelHeader } from "@/components/admin/ui";

/**
 * Formulario de configuración de la tienda.
 *
 * Todo lo que aquí se guarda alimenta la portada y el decorado de la tienda.
 * Los campos vacíos no son un error: la portada oculta el bloque que no tenga
 * dato, así que dejar algo en blanco es la forma de decir "todavía no".
 *
 * La imagen del hero es la excepción: se guarda sola al subirla, porque va a
 * Storage y no al formulario.
 */

/** Icono en pastilla, igual que en el resto del panel */
function PanelIcon({
  tone,
  children,
}: {
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`tone-${tone} grid size-10 place-items-center rounded-2xl`}>
      {children}
    </span>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettingsView }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveSettingsAction,
    null,
  );

  // Los métodos de pago son una lista: se editan uno a uno y viajan como
  // entradas repetidas del mismo campo.
  const [payments, setPayments] = useState<string[]>(
    settings.paymentMethods.length ? settings.paymentMethods : [""],
  );

  const setPayment = (index: number, value: string) =>
    setPayments((prev) => prev.map((item, i) => (i === index ? value : item)));

  // Los barrios del checkout se editan igual: una entrada por barrio.
  const [neighborhoods, setNeighborhoods] = useState<string[]>(
    settings.shippingNeighborhoods.length ? settings.shippingNeighborhoods : [""],
  );

  const setHood = (index: number, value: string) =>
    setNeighborhoods((prev) => prev.map((item, i) => (i === index ? value : item)));

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Sistema"
        title="Configuración"
        description="Los datos que gobiernan la tienda. Lo que dejes vacío no se inventa: esa parte de la portada simplemente no se muestra."
        actions={
          <>
            {state?.ok && (
              <span className="admin-pill tone-mint">
                <Check className="size-3.5" strokeWidth={2.4} />
                Guardado
              </span>
            )}
            <button
              type="submit"
              disabled={pending}
              className="admin-btn admin-btn-primary disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Guardar cambios"}
            </button>
          </>
        }
      />

      {state && !state.ok && (
        <div
          role="alert"
          className="tone-rose flex items-start gap-3 rounded-2xl px-5 py-4 text-sm"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Marca */}
        <Panel className="admin-in">
          <PanelHeader
            title="Marca"
            description="Identidad pública de la tienda"
            action={
              <PanelIcon tone="rose">
                <Globe className="size-5" strokeWidth={1.8} />
              </PanelIcon>
            }
          />
          <div className="admin-rule mt-5" />

          <div className="mt-6 flex flex-col gap-5">
            <Field
              label="Nombre de la tienda"
              htmlFor="s-store-name"
              hint="Se usa en el título de la portada y en los datos de la pestaña"
            >
              <Input
                id="s-store-name"
                name="storeName"
                maxLength={80}
                defaultValue={settings.storeName}
                placeholder="Lo Más Cute"
              />
            </Field>

            <Field
              label="Razón social"
              htmlFor="s-legal-name"
              hint="Aparece en los documentos legales. Vacía, no se menciona"
            >
              <Input
                id="s-legal-name"
                name="legalName"
                maxLength={120}
                defaultValue={settings.legalName}
                placeholder="Lo Más Cute S.A.S."
              />
            </Field>

            <Field
              label="Eslogan"
              htmlFor="s-tagline"
              hint="Una frase corta: pantalla de bienvenida y menú de categorías"
            >
              <Input
                id="s-tagline"
                name="tagline"
                maxLength={80}
                defaultValue={settings.tagline}
                placeholder="Cosas lindas para tu día a día"
              />
            </Field>

            <Field
              label="Ciudad"
              htmlFor="s-store-city"
              hint="Ciudad de operación: se usa en el checkout y en los legales"
            >
              <Input
                id="s-store-city"
                name="storeCity"
                maxLength={80}
                defaultValue={settings.storeCity}
                placeholder="Medellín"
              />
            </Field>

            <Field
              label="Descripción"
              htmlFor="s-store-description"
              hint="Un párrafo corto: es lo que ven los buscadores y lo que acompaña a la marca"
            >
              <Textarea
                id="s-store-description"
                name="storeDescription"
                rows={4}
                maxLength={400}
                defaultValue={settings.storeDescription}
                placeholder="Qué vende la tienda y a quién, en dos o tres líneas."
              />
            </Field>
          </div>
        </Panel>

        {/* Hero */}
        <Panel className="admin-in">
          <PanelHeader
            title="Hero de la portada"
            description="Lo primero que ve quien entra"
            action={
              <PanelIcon tone="lavender">
                <Sparkles className="size-5" strokeWidth={1.8} />
              </PanelIcon>
            }
          />
          <div className="admin-rule mt-5" />

          <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,13rem)_1fr]">
            <HeroImageField initialUrl={settings.heroImageUrl} />

            <div className="flex flex-col gap-5">
              <Field label="Título" htmlFor="s-hero-title">
                <Input
                  id="s-hero-title"
                  name="heroTitle"
                  maxLength={120}
                  defaultValue={settings.heroTitle}
                  placeholder="La frase grande de la portada"
                />
              </Field>

              <Field label="Subtítulo" htmlFor="s-hero-subtitle">
                <Textarea
                  id="s-hero-subtitle"
                  name="heroSubtitle"
                  rows={3}
                  maxLength={240}
                  defaultValue={settings.heroSubtitle}
                  placeholder="Una o dos líneas que amplíen el título."
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Texto del botón"
                  htmlFor="s-hero-cta-label"
                  hint="Sin texto y destino, no hay botón"
                >
                  <Input
                    id="s-hero-cta-label"
                    name="heroCtaLabel"
                    maxLength={40}
                    defaultValue={settings.heroCtaLabel}
                    placeholder="Comprar ahora"
                  />
                </Field>

                <Field label="Destino del botón" htmlFor="s-hero-cta-href">
                  <Input
                    id="s-hero-cta-href"
                    name="heroCtaHref"
                    maxLength={200}
                    defaultValue={settings.heroCtaHref}
                    placeholder="/tienda"
                  />
                </Field>
              </div>
            </div>
          </div>
        </Panel>

        {/* Redes sociales */}
        <Panel className="admin-in">
          <PanelHeader
            title="Redes sociales"
            description="Los enlaces que abren los iconos de la tienda"
            action={
              <PanelIcon tone="mint">
                <Share2 className="size-5" strokeWidth={1.8} />
              </PanelIcon>
            }
          />
          <div className="admin-rule mt-5" />

          <div className="mt-6 flex flex-col gap-5">
            <Field
              label="Instagram"
              htmlFor="s-instagram"
              hint="Vale el usuario (@lomascute) o la URL completa"
            >
              <Input
                id="s-instagram"
                name="instagramUrl"
                maxLength={200}
                defaultValue={settings.instagramUrl}
                placeholder="@lomascute"
              />
            </Field>

            <Field label="TikTok" htmlFor="s-tiktok">
              <Input
                id="s-tiktok"
                name="tiktokUrl"
                maxLength={200}
                defaultValue={settings.tiktokUrl}
                placeholder="@lomascute"
              />
            </Field>

            <Field label="Facebook" htmlFor="s-facebook">
              <Input
                id="s-facebook"
                name="facebookUrl"
                maxLength={200}
                defaultValue={settings.facebookUrl}
                placeholder="lomascute"
              />
            </Field>
          </div>
        </Panel>

        {/* Contacto */}
        <Panel className="admin-in">
          <PanelHeader
            title="Contacto"
            description="Cómo llega la clienta al equipo"
            action={
              <PanelIcon tone="peach">
                <Mail className="size-5" strokeWidth={1.8} />
              </PanelIcon>
            }
          />
          <div className="admin-rule mt-5" />

          <div className="mt-6 flex flex-col gap-5">
            <Field
              label="WhatsApp"
              htmlFor="s-whatsapp"
              hint="Con indicativo del país y sin espacios: 573001234567"
            >
              <Input
                id="s-whatsapp"
                name="whatsappNumber"
                inputMode="tel"
                maxLength={20}
                defaultValue={settings.whatsappNumber}
                placeholder="573001234567"
              />
            </Field>

            <Field label="Correo" htmlFor="s-email">
              <Input
                id="s-email"
                name="contactEmail"
                type="email"
                maxLength={120}
                defaultValue={settings.contactEmail}
                placeholder="hola@tutienda.co"
              />
            </Field>

            <Field
              label="Teléfono"
              htmlFor="s-phone"
              hint="Se muestra tal cual lo escribas. Vacío, no aparece"
            >
              <Input
                id="s-phone"
                name="contactPhone"
                inputMode="tel"
                maxLength={40}
                defaultValue={settings.contactPhone}
                placeholder="+57 300 123 4567"
              />
            </Field>

            <Field
              label="Horario de atención"
              htmlFor="s-hours"
              hint="En una línea, como quieras que lo lea la clienta"
            >
              <Input
                id="s-hours"
                name="businessHours"
                maxLength={120}
                defaultValue={settings.businessHours}
                placeholder="Lunes a sábado, 9:00 a.m. a 6:00 p.m."
              />
            </Field>

            <Field
              label="Dirección"
              htmlFor="s-address"
              hint="Solo si atiendes al público: también dibuja el mapa de la página de contacto"
            >
              <Input
                id="s-address"
                name="storeAddress"
                maxLength={200}
                defaultValue={settings.storeAddress}
                placeholder="Calle 10 #40-20, Medellín"
              />
            </Field>
          </div>
        </Panel>

        {/* Envíos */}
        <Panel className="admin-in">
          <PanelHeader
            title="Envíos"
            description="Lo que se le promete a la clienta"
            action={
              <PanelIcon tone="gold">
                <Truck className="size-5" strokeWidth={1.8} />
              </PanelIcon>
            }
          />
          <div className="admin-rule mt-5" />

          <div className="mt-6 flex flex-col gap-5">
            <Field
              label="Texto de envíos"
              htmlFor="s-shipping"
              hint="Cobertura y condiciones, en una frase"
            >
              <Textarea
                id="s-shipping"
                name="shippingText"
                rows={3}
                maxLength={240}
                defaultValue={settings.shippingText}
                placeholder="Dónde entregas y en qué condiciones."
              />
            </Field>

            <Field
              label="Tiempo de entrega"
              htmlFor="s-delivery"
              hint="Aparece en el hero y en la portada"
            >
              <Input
                id="s-delivery"
                name="deliveryTime"
                maxLength={80}
                defaultValue={settings.deliveryTime}
                placeholder="24 a 48 horas"
              />
            </Field>

            <Field
              label="Cobertura"
              htmlFor="s-zone"
              hint="Dónde entregas hoy. Se muestra en la bolsa y en el checkout"
            >
              <Input
                id="s-zone"
                name="shippingZone"
                maxLength={120}
                defaultValue={settings.shippingZone}
                placeholder="Medellín y Área Metropolitana"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Costo del domicilio"
                htmlFor="s-shipping-price"
                hint="En pesos. Vacío: el envío se cotiza al coordinar"
              >
                <Input
                  id="s-shipping-price"
                  name="shippingPrice"
                  inputMode="numeric"
                  maxLength={12}
                  defaultValue={settings.shippingPrice || ""}
                  placeholder="8900"
                />
              </Field>

              <Field
                label="Envío gratis desde"
                htmlFor="s-free-from"
                hint="Vacío: no se anuncia envío gratis"
              >
                <Input
                  id="s-free-from"
                  name="freeShippingFrom"
                  inputMode="numeric"
                  maxLength={12}
                  defaultValue={settings.freeShippingFrom || ""}
                  placeholder="120000"
                />
              </Field>
            </div>
          </div>
        </Panel>

        {/* Barrios de entrega */}
        <Panel className="admin-in">
          <PanelHeader
            title="Barrios de entrega"
            description="Las opciones que elige la clienta al pagar"
            action={
              <PanelIcon tone="mint">
                <MapPin className="size-5" strokeWidth={1.8} />
              </PanelIcon>
            }
          />
          <div className="admin-rule mt-5" />

          <ul className="mt-6 flex flex-col gap-3">
            {neighborhoods.map((hood, index) => (
              <li key={index} className="flex items-center gap-2.5">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Barrio {index + 1}</span>
                  <Input
                    name="shippingNeighborhoods"
                    value={hood}
                    maxLength={80}
                    onChange={(event) => setHood(index, event.target.value)}
                    placeholder="El Poblado"
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setNeighborhoods((prev) => prev.filter((_, i) => i !== index))
                  }
                  aria-label={`Quitar el barrio ${index + 1}`}
                  className="admin-icon-btn size-10 shrink-0 hover:text-[#b3607f]"
                >
                  <Trash2 className="size-3.5" strokeWidth={1.9} />
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setNeighborhoods((prev) => [...prev, ""])}
            className="admin-btn mt-4 px-4 py-2 text-[0.82rem]"
          >
            <Plus className="size-3.5" strokeWidth={2.2} />
            Añadir barrio
          </button>

          <p className="admin-muted mt-5 text-xs leading-relaxed">
            Sin ninguno, el checkout pide el barrio en un campo libre en vez de
            una lista.
          </p>
        </Panel>

        {/* Métodos de pago */}
        <Panel className="admin-in">
          <PanelHeader
            title="Métodos de pago"
            description="Lo que la clienta puede usar al pagar"
            action={
              <PanelIcon tone="lavender">
                <CreditCard className="size-5" strokeWidth={1.8} />
              </PanelIcon>
            }
          />
          <div className="admin-rule mt-5" />

          <ul className="mt-6 flex flex-col gap-3">
            {payments.map((method, index) => (
              <li key={index} className="flex items-center gap-2.5">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Método de pago {index + 1}</span>
                  <Input
                    name="paymentMethods"
                    value={method}
                    maxLength={60}
                    onChange={(event) => setPayment(index, event.target.value)}
                    placeholder="Nequi"
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setPayments((prev) => prev.filter((_, i) => i !== index))
                  }
                  aria-label={`Quitar el método ${index + 1}`}
                  className="admin-icon-btn size-10 shrink-0 hover:text-[#b3607f]"
                >
                  <Trash2 className="size-3.5" strokeWidth={1.9} />
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setPayments((prev) => [...prev, ""])}
            className="admin-btn mt-4 px-4 py-2 text-[0.82rem]"
          >
            <Plus className="size-3.5" strokeWidth={2.2} />
            Añadir método
          </button>

          <p className="admin-muted mt-5 text-xs leading-relaxed">
            Se muestran en el hero y en el pie de la tienda. Sin ninguno, ese
            bloque no aparece.
          </p>
        </Panel>
      </div>
    </form>
  );
}
