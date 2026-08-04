import Image from "next/image";
import { Heart, MessageCircle, Play } from "lucide-react";
import { site } from "@/config/site";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { InstagramIcon, TiktokIcon } from "@/components/ui/social-icons";

/**
 * Feeds sociales. Hoy renderizan un mosaico curado con arte propio; el
 * layout es el mismo que consumirá la API de Instagram/TikTok cuando se
 * conecte, así que reemplazar la fuente no toca el diseño.
 */

const instagramPosts = [
  { src: "/art/feed-1.svg", caption: "El labial Cloud Kiss en su tono más pedido 🌸", likes: 1284, comments: 46 },
  { src: "/art/feed-2.svg", caption: "Cómo envolvemos cada pedido ♡", likes: 2140, comments: 88 },
  { src: "/art/feed-3.svg", caption: "Nueva paleta Pastel Diary ✨", likes: 1760, comments: 61 },
  { src: "/art/feed-4.svg", caption: "Rutina de 3 pasos para piel sensible", likes: 940, comments: 34 },
  { src: "/art/feed-5.svg", caption: "Vanilla Cloud llegó y se agotó dos veces", likes: 3120, comments: 122 },
  { src: "/art/feed-6.svg", caption: "Nuestro rincón favorito del taller", likes: 812, comments: 27 },
];

const tiktokPosts = [
  { src: "/art/feed-7.svg", caption: "Empacando un pedido a las 6 a.m. 🎀", views: "412K" },
  { src: "/art/feed-8.svg", caption: "3 formas de usar el rubor en crema", views: "268K" },
  { src: "/art/feed-9.svg", caption: "Unboxing del kit regalo Cute Box", views: "1.1M" },
  { src: "/art/feed-1.svg", caption: "Probando todos los tonos del gloss", views: "586K" },
];

export function SocialFeeds() {
  const instagram = site.social.find((s) => s.icon === "instagram")!;
  const tiktok = site.social.find((s) => s.icon === "tiktok")!;

  return (
    <section className="relative py-24 md:py-32" aria-labelledby="redes">
      <div className="container-cute">
        <SectionHeading
          eyebrow="Nuestras redes"
          title="Vive lo cute"
          highlight="todos los días"
          description="Publicamos lanzamientos, tutoriales cortitos y el detrás de cámaras de cómo armamos cada pedido."
          align="center"
        />

        {/* Instagram */}
        <div className="mt-14">
          <Reveal kind="up">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-soft via-rose to-lavender text-white shadow-soft">
                  <InstagramIcon className="size-6" />
                </span>
                <div>
                  <p className="font-display text-lg text-ink">Instagram</p>
                  <p className="text-sm text-ink-soft">{instagram.handle}</p>
                </div>
              </div>
              <Button asChild variant="cream" size="sm">
                <a href={instagram.url} target="_blank" rel="noopener noreferrer">
                  Seguir en Instagram
                </a>
              </Button>
            </div>
          </Reveal>

          <Stagger className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6" gap={0.06}>
            {instagramPosts.map((post, i) => (
              <StaggerItem key={post.src + i}>
                <a
                  href={instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden rounded-[1.5rem] ring-1 ring-white/75"
                >
                  <Image
                    src={post.src}
                    alt={post.caption}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 45vw, 16vw"
                    className="object-cover transition-transform duration-[1200ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-112"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-[#6b4150]/55 via-transparent to-transparent opacity-0 transition-opacity duration-600 group-hover:opacity-100"
                  />
                  <span className="absolute inset-x-0 bottom-0 translate-y-3 p-3 opacity-0 transition-all duration-600 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="flex items-center gap-3 text-xs font-medium text-white">
                      <span className="flex items-center gap-1">
                        <Heart className="size-3.5 fill-current" strokeWidth={0} />
                        {post.likes.toLocaleString("es-CO")}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="size-3.5" strokeWidth={2.2} />
                        {post.comments}
                      </span>
                    </span>
                  </span>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* TikTok */}
        <div className="mt-16">
          <Reveal kind="up">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-mint-soft via-lavender to-rose-soft text-ink shadow-soft">
                  <TiktokIcon className="size-6" />
                </span>
                <div>
                  <p className="font-display text-lg text-ink">TikTok</p>
                  <p className="text-sm text-ink-soft">{tiktok.handle}</p>
                </div>
              </div>
              <Button asChild variant="cream" size="sm">
                <a href={tiktok.url} target="_blank" rel="noopener noreferrer">
                  Seguir en TikTok
                </a>
              </Button>
            </div>
          </Reveal>

          <Stagger className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4" gap={0.07}>
            {tiktokPosts.map((post, i) => (
              <StaggerItem key={post.src + i}>
                <a
                  href={tiktok.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-lift group relative block aspect-9/16 overflow-hidden rounded-[1.75rem] ring-1 ring-white/75"
                >
                  <Image
                    src={post.src}
                    alt={post.caption}
                    fill
                    loading="lazy"
                    sizes="(max-width: 1024px) 45vw, 22vw"
                    className="object-cover transition-transform duration-[1300ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-108"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-[#6b4150]/65 via-transparent to-transparent"
                  />

                  {/* Botón de play que respira */}
                  <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink shadow-soft backdrop-blur-md transition-all duration-600 [transition-timing-function:cubic-bezier(0.34,1.32,0.64,1)] group-hover:scale-110">
                    <Play className="size-5 translate-x-0.5 fill-current" strokeWidth={0} />
                  </span>

                  <span className="absolute inset-x-0 bottom-0 p-4">
                    <span className="block text-sm font-medium leading-snug text-white drop-shadow">
                      {post.caption}
                    </span>
                    <span className="mt-1 block text-xs text-white/85">
                      {post.views} reproducciones
                    </span>
                  </span>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
