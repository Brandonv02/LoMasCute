-- ============================================================
-- Lo Más Cute — Pedidos desde la tienda
-- 0012_customer_orders: el checkout deja de simular
-- ============================================================
--
-- Hasta ahora `orders` solo servía para registrar a mano una venta que ya había
-- ocurrido. Con esta migración la tienda puede crear pedidos por su cuenta, y
-- eso cambia dos cosas de fondo.
--
-- ------------------------------------------------------------------------
-- 1. Un pedido web es un aviso, no una venta
-- ------------------------------------------------------------------------
--
-- Alguien compra en la tienda y el pedido entra en `pendiente` **sin tocar el
-- inventario**. Quien atiende lo revisa, confirma que se pagó y, en ese
-- momento, se descuenta el stock. Es el mismo flujo que ya se hacía por
-- WhatsApp; el formulario solo ahorra transcribir los datos.
--
-- La consecuencia hay que decirla clara: dos personas pueden pedir la última
-- unidad. Los dos pedidos entran y el segundo fallará al confirmarse, con el
-- mensaje de siempre («No hay stock suficiente de …»). Es exactamente lo que
-- pasa hoy con dos WhatsApp seguidos: no se reserva nada porque nadie ha
-- pagado nada.
--
-- ------------------------------------------------------------------------
-- 2. La regla de stock se unifica
-- ------------------------------------------------------------------------
--
-- 0007 dejó establecida la regla que sostiene el inventario:
--
--     un pedido retiene stock  ⟺  stock_returned = false
--
-- ...pero su disparador solo reaccionaba a **entrar y salir de `cancelado`**.
-- Una transición `pendiente → pagado` no entraba en ninguna rama y no movía
-- nada, así que el flujo de arriba no habría funcionado.
--
-- En vez de añadir una rama más, se generaliza la pregunta. Antes era «¿entró
-- o salió de cancelado?»; ahora es «¿este estado retiene stock?»:
--
--     pagado, entregado      → retienen
--     pendiente, cancelado   → no retienen
--
-- El disparador compara ese deseo con la realidad registrada en
-- `stock_returned` y mueve el inventario solo si difieren. Sale más corto que
-- el anterior, cubre todas las transiciones —no solo las de cancelado— y sigue
-- siendo idempotente por construcción: cancelar dos veces, o confirmar algo ya
-- confirmado, no mueve nada.
--
-- Esto cambia un comportamiento que ya existía: **una venta manual registrada
-- como `pendiente` ya no descuenta stock al crearse.** Es deliberado. Que
-- `pendiente` signifique lo mismo en los dos canales —«esto todavía no es una
-- venta»— deja una sola regla que mantener en vez de dos.
--
-- Los pedidos que ya están en la base no corren riesgo: el disparador se guía
-- por la marca y no por el estado anterior, así que un pedido que ya descontó
-- no puede descontar dos veces. Al final del archivo hay una consulta opcional
-- para poner al día las ventas pendientes antiguas, si se quiere.

-- ------------------------------------------------------------------ enum

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_channel') then
    -- De dónde salió el pedido. `manual` es el default porque todo lo que ya
    -- existe en la tabla se registró a mano.
    create type public.order_channel as enum ('manual', 'online');
  end if;
end $$;

-- --------------------------------------------------------------- columnas

alter table public.orders
  add column if not exists channel public.order_channel not null default 'manual',
  -- El checkout lo pide obligatorio; una venta a mano casi nunca lo tiene.
  add column if not exists customer_email text,
  add column if not exists shipping_address text,
  add column if not exists shipping_neighborhood text,
  -- Costo del domicilio en pesos. Lo calcula la base leyendo site_settings.
  add column if not exists shipping_cost integer not null default 0,
  add column if not exists is_gift boolean not null default false,
  /*
   * Lo que la persona eligió como forma de pago, tal cual.
   *
   * `payment_method` es un enum cerrado y los medios de pago de la tienda son
   * texto libre en site_settings: si alguien configura «Addi» o «Nequi 💜», no
   * existe en el enum, y meter cada opción nueva obligaría a una migración cada
   * vez que el panel edita su lista. Así que se guardan las dos cosas: el enum
   * como casilla interna para agrupar, y esta columna con la etiqueta real que
   * vio el cliente.
   */
  add column if not exists payment_label text,
  /*
   * Llave contra el doble envío.
   *
   * El navegador la genera una vez por intento de compra. Si el mismo pedido
   * llega dos veces —doble clic, reintento tras un error de red— la segunda
   * devuelve el pedido que ya existe en vez de crear otro. NULL para las
   * ventas manuales, y Postgres admite tantos NULL como se quiera en un índice
   * único.
   */
  add column if not exists idempotency_key text;

