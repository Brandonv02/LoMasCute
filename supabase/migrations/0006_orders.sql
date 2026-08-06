-- ============================================================
-- Lo Más Cute — Ventas manuales
-- 0006_orders: tablas `orders` y `order_items` + movimiento de stock
-- ============================================================
--
-- Alcance deliberadamente pequeño: registrar a mano una venta que ya ocurrió
-- (por WhatsApp, en persona, por Instagram) y que el inventario se entere.
-- No es un checkout ni un CRM: el cliente es texto libre y opcional, porque
-- muchas ventas se cierran sin pedir más que un nombre.
--
-- Decisiones:
--
--  · El detalle **copia** nombre y precio del producto en el momento de la
--    venta. Si mañana sube el precio o se renombra la referencia, la venta
--    de ayer sigue diciendo lo que se cobró. Un pedido histórico no puede
--    cambiar porque cambie el catálogo.
--  · `product_id` es `on delete set null`: borrar un producto no puede borrar
--    la venta, pero la venta deja de poder devolverle stock (ya no existe).
--  · El stock se mueve **dentro de funciones**, no desde la aplicación. Crear
--    una venta toca tres tablas; si el descuento de stock fuera una llamada
--    aparte, un fallo a mitad dejaría el inventario mintiendo. Aquí o pasa
--    todo o no pasa nada.
--  · `code` es legible (LMC-0001) porque es lo que se dicta por teléfono.
--    Sale de una secuencia: nunca se repite, ni siquiera con dos ventas
--    simultáneas.

-- ------------------------------------------------------------------ enums

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('pendiente', 'pagado', 'entregado', 'cancelado');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type public.payment_method as enum ('efectivo', 'nequi', 'bancolombia', 'transferencia', 'otro');
  end if;
end $$;

-- ----------------------------------------------------------------- ventas

create sequence if not exists public.orders_code_seq;

create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  code               text not null unique
                       default 'LMC-' || lpad(nextval('public.orders_code_seq')::text, 4, '0'),

  -- Todo lo del cliente es opcional: se registra lo que se sepa.
  customer_name      text,
  customer_whatsapp  text,
  customer_city      text,

  payment_method     public.payment_method not null default 'efectivo',
  status             public.order_status not null default 'pendiente',
  notes              text,

  /** Suma de los subtotales. La calcula `create_manual_order`, no la app. */
  total              integer not null default 0,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint orders_total_positive check (total >= 0)
);

create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

comment on table public.orders is
  'Ventas registradas a mano desde el panel. El cliente es opcional: no hay tabla de clientes todavía.';

-- ---------------------------------------------------------------- detalle

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  -- Se conserva la línea aunque el producto desaparezca del catálogo.
  product_id    uuid references public.products (id) on delete set null,

  -- Copia histórica: lo que se vendió y a qué precio, ese día.
  product_name  text not null,
  unit_price    integer not null,
  quantity      integer not null,

  subtotal      integer generated always as (unit_price * quantity) stored,
  created_at    timestamptz not null default now(),

  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_price_positive check (unit_price >= 0)
);

create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_items_product_idx on public.order_items (product_id);

comment on column public.order_items.product_name is
  'Nombre del producto al vender. No se sincroniza con el catálogo a propósito.';

-- ------------------------------------------------------------ privilegios

-- A diferencia del catálogo, esto **no** es público: lleva nombre y teléfono
-- de quien compró. Ni `anon` ni `authenticated` pueden leerlo. RLS queda
-- activo y sin políticas, así que solo `service_role` (servidor) lo alcanza.

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

revoke all on table public.orders      from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;

grant all privileges on table public.orders      to service_role;
grant all privileges on table public.order_items to service_role;

grant usage, select on sequence public.orders_code_seq to service_role;

-- --------------------------------------------------- crear venta (atómico)
--
-- Recibe la venta entera en JSON y devuelve el id creado. Si cualquier línea
-- falla —producto inexistente, stock insuficiente— la transacción se deshace
-- completa: no queda ni la venta ni el descuento de stock.
--
-- Formato esperado:
--   {
--     "customer_name": "…", "customer_whatsapp": "…", "customer_city": "…",
--     "payment_method": "nequi", "status": "pagado", "notes": "…",
--     "items": [{ "product_id": "uuid", "quantity": 2 }]
--   }

create or replace function public.create_manual_order(payload jsonb)
returns uuid
language plpgsql
as $$
declare
  v_order_id uuid;
  v_item     jsonb;
  v_product  public.products%rowtype;
  v_quantity integer;
  v_lines    integer := 0;
