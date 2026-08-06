"use client";

import { createContext, useContext } from "react";
import {
  EMPTY_SITE_SETTINGS_VIEW,
  type SiteSettingsView,
} from "@/lib/site-settings";

/**
 * Los ajustes de la tienda, disponibles en el cliente.
 *
 * El carrito, el checkout, la ficha de producto y la cabecera son componentes
 * de cliente: no pueden leer Supabase. El layout raíz ya trae `site_settings`
 * en el servidor, así que los baja una sola vez por aquí en lugar de repetir
 * el dato en cada componente.
 *
 * El valor por defecto es la configuración vacía —no un ejemplo—: un
 * componente montado fuera del proveedor se comporta como si nada estuviera
 * configurado y oculta lo que no tiene dato.
 */
const SiteSettingsContext = createContext<SiteSettingsView>(
  EMPTY_SITE_SETTINGS_VIEW,
);

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettingsView;
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsView {
  return useContext(SiteSettingsContext);
}
