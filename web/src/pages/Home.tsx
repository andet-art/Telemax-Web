// src/pages/Home.tsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { sanity } from "@/lib/sanity";
import { homeCMSQuery } from "@/lib/queries";

import Lazy from "@/components/Lazy";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "@studio-freight/lenis";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { FaStar, FaQuoteLeft, FaArrowRight, FaCheckCircle } from "react-icons/fa";

import heroVideo from "../assets/hero-home.mp4";
import woodBg from "../assets/wood-bg.jpg";
import artisanImg from "../assets/artisan.jpg";
import artisan2 from "../assets/artisan2.jpg";

import { api } from "@/lib/api";

/** ---------------------------
 *  BACKEND DATA (DB SHAPE)
 *  --------------------------*/
type DbProduct = {
  id: number | string;
  sku: string | number;
  name: string;
  description: string | null;
  price: number | string | null;
  currency: string | null;
  primary_photo: string | null;
  type_id: number | null;
  subtype_id: number | null;
  is_active: number | boolean | null;
  created_at?: string;
  updated_at?: string;
};

type ProductsApiResponse = {
  success: boolean;
  count?: number;
  data: DbProduct[];
  message?: string;
};

type HomeProduct = {
  id: string | number;
  sku?: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  image?: string;
  rating?: number;
  category?: string;
  isNew?: boolean;
};

/** ✅ Build absolute image URL from DB values like "photos/3273001.png" */
function getApiOrigin(): string {
  const base =
    (api?.defaults?.baseURL || (import.meta as any)?.env?.VITE_API_URL || "")
      .toString()
      .trim();

  if (!base) return window.location.origin;

  const noTrailing = base.replace(/\/+$/, "");
  const stripped = noTrailing.replace(/\/api$/i, "");
  return stripped || window.location.origin;
}

function resolveImageUrl(primary_photo?: string | null): string {
  const fallback =
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=900&fit=crop";

  if (!primary_photo) return fallback;

  const raw = String(primary_photo).trim();
  if (!raw) return fallback;

  if (/^https?:\/\//i.test(raw)) return raw;

  const origin = getApiOrigin();
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${origin}${path}`;
}

function fmtMoney(amount: number, currency?: string) {
  const c = (currency || "EUR").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: c,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${c}`;
  }
}

