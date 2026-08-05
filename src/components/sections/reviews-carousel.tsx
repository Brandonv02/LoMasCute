"use client";

import { Children } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

/**
 * Solo el carrusel necesita cliente. Las reseñas llegan ya pintadas desde el
 * servidor como `children`, así que ni el catálogo de productos ni el texto de
 * las opiniones viajan en el bundle: aquí únicamente se les pone el riel.
 */
export function ReviewsCarousel({ children }: { children: React.ReactNode }) {
  return (
    <Swiper
      modules={[Pagination, Autoplay, A11y]}
      spaceBetween={20}
      slidesPerView={1.08}
      centeredSlides={false}
      autoplay={{ delay: 4600, disableOnInteraction: true, pauseOnMouseEnter: true }}
      speed={900}
      pagination={{ clickable: true }}
      a11y={{
        prevSlideMessage: "Reseña anterior",
        nextSlideMessage: "Reseña siguiente",
      }}
      breakpoints={{
        640: { slidesPerView: 2, spaceBetween: 20 },
        1100: { slidesPerView: 3, spaceBetween: 24 },
      }}
      className="!pb-14"
    >
      {Children.map(children, (slide, i) => (
        <SwiperSlide key={i} className="!h-auto py-2">
          {slide}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
