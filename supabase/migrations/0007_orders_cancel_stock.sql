-- ============================================================
-- Lo Más Cute — Ventas manuales
-- 0007_orders_cancel_stock: cancelar una venta devuelve su stock
-- ============================================================
--
-- Cancelar una venta no la borra: la venta sigue en el historial con su
-- detalle intacto. Lo que cambia es que sus productos vuelven a estar
-- disponibles, porque una venta cancelada ya no los retiene.
--
-- El problema de verdad no es devolver el stock, es devolverlo **una sola
-- vez**. Un contador de transiciones no basta: cancelar, reactivar y volver a
-- cancelar pasaría dos veces por el mismo punto y devolvería el doble.
--
-- Por eso la venta guarda si su stock está devuelto o no. Deja de ser una
-- deducción a partir del estado y pasa a ser un hecho registrado, que es lo
-- único que se puede comprobar antes de tocar el inventario.
--
-- La regla que sostiene todo:
--
--     una venta retiene stock  ⟺  stock_returned = false
--
-- Y de ahí salen los tres caminos:
--
--   · pasa a cancelada    → devuelve, salvo que ya estuviera devuelto
--   · deja de estar cancelada → vuelve a descontar, si lo había devuelto
--   · se elimina          → devuelve, salvo que ya estuviera devuelto
--
-- Nada de esto vive en la aplicación: cambiar el estado sigue siendo un
-- `update` de una columna. El inventario se ajusta solo, en la misma
-- transacción, y no hay forma de saltárselo desde fuera.

-- --------------------------------------------------------------- la marca

alter table public.orders
  add column if not exists stock_returned boolean not null default false;

comment on column public.orders.stock_returned is
  'true cuando el stock de esta venta ya volvió al catálogo. Es el seguro contra devolverlo dos veces.';

-- Las ventas que ya existían descontaron stock al crearse y nadie se lo ha
-- devuelto: `false` es exactamente su situación, así que el default vale y no
-- hace falta rellenar nada a mano.

-- ------------------------------------------------------------- disparador

create or replace function public.sync_order_stock()
returns trigger
language plpgsql
as $$
declare
  v_line record;
begin
  -- ---------------------------------------------------- pasa a cancelada
  if new.status = 'cancelado' and old.status <> 'cancelado' then
    -- Ya se devolvió antes (por ejemplo: cancelada, reactivada sin stock que
    -- descontar, y cancelada otra vez). No se toca el inventario.
    if new.stock_returned then
      return new;
    end if;

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
  end if;

  -- ------------------------------------------- deja de estar cancelada
  --
  -- La venta vuelve a estar viva, así que vuelve a retener sus productos. Sin
  -- esto, cancelar y reactivar sería una forma de fabricar inventario.
  if old.status = 'cancelado' and new.status <> 'cancelado' then
    -- Nunca se devolvió (venta registrada ya como cancelada, o cancelada
    -- antes de esta migración): el stock sigue descontado, no hay nada que
    -- volver a descontar.
    if not old.stock_returned then
      return new;
    end if;

    -- Se comprueba todo antes de mover nada: o se reactiva entera o no se
    -- reactiva. Una venta a medio descontar sería peor que no reactivarla.
    for v_line in
      select p.name, p.stock, i.quantity
      from public.order_items i
      join public.products p on p.id = i.product_id
      where i.order_id = new.id
    loop
      if v_line.stock < v_line.quantity then
        raise exception
          'No se puede reactivar la venta: faltan unidades de "%" (hay %, hacen falta %).',
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

  return new;
end;
$$;

comment on function public.sync_order_stock() is
  'Devuelve o vuelve a descontar el stock de una venta según entre o salga del estado cancelado.';

-- `before`, no `after`: así el cambio de `stock_returned` se guarda en el
-- mismo UPDATE que el estado, sin una escritura extra que pudiera quedarse a
-- medias.
drop trigger if exists orders_sync_stock on public.orders;
create trigger orders_sync_stock
  before update of status on public.orders
  for each row
  when (old.status is distinct from new.status)
  execute function public.sync_order_stock();

-- ------------------------------------------------------- eliminar venta
--
-- Misma regla: solo se devuelve el stock que la venta todavía retenía. Sin
-- esto, borrar una venta ya cancelada devolvería el stock por segunda vez.

create or replace function public.delete_order(p_order_id uuid)
returns void
language plpgsql
as $$
declare
  v_line     record;
  v_returned boolean;
begin
  select stock_returned into v_returned
  from public.orders
  where id = p_order_id;

  if not found then
    raise exception 'Esa venta ya no existe.';
  end if;

  if not v_returned then
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
  end if;

  delete from public.orders where id = p_order_id;
end;
$$;

-- Postgres concede EXECUTE a PUBLIC en cada función nueva: hay que quitarlo.
-- (`create or replace` conserva los permisos de `delete_order`, pero la
-- función del disparador es nueva.)
revoke all on function public.sync_order_stock() from public, anon, authenticated;
grant execute on function public.sync_order_stock() to service_role;

-- ------------------------------------------------------------ comprobación
--
-- Con una venta pagada de un producto cualquiera:
--
--   select p.stock from public.products p
--   join public.order_items i on i.product_id = p.id
--   where i.order_id = '<id>';
--
--   update public.orders set status = 'cancelado' where id = '<id>';  -- +stock
--   update public.orders set status = 'cancelado' where id = '<id>';  -- sin efecto
--   update public.orders set status = 'pagado'    where id = '<id>';  -- -stock
--   update public.orders set status = 'cancelado' where id = '<id>';  -- +stock
--
-- El stock debe acabar exactamente igual que tras la primera cancelación, y
-- la venta seguir existiendo con su detalle completo.
