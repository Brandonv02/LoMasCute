"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Scale, Search, ShoppingBag, X } from "lucide-react";
import { site } from "@/config/site";
import { categories } from "@/data/categories";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Header() {
  const pathname = usePathname();
  const { count, openCart, favorites, compare, setSearchOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /** Los enlaces con ancla ("/#categorias") no marcan sección activa:
      apuntan a un bloque, no a una página. */
  const isActive = (href: string) => {
    if (href.includes("#")) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Barra de anuncio */}
      <div className="relative z-50 overflow-hidden bg-gradient-to-r from-rose-soft via-lavender-soft to-mint-soft">
        <div className="mask-fade-x flex whitespace-nowrap py-2">
          <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10 font-display text-[0.72rem] uppercase tracking-[0.2em] text-ink-soft">
            {Array.from({ length: 2 }).map((_, dup) => (
              <span key={dup} className="flex items-center gap-10">
                <span>✿ Envío gratis desde $120.000 en Medellín</span>
                <span>♡ Todo llega envuelto para regalo</span>
                <span>✧ Entregas en 24 – 48 horas</span>
                <span>❀ Paga con Nequi o Bancolombia</span>
                <span>♡ Todo llega envuelto para regalo</span>
                <span>✧ Entregas en 24 – 48 horas</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
          scrolled ? "py-2" : "py-4",
        )}
      >
        <div className="container-cute">
          <div
            className={cn(
              "relative flex items-center justify-between gap-4 rounded-full px-4 py-2.5 transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] md:px-6",
              scrolled ? "glass-tint shadow-lift" : "bg-transparent",
            )}
            onMouseLeave={() => setMegaOpen(false)}
          >
            {/* Logo */}
            <Link
              href="/"
              className="group relative flex shrink-0 items-center"
              aria-label={`${site.name} — inicio`}
            >
              <Image
                src="/brand/logo-lo-mas-cute.png"
                alt={site.name}
                width={200}
                height={200}
                priority
                sizes="200px"
                className={cn(
                  "transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-hover:rotate-[-1.5deg]",
                  scrolled ? "h-11 w-auto md:h-12" : "h-14 w-auto md:h-16",
                )}
              />
            </Link>

            {/* Navegación desktop */}
            <nav aria-label="Navegación principal" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {site.nav.map((item) => {
                  const isCategories = item.href.includes("#categorias");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onMouseEnter={() => setMegaOpen(isCategories)}
                        className={cn(
                          "group relative block rounded-full px-4 py-2 text-[0.95rem] transition-colors duration-500",
                          isActive(item.href) ? "text-ink" : "text-ink-soft hover:text-ink",
                        )}
                      >
                        {item.label}
                        <span
                          aria-hidden
                          className={cn(
                            "absolute inset-x-3 -bottom-0.5 h-[2.5px] origin-left rounded-full bg-gradient-to-r from-rose to-lavender transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                            isActive(item.href)
                              ? "scale-x-100"
                              : "scale-x-0 group-hover:scale-x-100",
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Acciones */}
            <div className="flex items-center gap-1 md:gap-1.5">
              <IconAction
                label="Buscar productos"
                onClick={() => setSearchOpen(true)}
                icon={<Search className="size-[1.15rem]" strokeWidth={1.8} />}
              />
              <IconAction
                label="Comparar productos"
                href="/comparar"
                badge={compare.length}
                className="hidden sm:inline-flex"
                icon={<Scale className="size-[1.15rem]" strokeWidth={1.8} />}
              />
              <IconAction
                label="Mis favoritos"
                href="/favoritos"
                badge={favorites.length}
                icon={<Heart className="size-[1.15rem]" strokeWidth={1.8} />}
              />
              <IconAction
                label={`Abrir bolsa (${count})`}
                onClick={openCart}
                badge={count}
                accent
                icon={<ShoppingBag className="size-[1.15rem]" strokeWidth={1.8} />}
              />
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir menú"
                className="ml-0.5 grid size-11 place-items-center rounded-full text-ink transition-colors duration-500 hover:bg-white/70 lg:hidden"
              >
                <Menu className="size-5" strokeWidth={1.8} />
              </button>
            </div>

            {/* Mega menú de categorías */}
            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -12, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(10px)" }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="glass absolute left-1/2 top-[calc(100%+0.85rem)] hidden w-[min(62rem,88vw)] -translate-x-1/2 rounded-[2rem] p-5 lg:block"
                >
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={cat.comingSoon ? "/tienda" : `/categoria/${cat.slug}`}
                        className="group flex items-start gap-3 rounded-3xl p-3 transition-colors duration-500 hover:bg-white/75"
                      >
                        <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-cream-deep ring-1 ring-white/70">
                          <Image
                            src={cat.image}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 font-display text-[0.95rem] text-ink">
                            {cat.name}
                            {cat.comingSoon && (
                              <span className="rounded-full bg-lavender-soft px-2 py-0.5 text-[0.6rem] uppercase tracking-widest text-[#5e4b86]">
                                pronto
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block truncate text-sm text-ink-soft">
                            {cat.claim}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="rule-pastel my-4" />
                  <div className="flex items-center justify-between gap-4 px-3 pb-1">
                    <p className="text-sm text-ink-soft">
                      Hoy maquillaje, skincare y accesorios. Pronto mucho más.
                    </p>
                    <Button asChild size="sm" variant="cream">
                      <Link href="/tienda">Ver toda la tienda</Link>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Menú móvil */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[90] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-[#5b4a50]/25 backdrop-blur-md"
            />
            <motion.nav
              aria-label="Menú"
              className="glass-tint absolute inset-y-0 right-0 flex w-[min(88vw,22rem)] flex-col overflow-y-auto rounded-l-[2.5rem] p-7"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <div className="flex items-center justify-between">
                <Image
                  src="/brand/logo-lo-mas-cute.png"
                  alt={site.name}
                  width={150}
                  height={150}
                  className="h-12 w-auto"
                />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="grid size-10 place-items-center rounded-full bg-white/80 text-ink"
                >
                  <X className="size-4.5" strokeWidth={1.8} />
                </button>
              </div>

              <ul className="mt-9 space-y-1">
                {site.nav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: 26 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + i * 0.06, duration: 0.5, ease: EASE }}
                  >
                    <Link
                      href={item.href}
                      className="block rounded-2xl px-4 py-3 font-display text-xl text-ink transition-colors duration-400 hover:bg-white/70"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="rule-pastel my-6" />

              <p className="px-4 font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
                Categorías
              </p>
              <ul className="mt-3 space-y-0.5">
                {categories.map((cat, i) => (
                  <motion.li
                    key={cat.slug}
                    initial={{ opacity: 0, x: 26 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: EASE }}
                  >
                    <Link
                      href={cat.comingSoon ? "/tienda" : `/categoria/${cat.slug}`}
                      className="flex items-center justify-between rounded-2xl px-4 py-2.5 text-ink-soft transition-colors duration-400 hover:bg-white/70 hover:text-ink"
                    >
                      {cat.name}
                      {cat.comingSoon && (
                        <span className="rounded-full bg-lavender-soft px-2 py-0.5 text-[0.6rem] uppercase tracking-widest text-[#5e4b86]">
                          pronto
                        </span>
                      )}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <Button asChild size="lg" className="w-full">
                  <Link href="/tienda">Comprar ahora</Link>
                </Button>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function IconAction({
  label,
  icon,
  href,
  onClick,
  badge = 0,
  accent = false,
  className,
}: {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: number;
  accent?: boolean;
  className?: string;
}) {
  const inner = (
    <>
      <span className="relative z-10 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.34,1.32,0.64,1)] group-hover:scale-115">
        {icon}
      </span>
      <AnimatePresence>
        {badge > 0 && (
          <motion.span
            key={badge}
            initial={{ scale: 0, y: 6 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.4, ease: [0.34, 1.32, 0.64, 1] }}
            className="absolute -right-0.5 -top-0.5 z-10 grid min-w-5 place-items-center rounded-full bg-gradient-to-br from-rose to-lavender px-1.5 py-0.5 text-[0.65rem] font-semibold text-[#6b4150] shadow-petal"
          >
            {badge}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );

  const classes = cn(
    "group relative grid size-11 place-items-center rounded-full text-ink transition-all duration-500 hover:bg-white/80 hover:shadow-petal",
    accent && "bg-white/70 shadow-petal ring-1 ring-white/80",
    className,
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={label} className={classes}>
      {inner}
    </button>
  );
}