begin
  if payload->'items' is null or jsonb_typeof(payload->'items') <> 'array' then
    raise exception 'La venta necesita al menos un producto.';
  end if;

  insert into public.orders (
    customer_name,
    customer_whatsapp,
    customer_city,
    payment_method,
    status,
    notes
  )
  values (
    nullif(btrim(coalesce(payload->>'customer_name', '')), ''),
    nullif(btrim(coalesce(payload->>'customer_whatsapp', '')), ''),
    nullif(btrim(coalesce(payload->>'customer_city', '')), ''),
    coalesce(nullif(payload->>'payment_method', ''), 'efectivo')::public.payment_method,
    coalesce(nullif(payload->>'status', ''), 'pendiente')::public.order_status,
    nullif(btrim(coalesce(payload->>'notes', '')), '')
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    v_quantity := nullif(v_item->>'quantity', '')::integer;

    if v_quantity is null or v_quantity < 1 then
      raise exception 'Cada producto necesita una cantidad de 1 o más.';
    end if;

    -- `for update` bloquea la fila: dos ventas simultáneas del mismo producto
    -- no pueden leer el mismo stock y descontarlo dos veces.
    select * into v_product
    from public.products
    where id = nullif(v_item->>'product_id', '')::uuid
    for update;

    if not found then
      raise exception 'Uno de los productos seleccionados ya no existe.';
    end if;

    if v_product.stock < v_quantity then
      raise exception 'No hay stock suficiente de "%": quedan % unidades.',
        v_product.name, v_product.stock;
    end if;

    insert into public.order_items (
      order_id, product_id, product_name, unit_price, quantity
    )
    values (
      v_order_id, v_product.id, v_product.name, v_product.price, v_quantity
    );

    update public.products
    set stock = stock - v_quantity
    where id = v_product.id;

    v_lines := v_lines + 1;
  end loop;

  if v_lines = 0 then
    raise exception 'La venta necesita al menos un producto.';
  end if;

  -- El total se calcula de lo guardado, no de lo que mandó el cliente.
  update public.orders o
  set total = (
    select coalesce(sum(i.subtotal), 0)
    from public.order_items i
    where i.order_id = o.id
  )
  where o.id = v_order_id;

  return v_order_id;
end;
$$;

comment on function public.create_manual_order(jsonb) is
  'Crea una venta con su detalle y descuenta stock. Todo o nada.';

-- ------------------------------------------------ eliminar venta (atómico)
--
-- Devuelve al catálogo lo que la venta había descontado y luego la borra. El
-- detalle cae solo por la clave foránea.

create or replace function public.delete_order(p_order_id uuid)
returns void
language plpgsql
as $$
declare
  v_line record;
begin
  if not exists (select 1 from public.orders where id = p_order_id) then
    raise exception 'Esa venta ya no existe.';
  end if;

  for v_line in
    select product_id, quantity
    from public.order_items
    where order_id = p_order_id
      and product_id is not null
  loop
    update public.products
    set stock = stock + v_line.quantity
    where id = v_line.product_id;
  end loop;

  delete from public.orders where id = p_order_id;
end;
$$;

comment on function public.delete_order(uuid) is
  'Elimina una venta y devuelve su stock al catálogo.';

-- Postgres concede EXECUTE a PUBLIC en cada función nueva: hay que quitarlo.
revoke all on function public.create_manual_order(jsonb) from public, anon, authenticated;
revoke all on function public.delete_order(uuid)         from public, anon, authenticated;

grant execute on function public.create_manual_order(jsonb) to service_role;
grant execute on function public.delete_order(uuid)         to service_role;

-- ------------------------------------------------------------ comprobación
--
-- 1. Las dos tablas existen y están cerradas al público:
--
--      select tablename, rowsecurity
--      from pg_tables
--      where schemaname = 'public' and tablename in ('orders', 'order_items');
--
-- 2. Una venta de prueba descuenta stock y al borrarla vuelve:
--
--      select public.create_manual_order(jsonb_build_object(
--        'customer_name', 'Prueba',
--        'payment_method', 'efectivo',
--        'status', 'pagado',
--        'items', jsonb_build_array(
--          jsonb_build_object('product_id', (select id from public.products limit 1), 'quantity', 1)
--        )
--      ));
--
--    Comprueba el stock antes y después, y luego:
--
--      select public.delete_order('<id devuelto>');
