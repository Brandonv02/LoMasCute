import "server-only";

import { SITE_URL } from "@/config/app";
import { formatCOP } from "@/lib/utils";
import { storeLabel } from "@/lib/site-settings";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { getSiteSettings } from "@/services/site-settings";
import type { Order } from "@/services/orders";

/**
 * Avisos a la tienda.
 *
 * Una regla por encima de todo: **ningún aviso puede tumbar lo que lo provocó.**
 * Cuando esto corre, el pedido ya está guardado y el cliente ya vio su número.
 * Si el correo falla, se anota en el log y se sigue: perder una venta porque el
 * proveedor de correo tuvo un mal minuto sería absurdo.
 *
 * Por eso `notifyNewOrder` no lanza nunca y devuelve si pudo o no, para que
 * quien llame pueda anotarlo sin tener que envolverlo en un try.
 */

/**
 * A quién le llega el aviso.
 *
 * Por defecto, el correo de la tienda que está guardado en el panel
 * (`/admin/configuracion`): así no hace falta tocar variables de entorno para
 * cambiarlo. `ORDER_NOTIFICATION_EMAIL` existe para el caso en que los avisos
 * internos deban ir a una dirección distinta de la que se publica en la web.
 */
async function recipient(): Promise<string> {
  const override = process.env.ORDER_NOTIFICATION_EMAIL?.trim();
  if (override) return override;

  return (await getSiteSettings()).contactEmail;
}

/* ------------------------------------------------------------ redacción */

function orderLines(order: Order): string[] {
  return order.items.map((item) => {
    const shade = item.shade ? ` (${item.shade})` : "";
    return `  ${item.quantity} × ${item.productName}${shade} — ${formatCOP(item.subtotal)}`;
  });
}

function plainBody(order: Order, store: string): string {
  const parts: string[] = [
    `Entró un pedido en ${store}.`,
    "",
    `Pedido:   ${order.code}`,
    `Total:    ${formatCOP(order.total)}`,
    `          productos ${formatCOP(order.itemsTotal)} + envío ${
      order.shippingCost === 0 ? "gratis" : formatCOP(order.shippingCost)
    }`,
    `Pago:     ${order.paymentLabel ?? order.paymentMethod}`,
    "",
    "El stock TODAVÍA NO se ha descontado: eso pasa cuando pases el pedido",
    "a «pagado» desde el panel.",
    "",
    "— Cliente —",
    `Nombre:   ${order.customerName ?? "sin nombre"}`,
    `Correo:   ${order.customerEmail ?? "sin correo"}`,
    `Celular:  ${order.customerWhatsapp ?? "sin celular"}`,
    `Entrega:  ${order.shippingAddress ?? "sin dirección"}`,
    `          ${[order.shippingNeighborhood, order.customerCity].filter(Boolean).join(", ")}`,
    "",
    "— Productos —",
    ...orderLines(order),
  ];

  if (order.isGift) {
    parts.push("", "Es un regalo: tarjeta escrita a mano y sin factura dentro de la caja.");
  }

  if (order.notes) {
    parts.push("", "— Notas del cliente —", order.notes);
  }

  parts.push(
    "",
    `Ábrelo aquí: ${SITE_URL}/admin/pedidos/${order.id}`,
  );

  return parts.join("\n");
}

/**
 * Versión en HTML.
 *
 * Deliberadamente pobre: estilos en línea, sin flex, sin grid y sin clases. Los
 * clientes de correo llevan veinte años de retraso y lo único que aguantan
 * todos es esto. Lo que importa es que se lea en el celular de un tirón.
 */
