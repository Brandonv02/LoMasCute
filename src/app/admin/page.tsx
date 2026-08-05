import { redirect } from "next/navigation";

/** /admin no es una pantalla: es la puerta al panel. */
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
