import "server-only";

/**
 * Envío de correo.
 *
 * Habla con la API de Resend por HTTP y no con su paquete de npm. Es una sola
 * petición POST con un JSON: meter una dependencia para eso añadiría peso al
 * despliegue y una versión más que mantener, sin ahorrar ni diez líneas.
 *
 * Dos reglas:
 *
 *  · `server-only`. La clave de la API se salta cualquier permiso: un import
 *    accidental desde un componente de cliente tiene que romper la
 *    compilación, no acabar en el bundle del navegador.
 *  · Sin configurar, no falla: `isEmailConfigured()` devuelve false y quien
 *    llama decide. Un correo que no se puede enviar nunca debe tumbar la
 *    operación que lo provocó — el pedido ya está guardado.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const apiKey = process.env.RESEND_API_KEY;

/**
 * Remitente.
 *
 * `onboarding@resend.dev` es el remitente de pruebas de Resend: funciona sin
 * verificar ningún dominio, pero **solo entrega al correo con el que se registró
 * la cuenta**. Sirve para arrancar hoy; para escribirle a cualquier otra
 * dirección hay que verificar el dominio y poner aquí algo como
 * `pedidos@tudominio.com`.
 */
const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

/** ¿Se puede enviar correo en este entorno? */
export function isEmailConfigured(): boolean {
  return Boolean(apiKey);
}

export class EmailNotConfiguredError extends Error {
  constructor() {
    super(
      "No hay proveedor de correo configurado: falta RESEND_API_KEY en el entorno.",
    );
    this.name = "EmailNotConfiguredError";
  }
}

export type EmailMessage = {
  to: string;
  subject: string;
  /** Versión en texto plano. Obligatoria: hay clientes que no pintan HTML. */
  text: string;
  html?: string;
  /**
   * A dónde va la respuesta si le dan a «Responder».
   *
   * En el aviso de un pedido se pone el correo del cliente, así que contestarle
   * es un clic y no un copiar y pegar.
   */
  replyTo?: string;
};

/**
 * Envía un correo. Lanza si no se pudo.
 *
 * Quien llama decide qué hacer con el fallo; aquí no se traga nada en silencio
 * porque un correo perdido sin rastro es peor que uno perdido con un log.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  if (!apiKey) throw new EmailNotConfiguredError();

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      ...(message.html ? { html: message.html } : {}),
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
    // Un proveedor lento no puede dejar colgada la función del servidor.
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    // El cuerpo del error de Resend dice qué pasó ("domain not verified",
    // "you can only send testing emails to your own address"), y eso es
    // exactamente lo que hay que leer en el log para arreglarlo.
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Resend respondió ${response.status}${detail ? `: ${detail}` : ""}`,
    );
  }
}
