"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  ImagePlus,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  MAX_IMAGES_PER_PRODUCT,
  imageRejectionReason,
  type ProductImage,
} from "@/lib/product-images";
import {
  createUploadTicketAction,
  registerImageAction,
  removeImageAction,
  reorderImagesAction,
  setPrimaryImageAction,
} from "@/app/admin/(panel)/productos/image-actions";
import { Meter, PanelHeader, StatusPill } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/**
 * Gestor de imágenes del producto.
 *
 * Guarda solo: subir, reordenar, elegir portada y eliminar son definitivos en
 * cuanto ocurren, sin pasar por el botón "Guardar" del formulario.
 *
 * La subida va del navegador directamente a Storage con una URL firmada por el
 * servidor. Por eso el progreso es real —lo reporta el propio XHR— y no una
 * animación que finge trabajo.
 */

type Upload = {
  id: string;
  name: string;
  previewUrl: string;
  progress: number;
  failed?: boolean;
};

/** PUT a la URL firmada, informando del progreso byte a byte. */
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

/** Lee las dimensiones para guardarlas y evitar saltos de layout en la tienda. */
function readDimensions(url: string) {
  return new Promise<{ width: number | null; height: number | null }>((resolve) => {
    const probe = new window.Image();
    probe.onload = () => resolve({ width: probe.naturalWidth, height: probe.naturalHeight });
    probe.onerror = () => resolve({ width: null, height: null });
    probe.src = url;
  });
}

