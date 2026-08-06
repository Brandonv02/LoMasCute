"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { AlertTriangle, ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { imageRejectionReason } from "@/lib/product-images";
import {
  createHeroUploadTicketAction,
  removeHeroImageAction,
  setHeroImageAction,
} from "@/app/admin/(panel)/configuracion/actions";
import { Meter, StatusPill } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/**
 * Imagen principal del hero.
 *
 * Se guarda sola, sin pasar por el botón "Guardar cambios": subir y quitar son
 * definitivos en cuanto ocurren, igual que en el gestor de imágenes de
 * producto. El archivo viaja del navegador directamente a Storage con una URL
 * firmada por el servidor, así que el progreso que se ve es el real.
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

export function HeroImageField({ initialUrl }: { initialUrl: string | null }) {
  const [url, setUrl] = useState(initialUrl);
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
      const ticket = await createHeroUploadTicketAction({
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

      const saved = await setHeroImageAction(ticket.data.path);
      if (!saved.ok) {
        setError(saved.message);
        setProgress(null);
        return;
      }

      setUrl(saved.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo subir la imagen.");
    } finally {
      setProgress(null);
    }
  };

  const pick = (list: FileList | null) => {
    const file = list?.[0];
    if (file) void upload(file);
  };

  const remove = () => {
    if (!window.confirm("¿Quitar la imagen del hero? La portada dejará de mostrarla."))
      return;

    const snapshot = url;
    setUrl(null);
    startTransition(async () => {
      const result = await removeHeroImageAction();
      if (!result.ok) {
        setUrl(snapshot);
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

      {url && !uploading ? (
        <figure className="admin-inset overflow-hidden">
          <div className="relative aspect-square bg-cream-deep">
            <Image
              src={url}
              alt="Imagen principal del hero"
              fill
              sizes="320px"
              className="object-cover"
            />
            <span className="absolute right-2 top-2">
              <StatusPill tone="mint" plain>
                Publicada
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
              Reemplazar
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              aria-label="Quitar la imagen del hero"
              className="admin-icon-btn size-8 hover:text-[#b3607f] disabled:opacity-35"
            >
              <Trash2 className="size-3.5" strokeWidth={1.9} />
            </button>
          </figcaption>
        </figure>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-dashed p-6 text-center transition-colors duration-300",
            dropping ? "border-rose bg-rose-mist/40" : "hover:bg-[var(--admin-raised)]",
          )}
          style={{ borderColor: dropping ? undefined : "var(--admin-line)" }}
        >
          {uploading ? (
            <>
              <UploadCloud className="admin-muted size-6" strokeWidth={1.7} />
              <span className="admin-soft text-xs">Subiendo… {progress}%</span>
              <Meter value={progress ?? 0} tone="lavender" className="mt-1 w-full" />
            </>
          ) : (
            <>
              <ImagePlus className="admin-muted size-6" strokeWidth={1.7} />
              <span className="admin-soft text-xs leading-snug">
                {dropping ? "Suelta aquí" : "Subir imagen del hero"}
              </span>
              <span className="admin-muted text-[0.68rem]">JPG, PNG, WebP · 5 MB</span>
            </>
          )}
        </button>
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

      <p className="admin-muted mt-4 text-xs leading-relaxed">
        Se guarda en Supabase Storage en cuanto termina de subir. Si no hay
        imagen, la portada esconde ese bloque en vez de dejar un hueco.
      </p>
    </div>
  );
}