function htmlBody(order: Order, store: string): string {
  const escape = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const row = (label: string, value: string) =>
    `<tr>
       <td style="padding:6px 14px 6px 0;color:#6b6165;font-size:14px;vertical-align:top;white-space:nowrap">${escape(label)}</td>
       <td style="padding:6px 0;color:#4a4145;font-size:14px;vertical-align:top">${escape(value)}</td>
     </tr>`;

  const items = order.items
    .map((item) => {
      const shade = item.shade ? ` (${item.shade})` : "";
      return `<li style="margin:0 0 6px;color:#4a4145;font-size:14px">
                ${item.quantity} × ${escape(item.productName + shade)}
                <span style="color:#6b6165"> — ${formatCOP(item.subtotal)}</span>
              </li>`;
    })
    .join("");

  const shipping =
    order.shippingCost === 0 ? "gratis" : formatCOP(order.shippingCost);

  return `<div style="margin:0;padding:24px;background:#fff7f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;padding:28px">

    <p style="margin:0 0 4px;color:#8a8a8a;font-size:12px;letter-spacing:.14em;text-transform:uppercase">Pedido nuevo</p>
    <h1 style="margin:0 0 6px;color:#4a4145;font-size:26px">${escape(order.code)}</h1>
    <p style="margin:0 0 22px;color:#6b6165;font-size:14px">
      Entró un pedido en ${escape(store)}.
    </p>

    <p style="margin:0 0 22px;padding:14px 16px;background:#faeac6;border-radius:14px;color:#7a5a2e;font-size:13px;line-height:1.5">
      El stock <strong>todavía no</strong> se ha descontado. Se descuenta cuando
      pases el pedido a «pagado» desde el panel.
    </p>

    <table style="width:100%;border-collapse:collapse;margin:0 0 22px">
      ${row("Total", `${formatCOP(order.total)}`)}
      ${row("Desglose", `productos ${formatCOP(order.itemsTotal)} + envío ${shipping}`)}
      ${row("Pago", order.paymentLabel ?? order.paymentMethod)}
    </table>

    <h2 style="margin:0 0 10px;color:#4a4145;font-size:16px">Cliente</h2>
    <table style="width:100%;border-collapse:collapse;margin:0 0 22px">
      ${row("Nombre", order.customerName ?? "sin nombre")}
      ${row("Correo", order.customerEmail ?? "sin correo")}
      ${row("Celular", order.customerWhatsapp ?? "sin celular")}
      ${row("Entrega", order.shippingAddress ?? "sin dirección")}
      ${row(
        "Zona",
        [order.shippingNeighborhood, order.customerCity].filter(Boolean).join(", ") ||
          "sin zona",
      )}
    </table>

    <h2 style="margin:0 0 10px;color:#4a4145;font-size:16px">Productos</h2>
    <ul style="margin:0 0 22px;padding:0 0 0 18px">${items}</ul>

    ${
      order.isGift
        ? `<p style="margin:0 0 22px;padding:14px 16px;background:#fdeaf1;border-radius:14px;color:#a8556f;font-size:13px">
             Es un regalo: tarjeta escrita a mano y sin factura dentro de la caja.
           </p>`
        : ""
    }

    ${
      order.notes
        ? `<h2 style="margin:0 0 10px;color:#4a4145;font-size:16px">Notas del cliente</h2>
           <p style="margin:0 0 22px;color:#4a4145;font-size:14px;line-height:1.6;white-space:pre-line">${escape(order.notes)}</p>`
        : ""
    }

    <a href="${SITE_URL}/admin/pedidos/${order.id}"
       style="display:inline-block;padding:13px 26px;background:#f8b6c8;border-radius:999px;color:#4a4145;font-size:15px;text-decoration:none">
      Abrir el pedido
    </a>

  </div>
</div>`;
}

/* -------------------------------------------------------------- envío */

export type NotifyResult =
  | { sent: true }
  | { sent: false; reason: "sin-proveedor" | "sin-destinatario" | "error" };

/**
 * Avisa a la tienda de que entró un pedido. Nunca lanza.
 *
 * Se llama después de que el pedido ya existe, así que cualquier fallo aquí es
 * un aviso perdido y no una venta perdida.
 */
export async function notifyNewOrder(order: Order): Promise<NotifyResult> {
  if (!isEmailConfigured()) {
    console.warn(
      `[avisos] pedido ${order.code} sin aviso por correo: falta RESEND_API_KEY en el entorno.`,
    );
    return { sent: false, reason: "sin-proveedor" };
  }

  try {
    const settings = await getSiteSettings();
    const to = await recipient();

    if (!to) {
      console.warn(
        `[avisos] pedido ${order.code} sin aviso por correo: no hay correo de la tienda ` +
          "guardado en /admin/configuracion ni ORDER_NOTIFICATION_EMAIL en el entorno.",
      );
      return { sent: false, reason: "sin-destinatario" };
    }

    const store = storeLabel(settings);

    await sendEmail({
      to,
      // El código y el total en el asunto: se decide si abrirlo desde la lista.
      subject: `Pedido nuevo ${order.code} · ${formatCOP(order.total)}`,
      text: plainBody(order, store),
      html: htmlBody(order, store),
      // Responder al aviso escribe al cliente, no al vacío.
      replyTo: order.customerEmail ?? undefined,
    });

    return { sent: true };
  } catch (error) {
    console.error(`[avisos] no se pudo avisar del pedido ${order.code}:`, error);
    return { sent: false, reason: "error" };
  }
}
