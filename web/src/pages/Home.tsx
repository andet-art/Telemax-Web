// ✅ React & Core Hooks
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";

// ✅ Sanity Client & Queries
import { sanity } from "@/lib/sanity";
import { homeCMSQuery } from "@/lib/queries";

// ✅ Translations
import { useTranslation } from "react-i18next";

// ✅ Components
import FAQ from "../components/FAQ";
import Gallery from "../components/Gallery";
import Lazy from "@/components/Lazy"; // ✅ NEW

// ✅ Animation & Scrolling
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

// ✅ Carousel
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ✅ Icons
import { FaCheckCircle, FaStar, FaQuoteLeft, FaArrowRight } from "react-icons/fa";

// ✅ Media & Assets
import heroVideo from "../assets/hero-home.mp4";
import woodBg from "../assets/wood-bg.jpg";
import pipe1 from "../assets/pipe1.jpg";
import pipe2 from "../assets/pipe2.jpg";
import pipe3 from "../assets/pipe3.jpg";
import artisanImg from "../assets/artisan.jpg";
import artisan2 from "../assets/artisan2.jpg";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const [cmsData, setCmsData] = useState<{
    cmsTitle: string;
    cmsDescription: string;
    cmsButton: string;
  } | null>(null);

  const pipes = useMemo(() => [
    { img: pipe1, modelKey: "model_1", priceKey: "model_1_price", subKey: "model_1_sub" },
    { img: pipe2, modelKey: "model_2", priceKey: "model_2_price", subKey: "model_2_sub" },
    { img: pipe3, modelKey: "model_3", priceKey: "model_3_price", subKey: "model_3_sub" }
  ], []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const carouselSettings = useMemo(() => ({
    centerMode: !isMobile,
    centerPadding: isMobile ? "20px" : "0px",
    slidesToShow: isMobile ? 1 : 3,
    infinite: true,
    autoplay: !isMobile,
    autoplaySpeed: 4000,
    speed: 400,
    arrows: false,
    dots: isMobile,
    pauseOnHover: true,
    swipeToSlide: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, dots: true } },
      { breakpoint: 768, settings: { slidesToShow: 1, dots: true, autoplay: false } }
    ],
  }), [isMobile]);

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
    return () => { cancelled = true; };
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

  return (
    <div className="bg-[#1a120b] text-white overflow-hidden font-serif">

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-4">
        <video
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={woodBg}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("home.hero_title")}
          </h1>
          <Link
            to="/orders"
            className="bg-[#3b2f2f] px-6 py-3 rounded-full"
          >
            {t("home.view_collection")}
          </Link>
        </div>
      </section>

      {/* SECTION 1 IMAGE FIXED */}
      <section className="py-20 text-center">
        <Lazy placeholder={<div className="h-[300px]" />}>
          <img
            src={artisanImg}
            alt="Artisan"
            className="mx-auto rounded-2xl shadow-2xl"
            loading="lazy"
          />
        </Lazy>
      </section>

      {/* CAROUSEL FIXED */}
      <section className="py-20">
        <Slider {...carouselSettings}>
          {pipes.map(({ img }, i) => (
            <div key={i}>
              <Lazy placeholder={<div className="h-[250px]" />}>
                <img
                  src={img}
                  className="mx-auto rounded-xl"
                  loading="lazy"
                />
              </Lazy>
            </div>
          ))}
        </Slider>
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImageModal}
          >
            <motion.img
              src={selectedImg}
              className="max-h-[80vh] rounded-lg"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCROLL TOP */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-[#3b2f2f] p-3 rounded-full"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default Home;