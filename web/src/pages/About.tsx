import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { useTranslation } from "react-i18next";
import { FaQuoteLeft } from "react-icons/fa";

import heroVideo from "../assets/hero-bg.mp4";
import artisan2 from "../assets/artisan2.jpg";

const About = () => {
  const { t } = useTranslation();
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true });
    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      if (typeof (lenis as any).destroy === "function") (lenis as any).destroy();
    };
  }, []);

  // ✅ Default (German) story as fallback
  const fallbackParagraphs = useMemo(
    () => [
      "Seit drei Generationen trägt eine Familie die Kunst des Tabakpfeifenhandwerks in ihrem Herzen – ein Erbe, das mit Hingabe, Stolz und unerschütterlicher Tradition gepflegt wird. Was einst mit einfachen Werkzeugen und einem klaren Blick für Form und Funktion begann, hat sich über Jahrzehnte zu einer Manufaktur entwickelt, die heute weltweit unter dem Namen Hanseatic Pipes geschätzt und bewundert wird.",
      "Vor über siebzig Jahren legte der Großvater den Grundstein. In seiner kleinen Werkstatt, mit dem Duft von Holz und Tabak in der Luft, fertigte er jede Pfeife mit der Hand – jede ein Unikat, jede ein Stück Seele. Sein Sohn trat in seine Fußstapfen, lernte das Handwerk von Kindesbeinen an und führte die Tradition mit derselben Leidenschaft fort.",
      "Für die Tochter, die heutige Hüterin dieses Erbes, war der Weg kein leichter. In einer Branche, die lange von Männern dominiert wurde, musste sie sich ihren Platz erkämpfen. Nicht mit lauten Worten, sondern mit Wissen, Präzision und einer tiefen Liebe zum Handwerk. Ihr Vater stand stets an ihrer Seite, unterstützte sie, wo er konnte, und glaubte fest daran, dass sie die Richtige war, um die Tradition in die Zukunft zu tragen. Sein früher Tod war ein tiefer Einschnitt, doch er hinterließ ihr nicht nur das Wissen, sondern auch die Gewissheit, dass sie stark genug war, es alleine zu führen.",
      "Heute führt sie die Firma mit derselben Hingabe wie ihre Vorfahren. Die Produktion ist noch immer handwerklich geprägt, jede Pfeife wird Stück für Stück von Hand gefertigt – so, wie es seit jeher geschieht. Und doch hat sie behutsam modernisiert: neue Werkzeuge, präzisere Verfahren, ein Hauch von Innovation, ohne die Seele des Handwerks zu verlieren. Die Tradition ist nicht nur ein Erbe, sondern ein Versprechen: dass jede Pfeife, die die Werkstatt und Firma verlässt, ein Stück Geschichte in sich trägt.",
      "Unter dem Namen Hanseatic Pipes ist die Marke heute auf allen Kontinenten bekannt. Sammler, Kenner und Liebhaber schätzen die unverwechselbare Handschrift, die jede Pfeife trägt. Neben der eigenen Marke fertigt die Manufaktur auch Private Label-Produktionen für international renommierte Häuser der Pfeifenbranche – ein stilles Zeichen höchster Anerkennung.",
      "So steht sie heute da: als Frau, die Tradition und Moderne vereint, als Hüterin eines Familienerbes, das weit über Generationen hinausstrahlt. Ihre Pfeifen sind nicht nur Produkte, sondern Zeugen einer Geschichte, die von Mut, Beständigkeit und Leidenschaft erzählt. Die Zukunft von Hanseatic Pipes ist klar: die Tradition bewahren, die Welt erobern – Pfeife für Pfeife, Handgriff für Handgriff auf in die Zukunft.",
    ],
    []
  );

  const historyParagraphs = useMemo(() => {
    const maybe = [
      t("about.history.p1", { defaultValue: fallbackParagraphs[0] }),
      t("about.history.p2", { defaultValue: fallbackParagraphs[1] }),
      t("about.history.p3", { defaultValue: fallbackParagraphs[2] }),
      t("about.history.p4", { defaultValue: fallbackParagraphs[3] }),
      t("about.history.p5", { defaultValue: fallbackParagraphs[4] }),
      t("about.history.p6", { defaultValue: fallbackParagraphs[5] }),
    ];
    return maybe.filter((p) => typeof p === "string" && p.trim().length > 0);
  }, [t, fallbackParagraphs]);

  return (
    <div className="bg-[#1a120b] text-white font-serif overflow-hidden">
      {/* ================= HERO ================= */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-4 sm:px-6 md:px-10 overflow-hidden">
        <video
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1e1007]/75 z-10" />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: videoLoaded ? 1 : 0, y: 0 }}
          transition={{ duration: 0.9 }}
          className="relative z-20 max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-black/25 backdrop-blur-sm mb-6">
            <span className="text-xs sm:text-sm tracking-widest text-stone-200 uppercase">
              {t("about.kicker", { defaultValue: "Hanseatic Pipes" })}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
            {t("about.title", { defaultValue: "Crafting Stories in Every Pipe" })}
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl lg:text-2xl text-stone-300 leading-relaxed">
            {t("about.subtitle", { defaultValue: "Where tradition meets design excellence" })}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/orders"
              className="inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-4 rounded-full text-sm sm:text-base font-semibold
                         bg-[#c9a36a] text-[#1a120b] hover:brightness-110 transition shadow-lg shadow-black/30"
            >
              {t("about.ctaPrimary", { defaultValue: "Explore Collection" })}
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-4 rounded-full text-sm sm:text-base font-semibold
                         border border-white/15 bg-black/25 backdrop-blur-sm text-white hover:bg-black/35 transition"
            >
              {t("about.ctaSecondary", { defaultValue: "Contact Us" })}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ================= PHILOSOPHY / HISTORY (CENTERED, NO PHOTO) ================= */}
      <section className="py-24 px-4 sm:px-6 md:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#c9a36a] mb-12">
            {t("about.philosophyTitle", { defaultValue: "Philosophy" })}
          </h2>

          <p className="text-stone-300 max-w-3xl mx-auto leading-relaxed mb-12">
            {t("about.philosophySubtitle", {
              defaultValue:
                "A legacy of craftsmanship, refined through generations — built by hand, guided by detail, and shaped by time.",
            })}
          </p>

          <div className="space-y-10 text-stone-300 text-[16px] sm:text-[17px] md:text-[18px] leading-[2]">
            {historyParagraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}

            <p className="text-[#c9a36a] font-semibold text-lg pt-2">
              {t("about.history.closing", {
                defaultValue:
                  "Die Zukunft ist klar: Tradition bewahren. Die Welt erobern. Pfeife für Pfeife.",
              })}
            </p>
          </div>

          {/* micro highlights centered */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: t("about.highlights.h1", { defaultValue: "Handmade" }),
                value: t("about.highlights.h1v", { defaultValue: "Piece by piece" }),
              },
              {
                label: t("about.highlights.h2", { defaultValue: "Tradition" }),
                value: t("about.highlights.h2v", { defaultValue: "3 generations" }),
              },
              {
                label: t("about.highlights.h3", { defaultValue: "Global" }),
                value: t("about.highlights.h3v", { defaultValue: "Collectors worldwide" }),
              },
            ].map((x) => (
              <div
                key={x.label}
                className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm p-5 shadow-xl shadow-black/20"
              >
                <div className="text-xs tracking-widest uppercase text-stone-300">{x.label}</div>
                <div className="mt-1 text-base font-semibold text-[#c9a36a]">{x.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRODUCTS & ACHIEVEMENTS ================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#c9a36a] mb-10 text-center">
            {t("about.products.title", { defaultValue: "Products & Achievements" })}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-stretch">
            <div className="rounded-3xl border border-white/10 bg-black/20 backdrop-blur-sm shadow-xl shadow-black/25 p-6 sm:p-8">
              <h3 className="text-xl font-semibold mb-4 text-stone-100">
                {t("about.products.lightersTitle", { defaultValue: "Lighters" })}
              </h3>
              <ul className="list-disc list-inside space-y-2 text-stone-300">
                <li>{t("about.products.l1", { defaultValue: "Reliable everyday performance" })}</li>
                <li>{t("about.products.l2", { defaultValue: "Premium finish & feel" })}</li>
                <li>{t("about.products.l3", { defaultValue: "Designed for durability" })}</li>
                <li>{t("about.products.l4", { defaultValue: "Craft-driven quality control" })}</li>
              </ul>

              <div className="mt-8 h-px bg-white/10" />

              <p className="mt-6 text-stone-300 leading-relaxed">
                {t("about.products.lightersParagraph", {
                  defaultValue:
                    "Designed for reliability and daily use — with clean finishing and a premium feel.",
                })}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 backdrop-blur-sm shadow-xl shadow-black/25 p-6 sm:p-8">
              <h3 className="text-xl font-semibold mb-4 text-stone-100">
                {t("about.products.pipesTitle", { defaultValue: "Pipe Craftsmanship" })}
              </h3>
              <p className="text-stone-300 leading-relaxed mb-4">
                {t("about.products.p1", {
                  defaultValue:
                    "Each pipe is shaped with patience, precision, and respect for the material — a process refined over decades.",
                })}
              </p>
              <p className="text-stone-300 leading-relaxed">
                {t("about.products.p2", {
                  defaultValue:
                    "From selection to finishing, we preserve the soul of traditional craftsmanship while embracing modern precision.",
                })}
              </p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-[#1a120b]/40 p-4">
                <div className="text-xs tracking-widest uppercase text-stone-300">
                  {t("about.products.privateLabelTitle", { defaultValue: "Private Label" })}
                </div>
                <div className="mt-1 text-sm text-stone-200/90 leading-relaxed">
                  {t("about.products.privateLabelText", {
                    defaultValue:
                      "We also produce private-label pipes for respected international houses — a quiet mark of trust and recognition.",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= QUOTE ================= */}
      <section className="relative py-20 sm:py-24 px-4 sm:px-6 md:px-10 overflow-hidden">
        <img
          src={artisan2}
          alt={t("about.quote.imageAlt", { defaultValue: "Craftsmanship background" })}
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/75 z-10" />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-20 max-w-4xl mx-auto text-center"
        >
          <FaQuoteLeft className="mx-auto text-4xl sm:text-5xl md:text-6xl opacity-60 mb-6 text-[#c9a36a]" />
          <p className="text-lg sm:text-xl md:text-2xl italic leading-relaxed px-2 text-stone-200">
            {t("about.quote.text", {
              defaultValue:
                "A pipe is not merely an object — it is the quiet companion of thought, shaped by hand and guided by tradition.",
            })}
          </p>
          <p className="mt-4 text-sm sm:text-base md:text-lg font-semibold text-stone-300">
            — {t("about.quote.author", { defaultValue: "Hanseatic Pipes" })}
          </p>
        </motion.div>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-[#c9a36a] py-16 sm:py-20 px-4 sm:px-6 md:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a120b] mb-6 leading-snug">
            {t("about.cta.footerText", { defaultValue: "Experience True Craftsmanship" })}
          </h2>
          <Link
            to="/contact"
            className="inline-block bg-[#1a120b] text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full text-sm sm:text-base font-semibold hover:bg-[#2a1d1d] transition shadow-lg"
          >
            {t("about.cta.footerButton", { defaultValue: "Contact Us" })}
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default About;