-- ============================================================
-- Lo Más Cute — Mensajes de contacto
-- 0011_contact_messages: lo que la gente escribe desde la tienda
-- ============================================================
--
-- Hasta ahora el formulario de /contacto no guardaba nada: esperaba un segundo
-- y decía «mensaje enviado». Esta tabla es donde caen de verdad.
--
-- Decisiones:
--
--  · La tabla es **privada del todo**: RLS activo, sin una sola política y sin
--    privilegios para `anon` ni `authenticated`. Ni lectura ni escritura.
--
--    Lo de la lectura es evidente —lleva nombre, correo y teléfono de quien
--    escribe—. Lo de la escritura es menos obvio y también deliberado: si
--    `anon` pudiera insertar, cualquiera tendría un grifo abierto contra esta
--    tabla y RLS no sabe contar cuántos mensajes lleva alguien en la última
--    hora. La escritura entra por una Server Action que corre en el servidor
--    con `service_role`, y ahí sí se puede limitar.
--
--  · Los topes de longitud se repiten aquí aunque el formulario ya valide. Una
--    Server Action es un endpoint HTTP: se puede llamar sin pasar por la
--    interfaz. El formulario es comodidad; esto es la frontera.
--
--  · `status` es un enum y no un booleano `leido`. «Respondido» y «archivado»
--    son estados distintos de «visto», y quien atiende necesita los cuatro
--    para saber qué le queda por hacer.
--
--  · `topic` es texto y no un enum. La lista de temas del formulario va a
--    cambiar con la tienda y no queremos una migración por cada opción nueva;
--    la lista válida vive en `src/lib/contact.ts` y se comprueba antes de
--    insertar. Lo que se guarda es lo que la persona eligió, tal cual.
--
--  · No se guarda IP ni user-agent. No hacen falta para responder un mensaje,
--    y un dato personal que no se usa es solo una fuga esperando su turno.

-- ------------------------------------------------------------------ enum

do $$
begin
  if not exists (select 1 from pg_type where typname = 'contact_status') then
    create type public.contact_status as enum
      ('nuevo', 'leido', 'respondido', 'archivado');
  end if;
end $$;

-- ----------------------------------------------------------------- tabla

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),

  name        text not null,
  email       text not null,
  -- Opcional: mucha gente prefiere que le respondan por correo y no deja
  -- teléfono. Vacío se guarda como NULL, no como cadena vacía.
  phone       text,
  topic       text not null,
  message     text not null,

  status      public.contact_status not null default 'nuevo',

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint contact_messages_name_length
    check (char_length(name) between 3 and 80),
  -- Comprobación mínima a propósito: validar correos con una expresión
  -- regular estricta rechaza direcciones legítimas. Solo se exige que tenga
  -- forma de correo; si no existe, lo dirá el rebote al responder.
  constraint contact_messages_email_format
    check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint contact_messages_email_length
    check (char_length(email) <= 160),
  constraint contact_messages_phone_length
    check (phone is null or char_length(phone) between 5 and 40),
  constraint contact_messages_topic_length
    check (char_length(topic) between 1 and 80),
  constraint contact_messages_message_length
    check (char_length(message) between 10 and 1000)
);

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at
  before update on public.contact_messages
  for each row execute function public.set_updated_at();

comment on table public.contact_messages is
  'Mensajes del formulario de /contacto. Tabla privada: solo `service_role`. El contrato de validación vive en src/lib/contact.ts.';

-- --------------------------------------------------------------- índices

-- La bandeja se lee siempre igual: filtrada por estado y de la más reciente a
-- la más antigua. Un índice compuesto sirve a las dos cosas de una vez.
create index if not exists contact_messages_status_created_idx
  on public.contact_messages (status, created_at desc);

-- Sin filtro de estado, la bandeja sigue ordenando por fecha.
create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);

-- Para el límite de envíos por correo y hora (ver src/services/contact.ts).
create index if not exists contact_messages_email_created_idx
  on public.contact_messages (email, created_at desc);

-- ------------------------------------------------------------ privilegios

-- Misma regla que en 0002_rls y 0006_orders: una tabla nueva nace con
-- insert/update/delete concedidos a `anon` y `authenticated`. Aquí se les
-- quita todo y no se les devuelve nada — ni el select.

alter table public.contact_messages enable row level security;

revoke all on table public.contact_messages from anon, authenticated;
grant all privileges on table public.contact_messages to service_role;

-- Sin políticas. Ninguna. Con RLS activo y sin política de SELECT, INSERT,
-- UPDATE ni DELETE, la tabla queda cerrada para cualquier rol que no se salte
-- RLS: solo `service_role`, que es quien usa el panel desde el servidor.

-- ------------------------------------------------------------ comprobación
--
-- 1. RLS activo y sin políticas:
--
--      select rowsecurity from pg_tables
--      where schemaname = 'public' and tablename = 'contact_messages';
--      -- true
--
--      select count(*) from pg_policies
--      where schemaname = 'public' and tablename = 'contact_messages';
--      -- 0
--
-- 2. `anon` no tiene ningún privilegio:
--
--      select privilege_type from information_schema.role_table_grants
--      where grantee = 'anon'
--        and table_schema = 'public'
--        and table_name = 'contact_messages';
--      -- cero filas
--
-- 3. Desde la tienda, con la clave pública, un insert tiene que fallar con
--    `42501 permission denied for table contact_messages`. Si respondiera 201,
--    esta migración no se aplicó.
