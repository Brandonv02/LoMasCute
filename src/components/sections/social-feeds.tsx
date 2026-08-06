import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import {
  socialHandle,
  type SiteSettingsView,
} from "@/lib/site-settings";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import {
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
} from "@/components/ui/social-icons";

/**
 * Redes de la tienda.
 *
 * Antes esta sección pintaba un mosaico de publicaciones inventadas, con sus
 * "me gusta" y sus reproducciones. Ya no: se muestran las redes que estén
 * configuradas en el panel y nada más. El mosaico sigue aquí, listo para
 * cuando se conecte la API de Instagram o TikTok, pero solo aparece si le
 * llegan publicaciones reales.
 */

export type SocialPost = {
  /** URL de la imagen de la publicación */
  src: string;
  caption: string;
  url: string;
  likes?: number;
  comments?: number;
};

type Network = {
  name: string;
  url: string;
  handle: string;
  Icon: typeof InstagramIcon;
  /** Degradado de la pastilla del icono */
  chip: string;
  posts: SocialPost[];
};

export function SocialFeeds({
  settings,
  instagramPosts = [],
  tiktokPosts = [],
}: {
  settings: SiteSettingsView;
  instagramPosts?: SocialPost[];
  tiktokPosts?: SocialPost[];
}) {
  const networks: Network[] = [];

  if (settings.instagramUrl) {
    networks.push({
      name: "Instagram",
      url: settings.instagramUrl,
      handle: socialHandle(settings.instagramUrl),
      Icon: InstagramIcon,
      chip: "bg-gradient-to-br from-rose-soft via-rose to-lavender text-white",
      posts: instagramPosts,
    });
  }

  if (settings.tiktokUrl) {
    networks.push({
      name: "TikTok",
      url: settings.tiktokUrl,
      handle: socialHandle(settings.tiktokUrl),
      Icon: TiktokIcon,
      chip: "bg-gradient-to-br from-mint-soft via-lavender to-rose-soft text-ink",
      posts: tiktokPosts,
    });
  }

  if (settings.facebookUrl) {
    networks.push({
      name: "Facebook",
      url: settings.facebookUrl,
      handle: socialHandle(settings.facebookUrl),
      Icon: FacebookIcon,
      chip: "bg-gradient-to-br from-lavender-soft via-lavender to-mint-soft text-ink",
      posts: [],
    });
  }

  if (!networks.length) return null;

  return (
    <section className="relative py-24 md:py-32" aria-labelledby="redes">
      <div className="container-cute">
        <SectionHeading
          eyebrow="Nuestras redes"
          title="Vive lo cute"
          highlight="todos los días"
          align="center"
        />

        <div className="mt-14 flex flex-col gap-16">
          {networks.map((network) => (
            <div key={network.name}>
              <Reveal kind="up">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid size-12 place-items-center rounded-2xl shadow-soft ${network.chip}`}
                    >
                      <network.Icon className="size-6" />
                    </span>
                    <div>
                      <p className="font-display text-lg text-ink">{network.name}</p>
                      {network.handle && (
                        <p className="text-sm text-ink-soft">{network.handle}</p>
                      )}
                    </div>
                  </div>
                  <Button asChild variant="cream" size="sm">
                    <a href={network.url} target="_blank" rel="noopener noreferrer">
                      Seguir en {network.name}
                    </a>
                  </Button>
                </div>
              </Reveal>

              {/* Mosaico: solo con publicaciones reales detrás */}
              {network.posts.length > 0 && (
                <Stagger
                  className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6"
                  gap={0.06}
                >
                  {network.posts.map((post, i) => (
                    <StaggerItem key={post.src + i}>
                      <a
                        href={post.url || network.url}
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
                        {(post.likes !== undefined || post.comments !== undefined) && (
                          <span className="absolute inset-x-0 bottom-0 translate-y-3 p-3 opacity-0 transition-all duration-600 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
                            <span className="flex items-center gap-3 text-xs font-medium text-white">
                              {post.likes !== undefined && (
                                <span className="flex items-center gap-1">
                                  <Heart className="size-3.5 fill-current" strokeWidth={0} />
                                  {post.likes.toLocaleString("es-CO")}
                                </span>
                              )}
                              {post.comments !== undefined && (
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="size-3.5" strokeWidth={2.2} />
                                  {post.comments}
                                </span>
                              )}
                            </span>
                          </span>
                        )}
                      </a>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
