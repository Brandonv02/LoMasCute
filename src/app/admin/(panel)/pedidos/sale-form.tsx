"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Plus, Save, Trash2 } from "lucide-react";
import type { OrderStatus, PaymentMethod } from "@/lib/supabase/types";
import { ORDER_STATUSES, PAYMENT_METHODS } from "@/lib/supabase/types";
import {
  createOrderAction,
  type ActionResult,
} from "@/app/admin/(panel)/pedidos/actions";
import {
  ORDER_STATUS_META,
  PAYMENT_METHOD_LABEL,
} from "@/app/admin/(panel)/pedidos/order-meta";
import { Field, Input, Label, Select, Textarea } from "@/components/ui/field";
import { EmptyState, Panel, PanelHeader, StatusPill } from "@/components/admin/ui";
import { formatCOP } from "@/lib/utils";

/**
 * Registro de una venta hecha a mano.
 *
 * Todo el cálculo ocurre aquí mientras se escribe —precio, subtotal y total—
 * pero ninguno de esos números viaja al servidor: la base los recalcula con el
 * precio real del producto al guardar. Si el precio cambió entre que se abrió
 * el formulario y se pulsó Guardar, manda el catálogo, no la pantalla.
 */

export type ProductOption = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

type Line = {
  /** Clave estable de React: los ids de producto pueden repetirse o faltar */
  key: number;
  productId: string;
  quantity: number;
};

const emptyLine = (key: number): Line => ({ key, productId: "", quantity: 1 });