alter table public.orders
  drop constraint if exists orders_shipping_cost_positive;
alter table public.orders
  add constraint orders_shipping_cost_positive check (shipping_cost >= 0);

create unique index if not exists orders_idempotency_key_idx
  on public.orders (idempotency_key)
  where idempotency_key is not null;

-- Para separar pedidos web de ventas a mano en el panel y el dashboard.
create index if not exists orders_channel_created_idx
  on public.orders (channel, created_at desc);

comment on column public.orders.channel is
  'De dónde salió el pedido: `online` lo creó el checkout, `manual` lo registró el panel.';
comment on column public.orders.shipping_cost is
  'Domicilio en pesos, calculado por la base desde site_settings. `total` ya lo incluye.';
comment on column public.orders.payment_label is
  'Forma de pago tal como la eligió el cliente. El enum `payment_method` es la casilla interna.';

/*
 * El tono elegido.
 *
 * Sin esto, un pedido de un labial no dice **cuál** labial hay que empacar. Se
 * copia igual que el nombre y el precio: si mañana la ficha cambia sus tonos,
 * el pedido de ayer sigue diciendo lo que se pidió.
 *
 * Hoy solo lo llena el checkout; el formulario de venta manual no pregunta el
 * tono, así que ahí queda NULL.
 */
alter table public.order_items
  add column if not exists shade text;

-- ------------------------------------------------- ¿este estado retiene stock?

/*
 * El corazón de la regla unificada, en un solo sitio.
 *
 * Está aparte y es `immutable` para que tanto el disparador como las funciones
 * de creación pregunten exactamente lo mismo. Cambiar la política de
 * inventario es cambiar esta lista y nada más.
 */
create or replace function public.order_status_retains_stock(
  p_status public.order_status
)
returns boolean
language sql
immutable
as $$
  select p_status in ('pagado', 'entregado');
$$;

comment on function public.order_status_retains_stock(public.order_status) is
  'true si un pedido en ese estado retiene inventario. pendiente y cancelado no retienen.';

-- ----------------------------------------------------- disparador de stock

create or replace function public.sync_order_stock()
returns trigger
language plpgsql
as $$
declare
  v_line   record;
  v_quiere boolean;  -- ¿el estado nuevo debería retener stock?
  v_tiene  boolean;  -- ¿lo retiene ahora mismo?
begin
  v_quiere := public.order_status_retains_stock(new.status);
  -- La marca es la única verdad sobre la realidad del inventario. Deducirlo de
  -- `old.status` rompería con los pedidos anteriores a esta migración, que
  -- pueden estar en `pendiente` y aun así tener el stock descontado.
  v_tiene := not new.stock_returned;

  if v_quiere = v_tiene then
    return new;  -- ya está como tiene que estar: no se toca el inventario
  end if;

  if v_quiere then
    -- Se comprueba todo antes de mover nada: o se descuenta entero o no se
    -- descuenta. Un pedido a medio descontar sería peor que uno sin confirmar.
    for v_line in
      select p.name, p.stock, i.quantity
      from public.order_items i
      join public.products p on p.id = i.product_id
      where i.order_id = new.id
    loop
      if v_line.stock < v_line.quantity then
        raise exception
          'No hay stock suficiente de "%": quedan % unidades y hacen falta %.',
          v_line.name, v_line.stock, v_line.quantity;
      end if;
    end loop;

    for v_line in
      select product_id, quantity
      from public.order_items
      where order_id = new.id
        and product_id is not null
    loop
      update public.products
      set stock = stock - v_line.quantity
      where id = v_line.product_id;
    end loop;

    new.stock_returned := false;
    return new;
  end if;

  -- Deja de retener: el inventario vuelve al catálogo.
  for v_line in
    select product_id, quantity
    from public.order_items
    where order_id = new.id
      and product_id is not null
  loop
    update public.products
    set stock = stock + v_line.quantity
    where id = v_line.product_id;
  end loop;

  new.stock_returned := true;
  return new;
end;
$$;

comment on function public.sync_order_stock() is
  'Ajusta el inventario cuando cambia el estado del pedido, según order_status_retains_stock. Idempotente: se guía por stock_returned.';

-- El disparador de 0007 sigue sirviendo tal cual: se dispara con cualquier
-- cambio de estado y ahora la función sabe qué hacer con todos ellos.
drop trigger if exists orders_sync_stock on public.orders;
create trigger orders_sync_stock
  before update of status on public.orders
  for each row
  when (old.status is distinct from new.status)
  execute function public.sync_order_stock();

