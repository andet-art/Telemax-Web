// ✅ React & Core Hooks
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// ✅ Sanity Client & Queries
import { sanity } from "@/lib/sanity";
import { homeCMSQuery } from "@/lib/queries";

// ✅ Routing & Translations
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// ✅ Components
import FAQ from "../components/FAQ";
import Gallery from "../components/Gallery";

// ✅ Animation & Scrolling
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

// ✅ Carousel & Lazy Loading
import Slider from "react-slick";
import LazyLoad from "react-lazyload";
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

// ✅ Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 🔹 UI State
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // 🔹 Sanity CMS Data
  const [cmsData, setCmsData] = useState<{
    cmsTitle: string;
    cmsDescription: string;
    cmsButton: string;
  } | null>(null);

  // 🔹 Memoized pipe data
  const pipes = useMemo(() => [
    { img: pipe1, modelKey: "model_1", priceKey: "model_1_price", subKey: "model_1_sub" },
    { img: pipe2, modelKey: "model_2", priceKey: "model_2_price", subKey: "model_2_sub" },
    { img: pipe3, modelKey: "model_3", priceKey: "model_3_price", subKey: "model_3_sub" }
  ], []);

  // 🔹 Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🔹 Optimized carousel settings with mobile-first approach
  const carouselSettings = useMemo(() => ({
    centerMode: !isMobile,
    centerPadding: isMobile ? "20px" : "0px",
    slidesToShow: isMobile ? 1 : 3,
    infinite: true,
    autoplay: !isMobile, // Disable autoplay on mobile to save battery
    autoplaySpeed: 4000, // Slower for better UX
    speed: 400, // Faster transitions
    arrows: false,
    dots: isMobile, // Show dots on mobile for better navigation
    pauseOnHover: true,
    swipeToSlide: true,
    touchThreshold: 10,
    accessibility: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          centerMode: false,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          dots: true,
          autoplay: false,
        },
      },
    ],
  }), [isMobile]);

  // 🔹 Fetch from Sanity with error handling
  // replace your Sanity useEffect with this