/** ✅ Fisher–Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const Home = () => {
  const { t } = useTranslation();

  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const [cmsData, setCmsData] = useState<{
    cmsTitle: string;
    cmsDescription: string;
    cmsButton: string;
  } | null>(null);

  // ✅ Products from DB
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Scroll top
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ✅ Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis();
    let rafId = 0;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      // @ts-ignore
      lenis?.destroy?.();
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ Scroll-to-top visibility
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ Fetch CMS content (kept)
  useEffect(() => {
    let cancelled = false;

    const fetchContent = async () => {
      try {
        const result = await sanity.fetch(homeCMSQuery);
        if (!cancelled) setCmsData(result);
      } catch {
        if (!cancelled) {
          setCmsData({
            cmsTitle: "Live Content Editing",
            cmsDescription: "Easily manage your content using Sanity CMS.",
            cmsButton: "Connect Sanity CMS",
          });
        }
      }
    };

    fetchContent();
    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ Fetch products like Orders.tsx + RANDOMIZE ON EVERY REFRESH
  useEffect(() => {
    let mounted = true;

    const typeIdToCategory: Record<number, string> = {
      1: "Wood",
      2: "Metal",
      3: "Hybrid",
      4: "Luxury",
    };

    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductsError(null);

        const base = String(api?.defaults?.baseURL || "").replace(/\/+$/, "");
        const usesApiPrefix = /\/api$/i.test(base);
        const endpoint = usesApiPrefix ? "/products" : "/api/products";

        const res = await api.get<ProductsApiResponse>(endpoint);

        if (!mounted) return;

        if (!res.data?.success) {
          throw new Error(res.data?.message || "Products API failed");
        }

        const rawList: DbProduct[] = Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        const mapped: HomeProduct[] = (rawList ?? [])
          .filter((p) => {
            const active = p?.is_active;
            return active === null || active === undefined
              ? true
              : Number(active) === 1;
          })
          .map((p) => {
            const currency = (p.currency || "EUR").toString().toUpperCase();
            const price = Number(p.price ?? 0);

            const createdMs = p.created_at
              ? new Date(p.created_at).getTime()
              : 0;
            const isNew =
              createdMs > 0 &&
              Date.now() - createdMs < 14 * 24 * 60 * 60 * 1000;

            return {
              id: p.id,
              sku: String(p.sku ?? ""),
              name: p.name,
              description: p.description ?? "",
              price: Number.isFinite(price) ? price : 0,
              currency,
              image: resolveImageUrl(p.primary_photo),
              rating: 4.6,
              category: typeIdToCategory[Number(p.type_id)] || "Wood",
              isNew,
            };
          });

        // ✅ TRUE RANDOM every refresh:
        // - shuffle everything
        // - take 8
        const randomEight = shuffle(mapped).slice(0, 8);

        setProducts(randomEight);
      } catch (e: any) {
        setProductsError(e?.message || "Failed to load products");
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    };

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openImageModal = useCallback((img: string) => {
    setSelectedImg(img);
    document.body.style.overflow = "hidden";
  }, []);

  const closeImageModal = useCallback(() => {
    setSelectedImg(null);
    document.body.style.overflow = "auto";
  }, []);

  const carouselSettings = useMemo(
    () => ({
      centerMode: !isMobile,
      centerPadding: isMobile ? "18px" : "0px",
      slidesToShow: isMobile ? 1 : 3,
      infinite: true,
      autoplay: !isMobile,
      autoplaySpeed: 3800,
      speed: 450,
      arrows: false,
      dots: isMobile,
      pauseOnHover: true,
      swipeToSlide: true,
      responsive: [
        { breakpoint: 1024, settings: { slidesToShow: 2, dots: true } },
        {
          breakpoint: 768,
          settings: { slidesToShow: 1, dots: true, autoplay: false },
        },
      ],
    }),
    [isMobile]
  );

  return (
    <div className="bg-[#1a120b] text-white overflow-hidden font-serif">
      {/* HERO (ONLY title + one button like screenshot) */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-4 sm:px-6">
        <video
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={woodBg}
          onLoadedData={() => setVideoLoaded(true)}
        />
        <div className="absolute inset-0 bg-black/65" />

        <motion.div
          className="relative z-10 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: videoLoaded ? 1 : 0, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] drop-shadow-[0_2px_18px_rgba(0,0,0,0.65)]">
            {t("home.hero_title") || "German Craftsmanship for Connoisseurs"}
          </h1>

          <div className="mt-7 flex justify-center">
            <Link
              to="/orders"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-semibold
                         bg-white/15 hover:bg-white/20 border border-white/15 backdrop-blur-sm
                         text-white shadow-lg transition"
            >
              {t("home.view_collection") || "View Collection"}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FEATURE IMAGE (on theme) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t("home.section1_title") || "A Workshop Where Every Detail Matters"}
            </h2>
            <p className="text-stone-300 leading-relaxed">
              {t("home.section1_desc") ||
                "From shaping to finishing, our pipes carry a signature of precision—an unmistakable blend of tradition and refinement."}
            </p>

            <div className="mt-6 space-y-3 text-sm text-stone-300">
              {[
                t("home.section1_point1") || "Handcrafted finishing and quality control",
                t("home.section1_point2") || "Private label production for renowned brands",
                t("home.section1_point3") || "Designed for collectors and daily connoisseurs",
              ].map((x, i) => (
                <div key={i} className="flex items-center gap-3">
                  <FaCheckCircle className="text-[#c9a36a]" />
                  <span>{x}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 text-[#c9a36a] hover:text-[#e5c584] transition font-semibold"
              >
                {t("home.section1_cta") || "Explore the catalogue"} <FaArrowRight />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75 }}
            className="relative"
          >
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-[#c9a36a]/15 to-transparent blur-2xl" />
            <Lazy placeholder={<div className="h-[340px] rounded-2xl bg-black/30" />}>
              <img
                src={artisanImg}
                alt="Artisan"
                className="relative w-full rounded-2xl shadow-2xl border border-white/10 object-cover"
                loading="lazy"
              />
            </Lazy>
          </motion.div>
        </div>
      </section>

      {/* PRODUCTS PREVIEW (fetch from DB) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                {t("home.featured_title") || "Featured Selection"}
              </h2>
              <p className="text-stone-300 mt-2 max-w-2xl">
                {t("home.featured_subtitle") ||
                  "A curated preview from our live catalogue—fresh from the workshop."}
              </p>
            </div>

            <Link
              to="/orders"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/12 bg-black/25 hover:bg-black/35 transition font-semibold"
            >
              {t("home.featured_viewall") || "View All"} <FaArrowRight />
            </Link>
          </div>

          {loadingProducts && (
            <div className="text-center text-stone-300 py-10">
              {t("home.loading_products") || "Loading products…"}
            </div>
          )}

          {!loadingProducts && productsError && (
            <div className="text-center text-red-300 py-10">
              {t("home.products_error") || "Failed to load products"}: {productsError}
            </div>
          )}

          {!loadingProducts && !productsError && products.length > 0 && (
            <>
              <div className="rounded-3xl border border-white/10 bg-black/20 backdrop-blur-sm p-4 sm:p-6">
                <Slider {...carouselSettings}>
                  {products.map((p) => (
                    <div key={p.id} className="px-2">
                      <motion.button
                        type="button"
                        onClick={() => p.image && openImageModal(p.image)}
                        className="w-full text-left group rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a120b]/95 to-[#2a1d13]/95 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#c9a36a]/10 transition"
                        whileHover={{ y: -4 }}
                      >
                        <div className="relative aspect-[4/3] bg-black/30">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />

                          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs border border-white/10">
                            <span className="text-stone-200">SKU:</span>{" "}
                            <span className="text-[#c9a36a] font-semibold">
                              {p.sku || "—"}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                            {p.isNew && (
                              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#c9a36a] text-black shadow-lg">
                                {t("home.badge_new") || "NEW"}
                              </span>
                            )}
                            <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/10">
                              <FaStar className="text-yellow-400" />
                              <span className="text-xs font-medium text-stone-100">
                                {p.rating ?? 4.6}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 sm:p-5">
                          <div className="text-sm text-stone-400 mb-1">
                            {p.category || "Wood"}
                          </div>
                          <div className="text-lg font-bold text-white group-hover:text-[#c9a36a] transition line-clamp-1">
                            {p.name}
                          </div>
                          <div className="text-sm text-stone-400 mt-2 line-clamp-2 min-h-[40px]">
                            {p.description ||
                              t("home.no_desc") ||
                              "Handcrafted pipe with premium finishing."}
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-lg font-bold text-[#c9a36a]">
                              {fmtMoney(Number(p.price ?? 0), p.currency)}
                            </div>
                            <span className="text-xs px-3 py-1.5 rounded-full border border-[#c9a36a]/25 text-stone-200 bg-black/20">
                              {t("home.tap_preview") || "Tap to preview"}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  ))}
                </Slider>
              </div>

              <div className="mt-6 sm:hidden">
                <Link
                  to="/orders"
                  className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#c9a36a] to-[#d4b173] text-black px-6 py-3 rounded-full font-semibold shadow-lg shadow-[#c9a36a]/20"
                >
                  {t("home.featured_viewall") || "View All"}{" "}
                  <FaArrowRight className="text-sm" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* QUOTE (on theme) */}
      <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
        <img
          src={artisan2}
          alt="Craftsmanship background"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/75" />
        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75 }}
        >
          <FaQuoteLeft className="mx-auto text-4xl sm:text-5xl text-[#c9a36a] opacity-70 mb-6" />
          <p className="text-lg sm:text-2xl italic leading-relaxed text-stone-200 px-2">
            {t("home.quote") ||
              "Tradition is not a memory—it’s a promise. Every pipe carries a piece of history."}
          </p>
          <p className="mt-4 text-sm sm:text-base text-stone-300 font-semibold">
            — {t("home.quote_author") || "Hanseatic Pipes"}
          </p>
        </motion.div>
      </section>

      {/* CMS BLOCK (kept but themed) */}
      {cmsData && (
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto rounded-3xl border border-white/10 bg-black/25 backdrop-blur-sm p-8 sm:p-10">
            <div className="text-[#c9a36a] font-semibold text-sm mb-3">
              {t("home.cms_badge") || "CMS"}
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">
              {cmsData.cmsTitle}
            </h3>
            <p className="text-stone-300 leading-relaxed max-w-3xl">
              {cmsData.cmsDescription}
            </p>
            <div className="mt-6">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#c9a36a] to-[#d4b173] text-black font-semibold shadow-lg shadow-[#c9a36a]/15"
              >
                {cmsData.cmsButton} <FaArrowRight className="text-sm" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* MODAL (click outside closes, click image doesn’t) */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[80] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImageModal}
          >
            <motion.img
              src={selectedImg}
              className="max-h-[80vh] w-auto rounded-2xl border border-white/10 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCROLL TOP */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-black/40 backdrop-blur-sm border border-white/10 hover:border-[#c9a36a]/35 text-white p-3 rounded-full shadow-xl transition z-[60]"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default Home;