export function SaleForm({ products }: { products: ProductOption[] }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    createOrderAction,
    null,
  );

  const [lines, setLines] = useState<Line[]>([emptyLine(0)]);
  const [nextKey, setNextKey] = useState(1);

  const productById = new Map(products.map((product) => [product.id, product]));

  const patch = (key: number, changes: Partial<Line>) =>
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...changes } : line)),
    );

  const addLine = () => {
    setLines((prev) => [...prev, emptyLine(nextKey)]);
    setNextKey((key) => key + 1);
  };

  const removeLine = (key: number) =>
    setLines((prev) => {
      const next = prev.filter((line) => line.key !== key);
      // Nunca cero filas: una venta vacía no se puede empezar a escribir.
      return next.length ? next : [emptyLine(nextKey)];
    });

  const subtotalOf = (line: Line) => {
    const product = productById.get(line.productId);
    return product ? product.price * line.quantity : 0;
  };

  const total = lines.reduce((sum, line) => sum + subtotalOf(line), 0);
  const units = lines.reduce(
    (sum, line) => sum + (line.productId ? line.quantity : 0),
    0,
  );

  if (!products.length) {
    return (
      <Panel className="admin-in">
        <PanelHeader
          title="Productos"
          description="Lo que se vendió, con su cantidad"
        />
        <EmptyState
          icon={Plus}
          title="El catálogo está vacío"
          description="Para registrar una venta hace falta al menos un producto con existencias."
          action={
            <Link href="/admin/productos/nuevo" className="admin-btn admin-btn-primary">
              <Plus className="size-4" strokeWidth={2} />
              Nuevo producto
            </Link>
          }
        />
      </Panel>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state && !state.ok && (
        <div
          role="alert"
          className="tone-rose flex items-start gap-3 rounded-2xl px-5 py-4 text-sm"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Detalle de la venta */}
        <Panel className="admin-in">
          <PanelHeader
            title="Productos"
            description="Elige el producto y ajusta la cantidad; el subtotal se calcula solo"
            action={
              <StatusPill tone={units ? "mint" : "neutral"}>
                {units} {units === 1 ? "unidad" : "unidades"}
              </StatusPill>
            }
          />

          <ul className="mt-6 flex flex-col gap-4">
            {lines.map((line, index) => {
              const product = productById.get(line.productId);
              const overStock = product ? line.quantity > product.stock : false;

              return (
                <li key={line.key} className="admin-inset p-4">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-0 flex-1 basis-56">
                      <Label htmlFor={`line-product-${line.key}`}>
                        Producto {index + 1}
                      </Label>
                      <Select
                        id={`line-product-${line.key}`}
                        name="productId"
                        value={line.productId}
                        onChange={(event) =>
                          patch(line.key, { productId: event.target.value })
                        }
                      >
                        <option value="">Seleccionar…</option>
                        {products.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name} · {formatCOP(option.price)}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="w-24 shrink-0">
                      <Label htmlFor={`line-qty-${line.key}`}>Cantidad</Label>
                      <Input
                        id={`line-qty-${line.key}`}
                        name="quantity"
                        type="number"
                        min={1}
                        step={1}
                        value={line.quantity}
                        onChange={(event) =>
                          patch(line.key, {
                            quantity: Math.max(1, Number(event.target.value) || 1),
                          })
                        }
                      />
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                      <span className="text-right">
                        <span className="admin-eyebrow block">Subtotal</span>
                        <span className="admin-title mt-1 block text-[1.05rem]">
                          {formatCOP(subtotalOf(line))}
                        </span>
                      </span>

                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        aria-label={`Quitar el producto ${index + 1}`}
                        className="admin-icon-btn size-9 hover:text-[#b3607f]"
                      >
                        <Trash2 className="size-3.5" strokeWidth={1.9} />
                      </button>
                    </div>
                  </div>

                  {product && (
                    <p
                      className={`mt-3 text-xs ${overStock ? "text-[#b3607f]" : "admin-muted"}`}
                    >
                      {overStock
                        ? `Solo quedan ${product.stock} unidades de este producto.`
                        : `${formatCOP(product.price)} por unidad · ${product.stock} en existencia`}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          <button type="button" onClick={addLine} className="admin-btn mt-4">
            <Plus className="size-4" strokeWidth={2} />
            Agregar producto
          </button>

          <div className="admin-rule my-6" />

          <div className="flex items-end justify-between gap-4">
            <span>
              <span className="admin-eyebrow block">Total de la venta</span>
              <span className="admin-muted mt-1 block text-xs">
                Se descuenta del inventario al guardar
              </span>
            </span>
            <span className="admin-title text-[1.8rem] leading-none">
              {formatCOP(total)}
            </span>
          </div>
        </Panel>

        {/* Cliente y condiciones */}
        <div className="flex flex-col gap-6">
          <Panel className="admin-in">
            <PanelHeader
              title="Cliente"
              description="Todo opcional: se registra lo que se sepa"
            />

            <div className="mt-6 flex flex-col gap-5">
              <Field label="Nombre" htmlFor="o-name">
                <Input
                  id="o-name"
                  name="customerName"
                  maxLength={120}
                  placeholder="Nombre de la clienta"
                />
              </Field>

              <Field label="WhatsApp" htmlFor="o-whatsapp">
                <Input
                  id="o-whatsapp"
                  name="customerWhatsapp"
                  inputMode="tel"
                  maxLength={40}
                  placeholder="300 123 4567"
                />
              </Field>

              <Field label="Ciudad" htmlFor="o-city">
                <Input
                  id="o-city"
                  name="customerCity"
                  maxLength={80}
                  placeholder="Medellín"
                />
              </Field>
            </div>
          </Panel>

          <Panel className="admin-in">
            <PanelHeader title="Venta" description="Cómo se pagó y en qué va" />

            <div className="mt-6 flex flex-col gap-5">
              <Field label="Método de pago" htmlFor="o-payment" required>
                <Select id="o-payment" name="paymentMethod" defaultValue="efectivo">
                  {PAYMENT_METHODS.map((method: PaymentMethod) => (
                    <option key={method} value={method}>
                      {PAYMENT_METHOD_LABEL[method]}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Estado" htmlFor="o-status" required>
                <Select id="o-status" name="status" defaultValue="pagado">
                  {ORDER_STATUSES.map((status: OrderStatus) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_META[status].label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Notas" htmlFor="o-notes">
                <Textarea
                  id="o-notes"
                  name="notes"
                  rows={4}
                  maxLength={500}
                  placeholder="Entrega el sábado, va envuelto para regalo…"
                />
              </Field>
            </div>
          </Panel>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link href="/admin/pedidos" className="admin-btn">
          Cancelar
        </Link>
        <button type="submit" disabled={pending} className="admin-btn admin-btn-primary">
          <Save className="size-4" strokeWidth={1.9} />
          {pending ? "Guardando…" : "Registrar venta"}
        </button>
      </div>
    </form>
  );
}
