"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { AlertTriangle, ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { imageRejectionReason } from "@/lib/product-images";
import {
  createLogoUploadTicketAction,
  removeLogoAction,
  setLogoAction,
} from "@/app/admin/(panel)/configuracion/actions";
import { Meter, StatusPill } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/**
 * Logo de la marca.
 *
 * Mismo patrón que `HeroImageField`: se guarda solo, sin pasar por "Guardar
 * cambios", porque va a Storage y no al formulario. Mientras nadie suba uno
 * propio, se muestra el logo de fábrica — no un hueco vacío, porque el logo
 * es parte del andamiaje de la tienda, no contenido opcional.
 */

function putWithProgress(
  signedUrl: string,
  file: File,
  onProgress: (percent: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", signedUrl, true);
    request.setRequestHeader("content-type", file.type);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error(`El almacenamiento rechazó el archivo (${request.status}).`));
    request.onerror = () => reject(new Error("No se pudo conectar con el almacenamiento."));
    request.onabort = () => reject(new Error("Subida cancelada."));

    request.send(file);
  });
}

export function LogoField({
  initialUrl,
  initiallyCustom,
}: {
  initialUrl: string;
  /** Si ya hay un logo propio guardado, o si lo que se ve es el de fábrica */
  initiallyCustom: boolean;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [custom, setCustom] = useState(initiallyCustom);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dropping, setDropping] = useState(false);
  const [pending, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const uploading = progress !== null;

  const upload = async (file: File) => {
    setError(null);

    const rejection = imageRejectionReason(file);
    if (rejection) {
      setError(rejection);
      return;
    }

    setProgress(0);
    try {
      const ticket = await createLogoUploadTicketAction({
        name: file.name,
        type: file.type,
        size: file.size,
      });
      if (!ticket.ok) {
        setError(ticket.message);
        setProgress(null);
        return;
      }

      await putWithProgress(ticket.data.signedUrl, file, setProgress);

      const saved = await setLogoAction(ticket.data.path);
      if (!saved.ok) {
        setError(saved.message);
        setProgress(null);
        return;
      }

      setUrl(saved.data);
      setCustom(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo subir el logo.");
    } finally {
      setProgress(null);
    }
  };

  const pick = (list: FileList | null) => {
    const file = list?.[0];
    if (file) void upload(file);
  };

  const remove = () => {
    if (!window.confirm("¿Quitar el logo propio? La tienda vuelve al logo de fábrica."))
      return;

    const snapshot = { url, custom };
    startTransition(async () => {
      const result = await removeLogoAction();
      if (result.ok) {
        setCustom(false);
      } else {
        setUrl(snapshot.url);
        setCustom(snapshot.custom);
        setError(result.message);
      }
    });
  };

  return (
    <div
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        setDropping(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return;
        setDropping(false);
      }}
      onDrop={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        setDropping(false);
        pick(event.dataTransfer.files);
      }}
    >
      {error && (
        <p
          role="alert"
          className="tone-rose mb-4 flex items-start gap-2.5 rounded-2xl px-5 py-4 text-sm"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          {error}
        </p>
      )}

      {!uploading ? (
        <figure className="admin-inset overflow-hidden">
          <div className="relative flex aspect-square items-center justify-center bg-cream-deep p-6">
            <Image
              src={url}
              alt="Logo de la marca"
              width={200}
              height={200}
              sizes="200px"
              className="h-auto max-h-full w-full object-contain"
            />
            <span className="absolute right-2 top-2">
              <StatusPill tone={custom ? "mint" : "neutral"} plain>
                {custom ? "Personalizado" : "De fábrica"}
              </StatusPill>
            </span>
          </div>
          <figcaption className="flex items-center justify-between gap-2 p-2.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={pending}
              className="admin-btn px-4 py-2 text-[0.82rem]"
            >
              {custom ? "Reemplazar" : "Subir el mío"}
            </button>
            {custom && (
              <button
                type="button"
                onClick={remove}
                disabled={pending}
                aria-label="Quitar el logo propio"
                className="admin-icon-btn size-8 hover:text-[#b3607f] disabled:opacity-35"
              >
                <Trash2 className="size-3.5" strokeWidth={1.9} />
              </button>
            )}
          </figcaption>
        </figure>
      ) : (
        <div
          className={cn(
            "flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-dashed p-6 text-center",
            dropping ? "border-rose bg-rose-mist/40" : "",
          )}
          style={{ borderColor: dropping ? undefined : "var(--admin-line)" }}
        >
          <UploadCloud className="admin-muted size-6" strokeWidth={1.7} />
          <span className="admin-soft text-xs">Subiendo… {progress}%</span>
          <Meter value={progress ?? 0} tone="lavender" className="mt-1 w-full" />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
        className="sr-only"
        onChange={(event) => {
          pick(event.target.files);
          event.target.value = "";
        }}
      />

      <p className="admin-muted mt-4 flex items-start gap-2 text-xs leading-relaxed">
        <ImagePlus className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.8} />
        Fondo transparente (PNG, WebP o SVG) da el mejor resultado. JPG, PNG,
        WebP, AVIF o SVG · 5 MB.
      </p>
    </div>
  );
}
