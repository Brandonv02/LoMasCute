import {
  Gift,
  Heart,
  MessageCircle,
  ShieldCheck,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { reasons } from "@/data/reviews";
import { SectionHeading } from "@/components/sections/section-heading";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

const icons: Record<string, LucideIcon> = {
  truck: Truck,
  gift: Gift,
  shield: ShieldCheck,
  heart: Heart,
  message: MessageCircle,
  wallet: Wallet,
};

const tones: Record<string, string> = {
  rose: "bg-rose-mist text-[#a8556f]",
  mint: "bg-mint-soft text-[#3f6a61]",
  lavender: "bg-lavender-soft text-[#5e4b86]",
  peach: "bg-peach-soft text-[#8a5b3f]",
  gold: "bg-gold-soft text-[#7c6023]",
};

export function WhyUs() {
  return (
    <section className="relative py-24 md:py-32" aria-labelledby="por-que">
      {/* Fondo con textura suave */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-transparent via-white/45 to-transparent" />
      </div>

      <div className="container-cute">
        <SectionHeading
          eyebrow="¿Por qué comprar aquí?"
          title="Porque cuidamos"
          highlight="cada detalle"
          description="No somos una tienda enorme. Somos un equipo pequeño en Medellín que revisa cada pedido antes de que salga por la puerta."
          align="center"
        />

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" gap={0.07}>
          {reasons.map((reason) => {
            const Icon = icons[reason.icon];
            return (
              <StaggerItem key={reason.title} as="article">
                <div className="card-lift group relative h-full overflow-hidden rounded-[2rem] bg-white/62 p-7 ring-1 ring-white/75 backdrop-blur-md">
                  {/* Brillo que aparece al pasar el cursor */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-[radial-gradient(circle,rgba(248,182,200,0.45),transparent_70%)] opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100"
                  />

                  <span
                    className={`grid size-14 place-items-center rounded-3xl transition-transform duration-600 [transition-timing-function:cubic-bezier(0.34,1.32,0.64,1)] group-hover:scale-110 group-hover:-rotate-6 ${tones[reason.tone]}`}
                  >
                    <Icon className="size-6" strokeWidth={1.8} />
                  </span>

                  <h3 className="mt-5 font-display text-xl leading-snug text-ink">
                    {reason.title}
                  </h3>
                  <p className="mt-2.5 leading-relaxed text-ink-soft">{reason.text}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