-- ------------------------------------------- crear venta manual (atómico)
--
-- Se reemplaza por dos motivos: respetar la regla unificada (una venta
-- registrada como `pendiente` ya no descuenta) y que `total` incluya el
-- domicilio, que ahora existe como columna.

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
  v_status   public.order_status;
  v_retiene  boolean;
begin
  if payload->'items' is null or jsonb_typeof(payload->'items') <> 'array' then
    raise exception 'La venta necesita al menos un producto.';
  end if;

  v_status := coalesce(nullif(payload->>'status', ''), 'pendiente')::public.order_status;
  v_retiene := public.order_status_retains_stock(v_status);

  insert into public.orders (
    customer_name,
    customer_whatsapp,
    customer_city,
    payment_method,
    status,
    notes,
    -- Nace coherente con la regla: si el estado no retiene, el pedido no
    -- tiene stock que devolver, y eso es justo lo que dice la marca.
    stock_returned
  )
  values (
    nullif(btrim(coalesce(payload->>'customer_name', '')), ''),
    nullif(btrim(coalesce(payload->>'customer_whatsapp', '')), ''),
    nullif(btrim(coalesce(payload->>'customer_city', '')), ''),
    coalesce(nullif(payload->>'payment_method', ''), 'efectivo')::public.payment_method,
    v_status,
    nullif(btrim(coalesce(payload->>'notes', '')), ''),
    not v_retiene
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    v_quantity := nullif(v_item->>'quantity', '')::integer;

    if v_quantity is null or v_quantity < 1 then
      raise exception 'Cada producto necesita una cantidad de 1 o más.';
    end if;

    -- `for update` solo hace falta cuando de verdad se va a descontar: es lo
    -- que impide que dos ventas simultáneas lean el mismo stock.
    if v_retiene then
      select * into v_product
      from public.products
      where id = nullif(v_item->>'product_id', '')::uuid
      for update;
    else
      select * into v_product
      from public.products
      where id = nullif(v_item->>'product_id', '')::uuid;
    end if;

    if not found then
      raise exception 'Uno de los productos seleccionados ya no existe.';
    end if;

    if v_retiene and v_product.stock < v_quantity then
      raise exception 'No hay stock suficiente de "%": quedan % unidades.',
        v_product.name, v_product.stock;
    end if;

    insert into public.order_items (
      order_id, product_id, product_name, unit_price, quantity
    )
    values (
      v_order_id, v_product.id, v_product.name, v_product.price, v_quantity
    );

    if v_retiene then
      update public.products
      set stock = stock - v_quantity
      where id = v_product.id;
    end if;

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
  ) + o.shipping_cost
  where o.id = v_order_id;

  return v_order_id;
end;
$$;

comment on function public.create_manual_order(jsonb) is
  'Registra una venta a mano con su detalle. Descuenta stock solo si el estado retiene (ver order_status_retains_stock). Todo o nada.';

-- --------------------------------------------- crear pedido web (atómico)
--
-- Hermana de `create_manual_order`, con cuatro diferencias:
--
--   1. Exige correo, dirección y barrio. Sin ellos no hay a dónde enviar.
--   2. Solo vende productos **publicados**. A mano se puede vender un
--      borrador; la tienda pública no.
--   3. Calcula el domicilio ella misma leyendo site_settings. Si ese número
--      llegara desde el navegador, cualquiera se manda un envío gratis.
--   4. No toca el inventario. Nace en `pendiente`, que no retiene.
--
-- Formato esperado:
--   {
--     "idempotency_key": "uuid",
--     "customer_name": "…", "customer_email": "…", "customer_whatsapp": "…",
--     "customer_city": "…", "shipping_address": "…",
--     "shipping_neighborhood": "…", "payment_method": "nequi",
--     "payment_label": "Nequi", "notes": "…", "is_gift": true,
--     "items": [{ "product_id": "uuid", "quantity": 2, "shade": "Coral" }]
--   }

create or replace function public.create_customer_order(payload jsonb)
returns uuid
language plpgsql
as $$
declare
  v_order_id    uuid;
  v_item        jsonb;
  v_product     public.products%rowtype;
  v_quantity    integer;
  v_lines       integer := 0;
  v_key         text;
  v_email       text;
  v_address     text;
  v_hood        text;
  v_items_total integer;
  v_price       integer;
  v_free_from   integer;
  v_shipping    integer;
