"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, FreeMode, Keyboard, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";

/**
 * Carrusel de productos con arrastre libre. En móvil se desliza con el dedo,
 * en desktop hay flechas y navegación por teclado.
 */
export function ProductRail({
  products,
  priority = false,
  className,
}: {
  products: Product[];
  priority?: boolean;
  className?: string;
}) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [state, setState] = useState({ begin: true, end: false });

  return (
    <div className={cn("relative", className)}>
      <Swiper
        modules={[Navigation, Pagination, FreeMode, Keyboard, A11y]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          setState({ begin: swiper.isBeginning, end: swiper.isEnd });
        }}
        onSlideChange={(swiper) =>
          setState({ begin: swiper.isBeginning, end: swiper.isEnd })
        }
        spaceBetween={20}
        slidesPerView={1.15}
        freeMode={{ enabled: true, momentumBounce: false }}
        keyboard={{ enabled: true }}
        speed={720}
        a11y={{
          prevSlideMessage: "Producto anterior",
          nextSlideMessage: "Producto siguiente",
        }}
        pagination={{ clickable: true, el: ".rail-dots" }}
        breakpoints={{
          520: { slidesPerView: 2, spaceBetween: 20 },
          860: { slidesPerView: 3, spaceBetween: 22 },
          1220: { slidesPerView: 4, spaceBetween: 24 },
        }}
        className="!pb-2"
      >
        {products.map((product, i) => (
          <SwiperSlide key={product.id} className="!h-auto py-2">
            <ProductCard product={product} priority={priority && i < 4} className="h-full" />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Controles */}
      <div className="mt-7 flex items-center justify-between gap-6">
        <div className="rail-dots flex items-center gap-1.5" />
        <div className="flex gap-2">
          <RailButton
            label="Anterior"
            disabled={state.begin}
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <ChevronLeft className="size-4.5" strokeWidth={2} />
          </RailButton>
          <RailButton
            label="Siguiente"
            disabled={state.end}
            onClick={() => swiperRef.current?.slideNext()}
          >
            <ChevronRight className="size-4.5" strokeWidth={2} />
          </RailButton>
        </div>
      </div>
    </div>
  );
}

function RailButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-11 place-items-center rounded-full bg-white/78 text-ink shadow-petal ring-1 ring-white/80 backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:bg-white hover:shadow-soft disabled:opacity-35 disabled:hover:translate-y-0"
    >
      {children}
    </button>
  );
}