export function ImageManager({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: ProductImage[];
}) {
  const [images, setImages] = useState(initialImages);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [dropping, setDropping] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);

  // Las previsualizaciones locales ocupan memoria hasta que se liberan.
  useEffect(() => {
    return () => uploads.forEach((upload) => URL.revokeObjectURL(upload.previewUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const complain = (message: string) => setErrors((prev) => [...prev, message]);

  const free = MAX_IMAGES_PER_PRODUCT - images.length - uploads.length;

  /* ---------------------------------------------------------------- subida */

  const upload = useCallback(
    async (files: File[]) => {
      if (uploadingRef.current) return;
      uploadingRef.current = true;
      setErrors([]);

      // De una en una: el orden de llegada es el orden en la ficha, y así no
      // hay dos subidas creyéndose ambas la portada.
      for (const file of files) {
        const rejection = imageRejectionReason(file);
        if (rejection) {
          complain(rejection);
          continue;
        }

        const uploadId = crypto.randomUUID();
        const previewUrl = URL.createObjectURL(file);
        setUploads((prev) => [...prev, { id: uploadId, name: file.name, previewUrl, progress: 0 }]);

        const fail = (message: string) => {
          complain(message);
          setUploads((prev) => prev.filter((item) => item.id !== uploadId));
          URL.revokeObjectURL(previewUrl);
        };

        try {
          const ticket = await createUploadTicketAction(productId, {
            name: file.name,
            type: file.type,
            size: file.size,
          });
          if (!ticket.ok) {
            fail(ticket.message);
            continue;
          }

          await putWithProgress(ticket.data.signedUrl, file, (progress) =>
            setUploads((prev) =>
              prev.map((item) => (item.id === uploadId ? { ...item, progress } : item)),
            ),
          );

          const dimensions = await readDimensions(previewUrl);
          const registered = await registerImageAction(productId, ticket.data.path, dimensions);

          if (!registered.ok) {
            fail(registered.message);
            continue;
          }

          setImages((prev) => [...prev, registered.data]);
          setUploads((prev) => prev.filter((item) => item.id !== uploadId));
          URL.revokeObjectURL(previewUrl);
        } catch (error) {
          fail(error instanceof Error ? error.message : "No se pudo subir la imagen.");
        }
      }

      uploadingRef.current = false;
    },
    [productId],
  );

  const pick = (list: FileList | null) => {
    if (!list?.length) return;
    const files = Array.from(list);
    if (files.length > free) {
      complain(
        `Solo caben ${free} ${free === 1 ? "imagen más" : "imágenes más"} (máximo ${MAX_IMAGES_PER_PRODUCT} por producto).`,
      );
    }
    void upload(files.slice(0, Math.max(0, free)));
  };

  /* ------------------------------------------------------------ reordenar */

  const persistOrder = (ordered: ProductImage[]) => {
    setImages(ordered);
    startTransition(async () => {
      const result = await reorderImagesAction(
        productId,
        ordered.map((image) => image.id),
      );
      if (!result.ok) complain(result.message);
    });
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    persistOrder(next);
  };

  /** Reordena en vivo mientras se arrastra: la retícula se recoloca sola. */
  const dragOverCard = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    const from = images.findIndex((image) => image.id === draggingId);
    const to = images.findIndex((image) => image.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setImages(next);
  };

  /* -------------------------------------------------------- portada y borrado */

  const makePrimary = (imageId: string) => {
    setImages((prev) => prev.map((image) => ({ ...image, isPrimary: image.id === imageId })));
    startTransition(async () => {
      const result = await setPrimaryImageAction(productId, imageId);
      if (!result.ok) complain(result.message);
    });
  };

  const remove = (image: ProductImage) => {
    if (!window.confirm("¿Eliminar esta imagen? No se puede deshacer.")) return;

    const snapshot = images;
    setImages((prev) => {
      const next = prev.filter((item) => item.id !== image.id);
      // Si se fue la portada, la siguiente ocupa su lugar (igual que en la base).
      if (image.isPrimary && next.length) next[0] = { ...next[0], isPrimary: true };
      return next;
    });

    startTransition(async () => {
      const result = await removeImageAction(productId, image.id);
      if (!result.ok) {
        setImages(snapshot);
        complain(result.message);
      }
    });
  };

  /* ------------------------------------------------------------------ vista */

  return (
    <section
      className={cn(
        "admin-panel p-6 transition-colors duration-300",
        dropping && "ring-2 ring-rose",
      )}
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
      <PanelHeader
        title="Imágenes"
        description="Arrastra archivos aquí o suéltalos sobre la retícula. Los cambios se guardan solos."
        action={
          <StatusPill tone={images.length ? "mint" : "neutral"}>
            {images.length} de {MAX_IMAGES_PER_PRODUCT}
          </StatusPill>
        }
      />

      {errors.length > 0 && (
        <ul
          role="alert"
          className="tone-rose mt-5 flex flex-col gap-1.5 rounded-2xl px-5 py-4 text-sm"
        >
          {errors.map((message, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
              {message}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <article
            key={image.id}
            draggable
            onDragStart={(event) => {
              setDraggingId(image.id);
              event.dataTransfer.effectAllowed = "move";
              // Marca el arrastre como interno para no confundirlo con archivos.
              event.dataTransfer.setData("application/x-lmc-image", image.id);
            }}
            onDragOver={(event) => {
              if (!draggingId) return;
              event.preventDefault();
              dragOverCard(image.id);
            }}
            onDragEnd={() => {
              setDraggingId(null);
              persistOrder(images);
            }}
            className={cn(
              "admin-inset group overflow-hidden transition-opacity duration-300",
              draggingId === image.id && "opacity-40",
            )}
          >
            <div className="relative aspect-square bg-cream-deep">
              <Image
                src={image.url}
                alt={image.alt ?? ""}
                fill
                sizes="200px"
                className="object-cover"
              />

              <span
                aria-hidden
                className="absolute left-2 top-2 grid size-7 cursor-grab place-items-center rounded-lg bg-white/85 text-ink-soft opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                title="Arrastra para reordenar"
              >
                <GripVertical className="size-3.5" strokeWidth={2} />
              </span>

              {image.isPrimary && (
                <span className="absolute right-2 top-2">
                  <StatusPill tone="gold" plain>
                    Principal
                  </StatusPill>
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-1 p-2">
              <button
                type="button"
                onClick={() => makePrimary(image.id)}
                disabled={image.isPrimary || pending}
                aria-label={`Usar como imagen principal (posición ${index + 1})`}
                title="Usar como principal"
                className={cn(
                  "admin-icon-btn size-8 disabled:opacity-100",
                  image.isPrimary && "text-gold",
                )}
              >
                <Star
                  className={cn("size-3.5", image.isPrimary && "fill-current")}
                  strokeWidth={1.9}
                />
              </button>

              <span className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0 || pending}
                  aria-label="Mover antes"
                  className="admin-icon-btn size-8 disabled:opacity-35"
                >
                  <ChevronLeft className="size-3.5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === images.length - 1 || pending}
                  aria-label="Mover después"
                  className="admin-icon-btn size-8 disabled:opacity-35"
                >
                  <ChevronRight className="size-3.5" strokeWidth={2} />
                </button>
              </span>

              <button
                type="button"
                onClick={() => remove(image)}
                disabled={pending}
                aria-label="Eliminar imagen"
                className="admin-icon-btn size-8 hover:text-[#b3607f] disabled:opacity-35"
              >
                <Trash2 className="size-3.5" strokeWidth={1.9} />
              </button>
            </div>
          </article>
        ))}

        {/* Subidas en curso */}
        {uploads.map((upload) => (
          <article key={upload.id} className="admin-inset overflow-hidden">
            <div className="relative aspect-square bg-cream-deep">
              {/* Previsualización local: se ve antes de que termine de subir */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={upload.previewUrl}
                alt=""
                className="absolute inset-0 size-full object-cover opacity-60"
              />
              <span className="absolute inset-0 grid place-items-center">
                <UploadCloud className="size-6 text-ink-soft" strokeWidth={1.8} />
              </span>
            </div>
            <div className="p-2.5">
              <Meter value={upload.progress} tone="lavender" />
              <p className="admin-muted mt-2 flex items-center justify-between gap-2 text-[0.7rem]">
                <span className="truncate">{upload.name}</span>
                <span className="shrink-0 tabular-nums">{upload.progress}%</span>
              </p>
            </div>
          </article>
        ))}

        {/* Añadir */}
        {free > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-dashed p-4 text-center transition-colors duration-300",
              dropping ? "border-rose bg-rose-mist/40" : "hover:bg-[var(--admin-raised)]",
            )}
            style={{ borderColor: dropping ? undefined : "var(--admin-line)" }}
          >
            <ImagePlus className="admin-muted size-6" strokeWidth={1.7} />
            <span className="admin-soft text-xs leading-snug">
              {dropping ? "Suelta aquí" : "Añadir imágenes"}
            </span>
            <span className="admin-muted text-[0.68rem]">JPG, PNG, WebP · 5 MB</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
        className="sr-only"
        onChange={(event) => {
          pick(event.target.files);
          event.target.value = "";
        }}
      />

      {images.length > 0 && (
        <p className="admin-muted mt-5 text-xs leading-relaxed">
          La imagen marcada como principal es la portada del producto en la tienda.
          El resto se muestran en la galería, en este orden.
        </p>
      )}
    </section>
  );
}