begin
  if payload->'items' is null or jsonb_typeof(payload->'items') <> 'array' then
    raise exception 'Tu bolsa está vacía.';
  end if;

  v_email   := nullif(btrim(coalesce(payload->>'customer_email', '')), '');
  v_address := nullif(btrim(coalesce(payload->>'shipping_address', '')), '');
  v_hood    := nullif(btrim(coalesce(payload->>'shipping_neighborhood', '')), '');

  if v_email is null then
    raise exception 'Necesitamos tu correo para confirmarte el pedido.';
  end if;
  if v_address is null or v_hood is null then
    raise exception 'Necesitamos la dirección y el barrio para poder enviarte el pedido.';
  end if;

  v_key := nullif(btrim(coalesce(payload->>'idempotency_key', '')), '');

  -- Mismo intento que ya entró: se devuelve el pedido que existe. No se crea
  -- otro ni se duplica el detalle.
  if v_key is not null then
    select id into v_order_id from public.orders where idempotency_key = v_key;
    if v_order_id is not null then
      return v_order_id;
    end if;
  end if;

  begin
    insert into public.orders (
      channel,
      customer_name,
      customer_email,
      customer_whatsapp,
      customer_city,
      shipping_address,
      shipping_neighborhood,
      payment_method,
      payment_label,
      status,
      notes,
      is_gift,
      idempotency_key,
      -- `pendiente` no retiene inventario: el pedido no tiene stock que
      -- devolver, y la marca lo dice desde el primer momento.
      stock_returned
    )
    values (
      'online',
      nullif(btrim(coalesce(payload->>'customer_name', '')), ''),
      v_email,
      nullif(btrim(coalesce(payload->>'customer_whatsapp', '')), ''),
      nullif(btrim(coalesce(payload->>'customer_city', '')), ''),
      v_address,
      v_hood,
      coalesce(nullif(payload->>'payment_method', ''), 'otro')::public.payment_method,
      nullif(btrim(coalesce(payload->>'payment_label', '')), ''),
      'pendiente',
      nullif(btrim(coalesce(payload->>'notes', '')), ''),
      coalesce((payload->>'is_gift')::boolean, false),
      v_key,
      true
    )
    returning id into v_order_id;
  exception
    when unique_violation then
      -- Dos envíos a la vez con la misma llave: uno ganó la carrera y este
      -- devuelve el pedido de aquel.
      --
      -- Sin llave no hay nada que recuperar: la única otra columna única es
      -- `code`, que sale de una secuencia, así que un choque ahí sería un fallo
      -- real y tiene que verse en vez de devolver NULL en silencio.
      if v_key is null then
        raise;
      end if;

      select id into v_order_id from public.orders where idempotency_key = v_key;
      return v_order_id;
  end;

  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    v_quantity := nullif(v_item->>'quantity', '')::integer;

    if v_quantity is null or v_quantity < 1 then
      raise exception 'Alguna cantidad de tu bolsa no es válida.';
    end if;

    -- Sin `for update`: no se reserva nada, así que no hay nada que bloquear.
    select * into v_product
    from public.products
    where id = nullif(v_item->>'product_id', '')::uuid;

    if not found or v_product.status <> 'published' then
      raise exception
        'Uno de los productos de tu bolsa ya no está disponible. Revísala y vuelve a intentarlo.';
    end if;

    /*
     * Se comprueba el stock, pero no se reserva.
     *
     * Es una cortesía: mejor decirlo ahora que aceptar el pedido y rechazarlo
     * mañana. Dos personas pueden pasar esta comprobación con la misma última
     * unidad —nadie ha pagado, nada está apartado— y eso es exactamente el
     * trato: el inventario se mueve cuando el panel confirma.
     */
    if v_product.stock < v_quantity then
      if v_product.stock = 0 then
        raise exception 'Se nos acabó "%". Quítalo de la bolsa para continuar.',
          v_product.name;
      end if;
      raise exception 'Solo quedan % unidades de "%". Ajusta la cantidad para continuar.',
        v_product.stock, v_product.name;
    end if;

    -- El precio sale del catálogo, nunca del navegador.
    v_price := v_product.price;

    insert into public.order_items (
      order_id, product_id, product_name, unit_price, quantity, shade
    )
    values (
      v_order_id,
      v_product.id,
      v_product.name,
      v_price,
      v_quantity,
      nullif(btrim(coalesce(v_item->>'shade', '')), '')
    );

    v_lines := v_lines + 1;
  end loop;

  if v_lines = 0 then
    raise exception 'Tu bolsa está vacía.';
  end if;

  select coalesce(sum(i.subtotal), 0) into v_items_total
  from public.order_items i
  where i.order_id = v_order_id;

  /*
   * El domicilio, calculado aquí y no recibido.
   *
   * La regla tiene que ser la misma que pinta el carrito en
   * `src/lib/store.tsx`: envío gratis a partir de `free_shipping_from` (si es
   * mayor que cero) y, si no, el costo de `shipping_price`. Si una de las dos
   * cambia, hay que cambiar la otra: el cliente vería un total y se le
   * guardaría otro.
   */
  select coalesce(nullif(value #>> '{}', '')::integer, 0) into v_shipping
  from public.site_settings where key = 'shipping_price';
  select coalesce(nullif(value #>> '{}', '')::integer, 0) into v_free_from
  from public.site_settings where key = 'free_shipping_from';

  v_shipping  := coalesce(v_shipping, 0);
  v_free_from := coalesce(v_free_from, 0);

  if v_free_from > 0 and v_items_total >= v_free_from then
    v_shipping := 0;
  end if;

  update public.orders
  set shipping_cost = v_shipping,
      total = v_items_total + v_shipping
  where id = v_order_id;

  return v_order_id;
end;
$$;

comment on function public.create_customer_order(jsonb) is
  'Crea un pedido hecho desde la tienda. No mueve inventario: nace en pendiente y el stock baja cuando el panel lo confirma.';

-- ------------------------------------------------------------ privilegios

-- Postgres concede EXECUTE a PUBLIC en cada función nueva: hay que quitarlo.
-- La tienda no llama a estas funciones desde el navegador —no podría, la tabla
-- está cerrada a `anon`— sino desde una Server Action con `service_role`.
revoke all on function public.create_customer_order(jsonb) from public, anon, authenticated;
revoke all on function public.order_status_retains_stock(public.order_status)
  from public, anon, authenticated;

grant execute on function public.create_customer_order(jsonb) to service_role;
grant execute on function public.order_status_retains_stock(public.order_status)
  to service_role;

-- ------------------------------------------------------------ comprobación
--
-- 1. La regla nueva responde lo que debe:
--
--      select s, public.order_status_retains_stock(s)
--      from unnest(enum_range(null::public.order_status)) s;
--
--    pendiente=false, pagado=true, entregado=true, cancelado=false.
--
-- 2. Un pedido web no toca el stock al entrar, y sí al confirmarse:
--
--      select public.create_customer_order(jsonb_build_object(
--        'customer_name', 'Prueba',
--        'customer_email', 'prueba@ejemplo.com',
--        'shipping_address', 'Calle 1 #2-3',
--        'shipping_neighborhood', 'Centro',
--        'payment_label', 'Nequi',
--        'payment_method', 'nequi',
--        'items', jsonb_build_array(jsonb_build_object(
--          'product_id', (select id from public.products where status = 'published' limit 1),
--          'quantity', 1
--        ))
--      ));
--
--    El stock del producto debe seguir igual. Luego:
--
--      update public.orders set status = 'pagado' where id = '<id>';   -- -1
--      update public.orders set status = 'cancelado' where id = '<id>'; -- +1
--      update public.orders set status = 'cancelado' where id = '<id>'; -- sin efecto
--
-- 3. La misma llave no crea dos pedidos: repite la llamada del punto 2 con el
--    mismo `idempotency_key` y comprueba que devuelve el mismo uuid y que
--    `select count(*) from public.orders where idempotency_key = '…'` da 1.
--
-- ------------------------------------------------------------------------
-- OPCIONAL: poner al día las ventas pendientes antiguas
-- ------------------------------------------------------------------------
--
-- Las ventas registradas a mano antes de esta migración descontaron stock al
-- crearse, también las que quedaron en `pendiente`. Con la regla nueva esas
-- ventas no deberían estar reteniendo inventario.
--
-- No se corrige automáticamente **a propósito**: mover stock por su cuenta en
-- una migración cambiaría cifras de inventario reales sin que nadie lo haya
-- pedido, y lo más probable es que esas ventas pendientes sí ocurrieran y solo
-- falte marcarlas como pagadas desde el panel — que es lo recomendable.
--
-- Si de verdad se quiere devolver ese stock, la forma segura es una por una,
-- desde el panel: cancelar la venta (devuelve el stock) o confirmarla. Y si se
-- prefiere en bloque, esto es lo que habría que ejecutar **revisando antes qué
-- ventas salen**:
--
--   select id, code, created_at, total from public.orders
--   where status = 'pendiente' and not stock_returned;
--
--   -- Solo después de revisar la lista de arriba:
--   -- update public.orders o
--   --    set stock_returned = true
--   --  where o.status = 'pendiente' and not o.stock_returned;
--   -- ...seguido de devolver a mano el stock de sus líneas, porque este UPDATE
--   -- no dispara `orders_sync_stock` (solo se dispara al cambiar `status`).