useEffect(() => {
  let cancelled = false;

  const fetchContent = async () => {
    try {
      const result = await sanity.fetch(homeCMSQuery);
      if (!cancelled) setCmsData(result ?? {
        cmsTitle: "Live Content Editing",
        cmsDescription: "Easily manage your content using Sanity CMS — no code, no redeploy.",
        cmsButton: "Connect Sanity CMS",
      });
    } catch (error) {
      console.error("CMS fetch failed:", error);
      if (!cancelled) {
        setCmsData({
          cmsTitle: "Live Content Editing",
          cmsDescription: "Easily manage your content using Sanity CMS — no code, no redeploy.",
          cmsButton: "Connect Sanity CMS",
        });
      }
    }
  };

  fetchContent();
  return () => { cancelled = true; };
}, []);


  // ✅ Optimized smooth scroll with mobile performance
  useEffect(() => {
    let lenis;
    let rafId;
    
    if (!isMobile) {
      // Only use Lenis on desktop for better mobile performance
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false, // Disable smooth touch scrolling
      });

      const raf = (time) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    }

    // Throttled scroll handler for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setShowScrollTop(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (lenis) {
        lenis.destroy();
      }
    };
  }, [isMobile]);

  // ✅ Optimized GSAP animations with mobile considerations
  useEffect(() => {
    const elements = gsap.utils.toArray(".reveal");
    
    elements.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: isMobile ? 20 : 50 }, // Reduced animation distance on mobile
        {
          opacity: 1,
          y: 0,
          duration: isMobile ? 0.6 : 1, // Faster animations on mobile
          ease: "power2.out", // Lighter easing for mobile
          scrollTrigger: {
            trigger: el,
            start: "top 90%", // Earlier trigger on mobile
            toggleActions: "play none none reverse",
            once: true, // Play only once for better performance
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isMobile]);

  // ✅ Optimized scroll to top with smooth behavior
  const scrollToTop = useCallback(() => {
    if (isMobile) {
      // Use native scroll for better mobile performance
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Use GSAP for desktop for smoother animation
      gsap.to(window, { duration: 1, scrollTo: 0, ease: "power2.inOut" });
    }
  }, [isMobile]);

  // ✅ Image modal handlers with better touch support
  const openImageModal = useCallback((img) => {
    setSelectedImg(img);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }, []);

  const closeImageModal = useCallback(() => {
    setSelectedImg(null);
    document.body.style.overflow = 'auto';
  }, []);

  // ✅ Video load handler
  const handleVideoLoad = useCallback(() => {
    setVideoLoaded(true);
  }, []);

  return (
    <div className="bg-[#1a120b] text-white overflow-hidden font-serif">

      {/* ✅ HERO SECTION - Mobile Optimized */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-10 overflow-hidden"
      >
        {/* Background video - plays on all devices */}
        <video
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedData={handleVideoLoad}
          preload={isMobile ? "none" : "metadata"} // Optimize loading on mobile
          poster={woodBg} // Fallback image while loading
        />
        
        {/* Fallback background in case video fails */}
        {!videoLoaded && (
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${woodBg})` }}
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-[#1e1007]/60 z-10" />

        {/* Hero Content - Mobile Optimized Typography */}
        <div className="relative z-20 max-w-3xl text-center px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-tight text-white mb-4 sm:mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            {t("home.hero_title")}
          </h1>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-stone-300 mb-8 sm:mb-10 leading-relaxed px-2">
            {t("home.hero_subtitle")}
          </p>

          <Link
            to="/orders"
            className="inline-flex items-center gap-2 sm:gap-3 bg-[#3b2f2f] hover:bg-[#2a1d1d] active:bg-[#1a0f0f] text-white px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full text-sm sm:text-base md:text-lg font-medium shadow-md transition-colors touch-manipulation"
          >
            {t("home.view_collection")} 
            <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>
      </motion.section>

      {/* ✅ SECTION 1 - Mobile-First Hero Features */}
      <section
        className="relative py-16 sm:py-20 px-4 sm:px-6 md:px-12 text-white overflow-hidden"
        style={{
          backgroundImage: `url(${woodBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: isMobile ? "scroll" : "fixed", // Disable parallax on mobile
        }}
      >
        <div className="absolute inset-0 bg-[#1b1008]/95 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-8 md:flex-row md:items-center md:gap-14">
          
          {/* Content - Mobile First */}
          <motion.div
            className="w-full md:w-1/2 space-y-6 sm:space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white drop-shadow">
              {t("section1_title")}
            </h2>

            <ul className="space-y-3 sm:space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <li key={n} className="flex items-start gap-3 text-base sm:text-lg text-stone-300">
                  <FaCheckCircle className="text-[#c9a36a] w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0" />
                  <span>{t(`section1_feat${n}`) || `Feature ${n}`}</span>
                </li>
              ))}
            </ul>

            <blockquote className="italic text-[#c9a36a] text-base sm:text-lg border-l-4 border-[#c9a36a] pl-4 sm:pl-5 max-w-xl mt-6">
              {t("section1_quote") || "Crafted with passion, delivered with pride."}
            </blockquote>

            <Link
              to="/about"
              className="inline-block mt-6 text-sm sm:text-base font-semibold bg-[#3b2f2f] hover:bg-[#2a1d1d] active:bg-[#1a0f0f] transition-colors text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-md hover:shadow-lg touch-manipulation"
            >
              {t("learn_more_button") || "Learn More"}
            </Link>
          </motion.div>

          {/* Image - Optimized for Mobile */}
          <motion.div
            className="w-full md:w-1/2 flex justify-center mt-8 md:mt-0"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <LazyLoad height={300} offset={100}>
              <img
                src={artisanImg}
                alt={t("home.section1_img_alt") || "Artisan carving tobacco pipe"}
                className="w-full max-w-sm sm:max-w-md md:max-w-lg rounded-2xl sm:rounded-3xl object-cover shadow-2xl hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </LazyLoad>
          </motion.div>
        </div>
      </section>

      {/* ✅ SECTION 2 – Mobile-Optimized Carousel */}
      <section className="py-16 sm:py-20 px-2 sm:px-4 md:px-12 bg-[#1b130e] w-full reveal">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-10 sm:mb-14 text-center text-white drop-shadow-sm px-4">
          {t("section2_title") || "Explore Our Models"}
        </h2>

        <div className="overflow-hidden">
          <Slider {...carouselSettings} className="no-scrollbar">
            {pipes.map(({ img, modelKey, priceKey, subKey }, i) => (
              <div key={i} className="px-2 sm:px-4 py-4 sm:py-6 focus:outline-none">
                <motion.div
                  whileHover={{ scale: isMobile ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }} // Better touch feedback
                  transition={{ duration: 0.2 }}
                  className="bg-[#2a1d13] rounded-lg sm:rounded-xl p-4 sm:p-5 max-w-sm mx-auto flex flex-col items-center shadow-md cursor-pointer touch-manipulation"
                >
                  <LazyLoad height={200} offset={50}>
                    <img
                      src={img}
                      alt={t(modelKey) || `Pipe Model ${i + 1}`}
                      className="rounded-lg mb-3 sm:mb-4 w-full object-cover h-40 sm:h-48 md:h-56 lg:h-64"
                      loading="lazy"
                    />
                  </LazyLoad>
                  
                  <h3 className="text-lg sm:text-xl font-semibold mb-1 text-white text-center">
                    {t(modelKey)}
                  </h3>
                  
                  <p className="text-sm sm:text-base text-[#c9a36a] font-medium mb-1 text-center">
                    {t(priceKey) || "$149 · Handmade"}
                  </p>
                  
                  <p className="text-xs sm:text-sm text-stone-400 text-center mb-3 sm:mb-4 px-2">
                    {t(subKey) || "Fine wood, beautifully crafted."}
                  </p>
                  
                  <button
                    onClick={() => openImageModal(img)}
                    className="bg-[#3b2f2f] hover:bg-[#2a1d1d] active:bg-[#1a0f0f] text-white text-xs sm:text-sm font-medium px-4 sm:px-5 py-2 rounded-full transition-colors shadow touch-manipulation"
                  >
                    {t("view_detail") || "View Details"}
                  </button>
                </motion.div>
              </div>
            ))}
          </Slider>
        </div>

        {/* 🔍 Mobile-Optimized Modal */}
        <AnimatePresence>
          {selectedImg && (
            <motion.div
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center px-4 sm:px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeImageModal}
              style={{ touchAction: 'none' }} // Prevent scroll
            >
              <motion.img
                src={selectedImg}
                alt="Enlarged preview"
                className="max-w-full max-h-[80vh] w-auto h-auto rounded-lg shadow-xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* Close button for mobile */}
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white text-xl touch-manipulation"
                aria-label="Close modal"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ✅ SECTION 3 – Mobile-First Timeline */}
      <section className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-8 md:px-16 bg-[#1a120b] text-white overflow-hidden">
        <div className="text-center mb-12 sm:mb-16 md:mb-20 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            {t("timeline_title") || "Crafted by Time"}
          </h2>
          <p className="text-stone-400 text-sm sm:text-base md:text-lg px-4">
            {t("timeline_intro") || "Moments that shaped our craft."}
          </p>
        </div>

        {/* Mobile: Vertical Timeline, Desktop: Horizontal */}
        <div className={`relative ${isMobile ? 'space-y-8' : 'overflow-x-auto scroll-smooth'}`}>
          {isMobile ? (
            // Vertical timeline for mobile
            <div className="space-y-8 max-w-sm mx-auto">
              {[
                { year: "1982", key: "timeline_event1" },
                { year: "1995", key: "timeline_event2" },
                { year: "2005", key: "timeline_event3" },
                { year: "2020", key: "timeline_event4" },
              ].map(({ year, key }, i) => (
                <motion.div
                  key={i}
                  className="flex gap-4 relative"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  {/* Vertical line */}
                  {i !== 3 && (
                    <div className="absolute left-2 top-4 w-[2px] h-20 bg-[#3b2f2f]" />
                  )}

                  {/* Dot */}
                  <div className="w-4 h-4 bg-[#c9a36a] rounded-full shadow-lg border-2 border-[#1a120b] z-10 mt-1 flex-shrink-0" />

                  {/* Card */}
                  <div className="bg-[#2b1c13]/60 backdrop-blur-lg border border-[#3b2f2f] rounded-lg px-4 py-4 flex-1 shadow-md">
                    <h3 className="text-[#c9a36a] text-sm font-semibold mb-2">{year}</h3>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      {t(key) || "Event description"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Horizontal timeline for desktop
            <div className="flex gap-12 w-max mx-auto px-6 items-start justify-start">
              {[
                { year: "1982", key: "timeline_event1" },
                { year: "1995", key: "timeline_event2" },
                { year: "2005", key: "timeline_event3" },
                { year: "2020", key: "timeline_event4" },
              ].map(({ year, key }, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col items-center text-center relative group"
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  {/* Line Connector */}
                  {i !== 0 && (
                    <div className="absolute top-2 left-[-6rem] w-24 h-[2px] bg-[#3b2f2f] hidden md:block" />
                  )}

                  {/* Dot */}
                  <div className="w-4 h-4 bg-[#c9a36a] rounded-full shadow-lg border-2 border-[#1a120b] z-10" />

                  {/* Card */}
                  <div className="bg-[#2b1c13]/60 backdrop-blur-lg border border-[#3b2f2f] rounded-xl px-6 py-5 mt-6 w-64 shadow-md hover:shadow-[#c9a36a]/30 transition-all">
                    <h3 className="text-[#c9a36a] text-sm font-semibold mb-2">{year}</h3>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      {t(key) || "Event description"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <Link
            to="/about"
            className="inline-block bg-[#3b2f2f] hover:bg-[#2a1d1d] active:bg-[#1a0f0f] text-white px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-colors shadow-md touch-manipulation"
          >
            {t("learn_more_button") || "Discover Our Story"}
          </Link>
        </div>
      </section>

      {/* ✅ SECTION 4 – Mobile-Optimized Quote */}
      <section className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-10 overflow-hidden bg-[#1a120b] reveal">
        <LazyLoad height={400} offset={100}>
          <img
            src={artisan2}
            alt="Artisan background"
            className="absolute inset-0 w-full h-full object-cover object-center z-0"
            loading="lazy"
          />
        </LazyLoad>
        <div className="absolute inset-0 bg-black/70 z-10" />

        <div className="relative z-20 max-w-3xl mx-auto text-center text-[#c9a36a] space-y-4 sm:space-y-6">
          <FaQuoteLeft className="mx-auto text-2xl sm:text-3xl md:text-4xl lg:text-5xl opacity-50" />
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl italic leading-relaxed px-2">
            {t("quote_text") || "Every pipe tells a story — one of patience, fire, and legacy."}
          </p>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg font-medium tracking-wide text-stone-300">
            — {t("quote_author") || "Master Artisan, Telemax"}
          </p>
          <Link
            to="/contact"
            className="inline-block bg-[#3b2f2f] hover:bg-[#2a1d1d] active:bg-[#1a0f0f] text-white px-5 sm:px-6 py-2.5 rounded-full text-sm font-semibold transition-colors touch-manipulation"
          >
            {t("contact_cta") || "Get in Touch"}
          </Link>
        </div>
      </section>

      {/* ✅ SECTION 5 – Mobile-First Testimonials */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-[#1a120b] max-w-7xl mx-auto reveal">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-10 sm:mb-12 text-center text-white">
          {t("testimonials_title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 md:gap-10 justify-items-center">
          {[
            { text: t("testimonial1_text"), author: t("testimonial1_author") },
            { text: t("testimonial2_text"), author: t("testimonial2_author") },
            { text: t("testimonial3_text"), author: t("testimonial3_author") },
          ].map(({ text, author }, i) => (
            <motion.blockquote
              key={i}
              className="bg-[#2a1d13] p-5 sm:p-6 md:p-8 rounded-xl shadow-xl max-w-sm w-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <p className="italic text-stone-300 mb-4 sm:mb-6 text-sm sm:text-base">"{text}"</p>
              <footer className="text-[#c9a36a] font-semibold text-sm sm:text-base">— {author}</footer>
              <div className="mt-3 sm:mt-4 flex gap-1 justify-center text-[#c9a36a]">
                {[...Array(5)].map((_, star) => (
                  <FaStar key={star} className="w-3 h-3 sm:w-4 sm:h-4" />
                ))}
              </div>
            </motion.blockquote>
          ))}
        </div>
      </section>

      {/* ✅ SECTION 6 – Mobile-Optimized Gallery */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-8 md:px-16 bg-[#1a120b] text-white">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 sm:mb-16 drop-shadow-lg">
          {t("gallery_title") || "Gallery of Craftsmanship"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 max-w-6xl mx-auto">
          {[pipe1, pipe2, pipe3, artisan2, pipe3, pipe1].map((img, i) => (
            <motion.div
              key={i}
              className="relative group overflow-hidden rounded-xl sm:rounded-2xl shadow-lg bg-[#2a1d13]/40 border border-[#3b2f2f] hover:shadow-[0_0_20px_rgba(201,163,106,0.2)] transition-all duration-300 cursor-pointer touch-manipulation"
              whileHover={{ scale: isMobile ? 1 : 1.015 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={() => openImageModal(img)}
            >
              <LazyLoad height={280} offset={50}>
                <img
                  src={img}
                  alt={`Gallery image ${i + 1}`}
                  className="w-full h-60 sm:h-72 md:h-80 object-cover rounded-xl sm:rounded-2xl transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </LazyLoad>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-center py-2 sm:py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs sm:text-sm text-[#c9a36a] tracking-wide">
                {t("gallery_item_label") || "Tap to view"}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call-to-action Button */}
        <div className="text-center mt-12 sm:mt-16">
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-2 bg-[#c9a36a] hover:bg-[#b8915b] active:bg-[#a67d4a] text-black font-semibold text-sm sm:text-base px-6 py-3 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl touch-manipulation"
          >
            {t("browse_orders") || "Explore All Pipes"}
          </button>
        </div>
      </section>

      {/* ✅ SECTION 7 – Mobile-First FAQ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#1a120b] text-white max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-10 sm:mb-14 text-center reveal">
          {t("faq_title")}
        </h2>

        <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
          <FAQ />
        </div>
      </section>

      {/* ✅ SECTION 8 – Mobile-Optimized CMS Content */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-[#1a120b] text-center max-w-4xl mx-auto rounded-xl shadow-xl reveal">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white">
          {cmsData?.cmsTitle || "Live Content Editing"}
        </h2>
        <p className="text-stone-400 text-sm sm:text-base md:text-lg mb-8 sm:mb-10 leading-relaxed px-2">
          {cmsData?.cmsDescription ||
            "Easily manage your content using Sanity CMS — no code, no redeploy. Update product details, text, and media in real time."}
        </p>
        <button className="bg-[#3b2f2f] hover:bg-[#2a1d1d] active:bg-[#1a0f0f] text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-colors shadow-lg touch-manipulation">
          {cmsData?.cmsButton || "Connect Sanity CMS"}
        </button>
      </section>

      {/* ✅ Mobile-Optimized Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 p-3 sm:p-3 rounded-full bg-[#2a1d1d] hover:bg-[#3b2f2f] active:bg-[#4a3d3d] text-white shadow-lg border border-[#3b2f2f] transition-colors duration-300 touch-manipulation"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Scroll to top"
        >
          <span className="text-lg sm:text-2xl leading-none">↑</span>
        </motion.button>
      )}
    </div>
  );
};

export default Home;