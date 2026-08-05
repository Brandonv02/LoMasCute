import { products } from "@/data/products";
import type { Tone } from "@/components/admin/ui";

/**
 * Datos simulados del panel.
 *
 * No hay base de datos ni API: este módulo existe para que las pantallas
 * tengan volumen realista y se pueda juzgar el diseño con contenido de verdad.
 * Cuando llegue el backend, se sustituye por consultas y las páginas no
 * cambian de forma — todas consumen estas mismas estructuras.
 *
 * Solo lo importan Server Components, así que nada de esto viaja al navegador.
 */

/* ------------------------------------------------------------------ ventas */

export type OrderStatus =
  | "pendiente"
  | "pagado"
  | "empacando"
  | "enviado"
  | "entregado"
  | "cancelado";

export const orderStatus: Record<OrderStatus, { label: string; tone: Tone }> = {
  pendiente: { label: "Pago pendiente", tone: "gold" },
  pagado: { label: "Pagado", tone: "mint" },
  empacando: { label: "Empacando", tone: "lavender" },
  enviado: { label: "Enviado", tone: "peach" },
  entregado: { label: "Entregado", tone: "mint" },
  cancelado: { label: "Cancelado", tone: "neutral" },
};

export type Order = {
  id: string;
  code: string;
  customer: string;
  initials: string;
  tone: Tone;
  city: string;
  items: number;
  total: number;
  status: OrderStatus;
  payment: "Nequi" | "Bancolombia" | "Transferencia" | "Contra entrega";
  date: string;
};

export const orders: Order[] = [
  { id: "o-1042", code: "LMC-1042", customer: "Camila Restrepo", initials: "CR", tone: "rose", city: "El Poblado", items: 3, total: 147800, status: "pendiente", payment: "Nequi", date: "2026-08-04T09:12:00" },
  { id: "o-1041", code: "LMC-1041", customer: "Daniela Ospina", initials: "DO", tone: "lavender", city: "Laureles", items: 2, total: 98400, status: "pagado", payment: "Bancolombia", date: "2026-08-04T08:40:00" },
  { id: "o-1040", code: "LMC-1040", customer: "Mariana Gómez", initials: "MG", tone: "mint", city: "Envigado", items: 5, total: 231500, status: "empacando", payment: "Nequi", date: "2026-08-03T19:05:00" },
  { id: "o-1039", code: "LMC-1039", customer: "Sara Villegas", initials: "SV", tone: "peach", city: "Sabaneta", items: 1, total: 48900, status: "enviado", payment: "Transferencia", date: "2026-08-03T16:22:00" },
  { id: "o-1038", code: "LMC-1038", customer: "Laura Jaramillo", initials: "LJ", tone: "gold", city: "Belén", items: 4, total: 186200, status: "entregado", payment: "Nequi", date: "2026-08-03T11:48:00" },
  { id: "o-1037", code: "LMC-1037", customer: "Valeria Muñoz", initials: "VM", tone: "rose", city: "La América", items: 2, total: 76300, status: "entregado", payment: "Bancolombia", date: "2026-08-02T20:15:00" },
  { id: "o-1036", code: "LMC-1036", customer: "Juliana Arango", initials: "JA", tone: "lavender", city: "Itagüí", items: 6, total: 298700, status: "pendiente", payment: "Contra entrega", date: "2026-08-02T17:30:00" },
  { id: "o-1035", code: "LMC-1035", customer: "Isabella Pérez", initials: "IP", tone: "mint", city: "Bello", items: 1, total: 39900, status: "cancelado", payment: "Nequi", date: "2026-08-02T14:02:00" },
  { id: "o-1034", code: "LMC-1034", customer: "Antonia Cardona", initials: "AC", tone: "peach", city: "Estadio", items: 3, total: 124600, status: "entregado", payment: "Transferencia", date: "2026-08-01T10:26:00" },
  { id: "o-1033", code: "LMC-1033", customer: "Salomé Betancur", initials: "SB", tone: "gold", city: "El Poblado", items: 2, total: 89400, status: "entregado", payment: "Nequi", date: "2026-08-01T09:14:00" },
];

/* --------------------------------------------------------------- clientes */

export type Customer = {
  id: string;
  name: string;
  initials: string;
  tone: Tone;
  email: string;
  city: string;
  orders: number;
  spent: number;
  tier: "Nueva" | "Recurrente" | "Club Cute";
  lastOrder: string;
};

export const customers: Customer[] = [
  { id: "c-01", name: "Camila Restrepo", initials: "CR", tone: "rose", email: "camila.r@correo.com", city: "El Poblado", orders: 9, spent: 842300, tier: "Club Cute", lastOrder: "2026-08-04" },
  { id: "c-02", name: "Mariana Gómez", initials: "MG", tone: "mint", email: "mariana.gomez@correo.com", city: "Envigado", orders: 7, spent: 613900, tier: "Club Cute", lastOrder: "2026-08-03" },
  { id: "c-03", name: "Daniela Ospina", initials: "DO", tone: "lavender", email: "dospina@correo.com", city: "Laureles", orders: 5, spent: 398400, tier: "Recurrente", lastOrder: "2026-08-04" },
  { id: "c-04", name: "Laura Jaramillo", initials: "LJ", tone: "gold", email: "laurajm@correo.com", city: "Belén", orders: 4, spent: 342100, tier: "Recurrente", lastOrder: "2026-08-03" },
  { id: "c-05", name: "Juliana Arango", initials: "JA", tone: "lavender", email: "juli.arango@correo.com", city: "Itagüí", orders: 3, spent: 287300, tier: "Recurrente", lastOrder: "2026-08-02" },
  { id: "c-06", name: "Sara Villegas", initials: "SV", tone: "peach", email: "sara.v@correo.com", city: "Sabaneta", orders: 2, spent: 118600, tier: "Recurrente", lastOrder: "2026-08-03" },
  { id: "c-07", name: "Valeria Muñoz", initials: "VM", tone: "rose", email: "vmunoz@correo.com", city: "La América", orders: 1, spent: 76300, tier: "Nueva", lastOrder: "2026-08-02" },
  { id: "c-08", name: "Antonia Cardona", initials: "AC", tone: "peach", email: "antonia.c@correo.com", city: "Estadio", orders: 1, spent: 124600, tier: "Nueva", lastOrder: "2026-08-01" },
];

/* -------------------------------------------------------------- inventario */

/** Umbrales de reposición. Se derivan del catálogo real para no inventar SKUs. */
export const LOW_STOCK = 12;

export const inventory = products
  .map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    subcategory: product.subcategory,
    image: product.images[0],
    stock: product.stock,
    price: product.price,
    /** Reservado por pedidos sin despachar (simulado, estable por producto) */
    reserved: product.stock === 0 ? 0 : (product.name.length % 4) + 1,
  }))
  .sort((a, b) => a.stock - b.stock);

export const lowStock = inventory.filter((item) => item.stock <= LOW_STOCK);
export const outOfStock = inventory.filter((item) => item.stock === 0);

export const stockState = (stock: number): { label: string; tone: Tone } => {
  if (stock === 0) return { label: "Agotado", tone: "neutral" };
  if (stock <= 6) return { label: "Crítico", tone: "rose" };
  if (stock <= LOW_STOCK) return { label: "Bajo", tone: "gold" };
  return { label: "Saludable", tone: "mint" };
};

/* --------------------------------------------------------------- métricas */

export const revenueToday = orders
  .filter((order) => order.status !== "cancelado")
  .reduce((sum, order) => sum + order.total, 0);

export const salesTrend = [42, 51, 47, 63, 58, 76, 71, 84, 79, 92, 88, 104];
export const ordersTrend = [12, 15, 13, 18, 17, 21, 19, 24, 22, 26, 25, 31];
export const visitsTrend = [310, 352, 341, 402, 388, 455, 431, 498, 470, 540, 522, 601];
export const ticketTrend = [58, 61, 59, 64, 62, 68, 66, 71, 69, 74, 72, 78];

export const bestSelling = products
  .filter((product) => product.isBestseller || product.rating >= 4.8)
  .slice(0, 6)
  .map((product, i) => ({
    id: product.id,
    name: product.name,
    image: product.images[0],
    subcategory: product.subcategory,
    price: product.price,
    /** Unidades vendidas en el periodo (simulado, decreciente) */
    units: 148 - i * 19,
    share: 100 - i * 13,
  }));

/* ---------------------------------------------------------------- bitácora */

export type Activity = {
  id: string;
  text: string;
  detail: string;
  time: string;
  tone: Tone;
};

export const activity: Activity[] = [
  { id: "a-1", text: "Nuevo pedido LMC-1042", detail: "Camila Restrepo · $ 147.800", time: "Hace 12 min", tone: "rose" },
  { id: "a-2", text: "Pago confirmado", detail: "LMC-1041 · Bancolombia", time: "Hace 44 min", tone: "mint" },
  { id: "a-3", text: "Stock crítico", detail: "Bruma Fijadora Dew Veil · 4 unidades", time: "Hace 1 h", tone: "gold" },
  { id: "a-4", text: "Nueva reseña 5★", detail: "Labial Satinado Cloud Kiss", time: "Hace 2 h", tone: "lavender" },
  { id: "a-5", text: "Pedido entregado", detail: "LMC-1038 · Belén", time: "Hace 3 h", tone: "mint" },
  { id: "a-6", text: "Clienta nueva", detail: "Valeria Muñoz se unió al Club Cute", time: "Hace 5 h", tone: "peach" },
];

/* ------------------------------------------------------------------ tareas */

export const tasks = [
  { id: "t-1", label: "Confirmar 4 pagos por Nequi", done: false },
  { id: "t-2", label: "Reponer los 5 productos en stock crítico", done: false },
  { id: "t-3", label: "Preparar el envío de LMC-1040", done: false },
  { id: "t-4", label: "Responder 3 mensajes de WhatsApp", done: true },
  { id: "t-5", label: "Publicar el lanzamiento de la paleta Pastel Diary", done: true },
];

/* --------------------------------------------------------------- utilidades */

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short" });

export const shortDateTime = (iso: string) => {
  const date = new Date(iso);
  return `${shortDate(iso)} · ${date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
};

export const shortTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
