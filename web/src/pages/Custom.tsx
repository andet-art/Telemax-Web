// src/pages/costum.tsx
import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Wand2,
  RotateCcw,
  ShoppingCart,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";

/** ---------------------------
 *  TYPES
 *  --------------------------*/
type PipePart = {
  id: string;
  name: string;
  material: string;
  vibe: string; // storytelling flavor
  price: number;
  image: string; // local or remote
  accent?: "gold" | "ember" | "ice";
};

type BuildStep = 1 | 2 | 3;

/** ---------------------------
 *  MONEY
 *  --------------------------*/
function fmtMoney(amount: number, currency = "EUR") {
  const c = currency.toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(
      amount
    );
  } catch {
    return `${amount.toFixed(2)} ${c}`;
  }
}

/** ---------------------------
 *  SAMPLE PARTS (swap later with DB)
 *  Keep images 4:3-ish for best look
 *  --------------------------*/
const HEADS: PipePart[] = [
  {
    id: "h-01",
    name: "Classic Chamber",
    material: "Briar",
    vibe: "Balanced pull, timeless silhouette.",
    price: 34,
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=900&h=675&fit=crop",
    accent: "gold",
  },
  {
    id: "h-02",
    name: "Deep Ember Bowl",
    material: "Briar",
    vibe: "Slow burn, deeper heat pocket.",
    price: 42,
    image:
      "https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&h=675&fit=crop",
    accent: "ember",
  },
  {
    id: "h-03",
    name: "Slim Artisan",
    material: "Briar",
    vibe: "Elegant profile, light in hand.",
    price: 38,
    image:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=900&h=675&fit=crop",
    accent: "ice",
  },
];

const RINGS: PipePart[] = [
  {
    id: "r-01",
    name: "Gold Heritage Ring",
    material: "Brass",
    vibe: "Warm shine — premium finish.",
    price: 18,
    image:
      "https://images.unsplash.com/photo-1520975682031-a1427e40e0b5?w=900&h=675&fit=crop",
    accent: "gold",
  },
  {
    id: "r-02",
    name: "Smoked Alloy Ring",
    material: "Steel",
    vibe: "Industrial edge, dark tone.",
    price: 14,
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=900&h=675&fit=crop",
    accent: "ember",
  },
  {
    id: "r-03",
    name: "Ice Line Ring",
    material: "Aluminum",
    vibe: "Clean lines, subtle contrast.",
    price: 12,
    image:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=900&h=675&fit=crop",
    accent: "ice",
  },
];

const TAILS: PipePart[] = [
  {
    id: "t-01",
    name: "Velvet Stem",
    material: "Acrylic",
    vibe: "Comfort grip, smooth draw.",
    price: 22,
    image:
      "https://images.unsplash.com/photo-1520974735194-6b4bdbd6c8ac?w=900&h=675&fit=crop",
    accent: "gold",
  },
  {
    id: "t-02",
    name: "Night Stem",
    material: "Ebonite",
    vibe: "Deep matte — stealth premium.",
    price: 26,
    image:
      "https://images.unsplash.com/photo-1526481280695-3c687fd5432c?w=900&h=675&fit=crop",
    accent: "ember",
  },
  {
    id: "t-03",
    name: "Crystal Stem",
    material: "Acrylic",
    vibe: "Bright edge, modern finish.",
    price: 20,
    image:
      "https://images.unsplash.com/photo-1520975958220-1c4f8e3f01e2?w=900&h=675&fit=crop",
    accent: "ice",
  },
];

/** ---------------------------
 *  SMALL UI HELPERS
 *  --------------------------*/
const Glow = ({ accent }: { accent?: PipePart["accent"] }) => {
  const cls =
    accent === "ember"
      ? "from-[#ffb26b]/0 via-[#ff8a3d]/10 to-[#ffb26b]/0"
      : accent === "ice"
      ? "from-[#a8d8ff]/0 via-[#7cc6ff]/10 to-[#a8d8ff]/0"
      : "from-[#c9a36a]/0 via-[#c9a36a]/10 to-[#c9a36a]/0";
  return (
    <div
      className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r ${cls}`}
    />
  );
};

const StepPill = ({
  step,
  active,
  label,
}: {
  step: number;
  active: boolean;
  label: string;
}) => (
  <div
    className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
      active
        ? "border-[#c9a36a]/50 bg-[#c9a36a]/10 text-white"
        : "border-white/10 bg-black/30 text-stone-300"
    }`}
  >
    <div
      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
        active ? "bg-[#c9a36a] text-black" : "bg-white/10 text-stone-200"
      }`}
    >
      {step}
    </div>
    <div className="text-sm font-semibold">{label}</div>
  </div>
);

export default function Costum() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToCart, cartItemCount, cartTotal } = useCart();

  const [step, setStep] = useState<BuildStep>(1);

  const [head, setHead] = useState<PipePart | null>(null);
  const [ring, setRing] = useState<PipePart | null>(null);
  const [tail, setTail] = useState<PipePart | null>(null);

  const [pipeName, setPipeName] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const total = useMemo(
    () => (head?.price || 0) + (ring?.price || 0) + (tail?.price || 0),
    [head, ring, tail]
  );

  const accent: PipePart["accent"] = useMemo(
    () => tail?.accent || ring?.accent || head?.accent || "gold",
    [head, ring, tail]
  );

  const canNext = useMemo(() => {
    if (step === 1) return !!head;
    if (step === 2) return !!ring;
    return !!tail;
  }, [step, head, ring, tail]);

  const canFinish = useMemo(() => !!head && !!ring && !!tail && pipeName.trim(), [
    head,
    ring,
    tail,
    pipeName,
  ]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const reset = useCallback(() => {
    setHead(null);
    setRing(null);
    setTail(null);
    setPipeName("");
    setStep(1);
    showToast(t("orders.toasts.reset") || "Reset.");
  }, [showToast, t]);

  const next = useCallback(() => {
    if (!canNext) return;
    setStep((s) => (s === 1 ? 2 : s === 2 ? 3 : 3));
  }, [canNext]);

  const back = useCallback(() => {
    setStep((s) => (s === 3 ? 2 : s === 2 ? 1 : 1));
  }, []);

  const confirmAdd = useCallback(() => {
    if (!canFinish || !head || !ring || !tail) {
      showToast(t("orders.toasts.completeDesign") || "Complete the build first.");
      return;
    }

    addToCart({
      id: `custom-${Date.now()}`,
      type: "custom",
      name: pipeName.trim(),
      price: total,
      quantity: 1,
      currency: "EUR",
      image: head.image,
      head,
      ring,
      tail,
    } as any);

    showToast(t("orders.toasts.customAdded") || "Added to cart!");
    navigate("/cart");
  }, [addToCart, canFinish, head, ring, tail, navigate, pipeName, showToast, t, total]);

  const partsForStep = useMemo(() => {
    if (step === 1) return HEADS;
    if (step === 2) return RINGS;
    return TAILS;
  }, [step]);

  const selectedForStep = useMemo(() => {
    if (step === 1) return head;
    if (step === 2) return ring;
    return tail;
  }, [step, head, ring, tail]);

  const pick = useCallback(
    (p: PipePart) => {
      if (step === 1) setHead(p);
      if (step === 2) setRing(p);
      if (step === 3) setTail(p);

      // tiny “adventure” feedback
      showToast(
        step === 1
          ? "Bowl chosen. The chamber feels right."
          : step === 2
          ? "Ring locked. The build tightens."
          : "Stem attached. Your pipe is complete."
      );

      // auto advance for “adventure” pacing
      if (step === 1) setStep(2);
      else if (step === 2) setStep(3);
    },
    [showToast, step]
  );

  const heroTitle = useMemo(() => {
    if (step === 1) return "Chapter I — Choose the Bowl";
    if (step === 2) return "Chapter II — Seal the Craft";
    return "Chapter III — Attach the Stem";
  }, [step]);

  const heroSub = useMemo(() => {
    if (step === 1) return "Start with the heart of the pipe. Pick a chamber that fits your ritual.";
    if (step === 2) return "The ring is the signature. Choose the accent that defines the build.";
    return "Final touch. The stem decides comfort and character.";
  }, [step]);

  const previewText = useMemo(() => {
    const h = head?.name || "—";
    const r = ring?.name || "—";
    const ta = tail?.name || "—";
    return { h, r, ta };
  }, [head, ring, tail]);

  const accentChip =
    accent === "ember"
      ? "text-[#ffb26b] border-[#ffb26b]/30 bg-[#ffb26b]/10"
      : accent === "ice"
      ? "text-[#a8d8ff] border-[#a8d8ff]/30 bg-[#a8d8ff]/10"
      : "text-[#c9a36a] border-[#c9a36a]/30 bg-[#c9a36a]/10";

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed top-4 right-4 z-[90] px-5 py-3 rounded-xl border border-white/10 bg-black/70 backdrop-blur-lg text-stone-100 shadow-2xl flex items-center gap-3"
            initial={{ opacity: 0, y: -10, x: 12 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10, x: 12 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <CheckCircle className="w-5 h-5 text-[#c9a36a]" />
            <div className="text-sm font-medium">{toast}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cart */}
      <button
        onClick={() => navigate("/cart")}
        className="fixed bottom-4 right-4 z-[80] flex items-center gap-2 px-4 py-3 rounded-full shadow-xl bg-gradient-to-r from-[#c9a36a] to-[#d4b173] text-black font-semibold hover:opacity-90 transition"
        aria-label="View Cart"
      >
        <ShoppingCart className="w-4 h-4" />
        <span className="text-sm">
          {cartItemCount} – {fmtMoney(cartTotal, "EUR")}
        </span>
      </button>

      <main className="relative min-h-screen pt-20 sm:pt-28 pb-24 text-white font-serif overflow-hidden bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/70" />

        {/* subtle moving glow */}
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-20"
          style={{
            background:
              accent === "ember"
                ? "radial-gradient(circle, rgba(255,178,107,.8), rgba(0,0,0,0) 55%)"
                : accent === "ice"
                ? "radial-gradient(circle, rgba(168,216,255,.8), rgba(0,0,0,0) 55%)"
                : "radial-gradient(circle, rgba(201,163,106,.8), rgba(0,0,0,0) 55%)",
          }}
          animate={{ y: [0, 22, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <button
              onClick={() => navigate("/orders")}
              className="inline-flex items-center gap-2 text-sm text-[#c9a36a] hover:text-[#e5c584] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </button>

            <div className={`px-3 py-2 rounded-xl border ${accentChip} text-xs font-semibold`}>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Premium Build Mode
              </span>
            </div>
          </div>

          {/* Hero */}
          <motion.div
            className="mb-8 sm:mb-10 text-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 drop-shadow-xl bg-gradient-to-r from-white via-[#c9a36a] to-white bg-clip-text text-transparent"
              animate={{
                textShadow: [
                  "0 0 20px rgba(201,163,106,.25)",
                  "0 0 30px rgba(201,163,106,.45)",
                  "0 0 20px rgba(201,163,106,.25)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Build Your Pipe
            </motion.h1>

            <div className="text-lg sm:text-xl font-semibold mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-[#c9a36a]" />
              <span>{heroTitle}</span>
            </div>

            <p className="text-base sm:text-lg text-stone-300 max-w-3xl mx-auto">
              {heroSub}
            </p>

            {/* steps */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <StepPill step={1} active={step === 1} label="Bowl" />
              <StepPill step={2} active={step === 2} label="Ring" />
              <StepPill step={3} active={step === 3} label="Stem" />
            </div>
          </motion.div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: selection */}
            <motion.section
              className="lg:col-span-8 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f0b07]/85 to-[#1a120b]/85 backdrop-blur-lg shadow-2xl overflow-hidden"
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
            >
              <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-stone-400">Choose one</div>
                  <div className="text-xl font-bold">
                    {step === 1 ? "Select a Bowl" : step === 2 ? "Select a Ring" : "Select a Stem"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={back}
                    className="px-3 py-2 rounded-xl border border-white/10 bg-black/30 hover:bg-black/40 transition text-sm inline-flex items-center gap-2"
                    disabled={step === 1}
                    aria-disabled={step === 1}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={next}
                    className={`px-3 py-2 rounded-xl border text-sm inline-flex items-center gap-2 transition ${
                      canNext
                        ? "border-[#c9a36a]/30 bg-[#c9a36a]/15 hover:bg-[#c9a36a]/20 text-white"
                        : "border-white/10 bg-black/30 text-stone-500 cursor-not-allowed"
                    }`}
                    disabled={!canNext || step === 3}
                    aria-disabled={!canNext || step === 3}
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`step-${step}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                  >
                    {partsForStep.map((p, idx) => {
                      const isSelected = selectedForStep?.id === p.id;
                      return (
                        <motion.button
                          key={p.id}
                          type="button"
                          onClick={() => pick(p)}
                          className={`group relative text-left rounded-2xl border overflow-hidden transition shadow-xl ${
                            isSelected
                              ? "border-[#c9a36a]/60 bg-[#c9a36a]/10"
                              : "border-white/10 bg-black/20 hover:border-[#c9a36a]/35"
                          }`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03, duration: 0.4 }}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <Glow accent={p.accent} />
                          <div className="relative z-10">
                            <div className="aspect-[4/3] bg-black/40">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>

                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-lg font-bold line-clamp-1 group-hover:text-[#c9a36a] transition-colors">
                                    {p.name}
                                  </div>
                                  <div className="text-xs text-stone-400">
                                    {p.material}
                                  </div>
                                </div>

                                <div className="shrink-0 text-sm font-bold text-[#c9a36a]">
                                  {fmtMoney(p.price, "EUR")}
                                </div>
                              </div>

                              <div className="mt-3 text-sm text-stone-300 line-clamp-2">
                                {p.vibe}
                              </div>

                              <div className="mt-4 flex items-center justify-between">
                                <div
                                  className={`text-xs px-2 py-1 rounded-lg border ${accentChip}`}
                                >
                                  {p.accent === "ember"
                                    ? "Ember"
                                    : p.accent === "ice"
                                    ? "Ice"
                                    : "Gold"}
                                </div>

                                <div className="text-xs text-stone-400 inline-flex items-center gap-1">
                                  <Wand2 className="w-3.5 h-3.5" />
                                  Choose
                                </div>
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="absolute top-3 right-3 z-20 bg-black/60 border border-white/10 rounded-full p-2">
                              <CheckCircle className="w-5 h-5 text-[#c9a36a]" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.section>

            {/* Right: build preview + checkout */}
            <motion.aside
              className="lg:col-span-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a120b]/85 to-[#2a1d13]/85 backdrop-blur-lg shadow-2xl overflow-hidden"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
            >
              <div className="p-4 sm:p-6 border-b border-white/10">
                <div className="text-sm text-stone-400">Your build</div>
                <div className="text-xl font-bold">Preview & Finish</div>
              </div>

              {/* Preview “adventure stack” */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/25 overflow-hidden">
                  <div className="p-3 border-b border-white/10 flex items-center justify-between">
                    <div className="text-sm font-semibold">Assembled look</div>
                    <div className="text-xs text-stone-400">Concept preview</div>
                  </div>

                  <div className="p-4">
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black/40">
                      {/* Layered images for “build feeling” */}
                      <AnimatePresence>
                        {head?.image && (
                          <motion.img
                            key={`head-${head.id}`}
                            src={head.image}
                            alt={head.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            initial={{ opacity: 0, y: 18, scale: 1.02 }}
                            animate={{ opacity: 0.95, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -18 }}
                            transition={{ duration: 0.35 }}
                          />
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {ring?.image && (
                          <motion.img
                            key={`ring-${ring.id}`}
                            src={ring.image}
                            alt={ring.name}
                            className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-70"
                            initial={{ opacity: 0, x: -18, scale: 1.03 }}
                            animate={{ opacity: 0.7, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 18 }}
                            transition={{ duration: 0.35 }}
                          />
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {tail?.image && (
                          <motion.img
                            key={`tail-${tail.id}`}
                            src={tail.image}
                            alt={tail.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-70"
                            initial={{ opacity: 0, y: -18, scale: 1.03 }}
                            animate={{ opacity: 0.7, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18 }}
                            transition={{ duration: 0.35 }}
                          />
                        )}
                      </AnimatePresence>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10" />

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs text-stone-300">Build total</div>
                          <div className="text-lg font-bold text-[#c9a36a]">
                            {fmtMoney(total, "EUR")}
                          </div>
                        </div>
                        <div
                          className={`shrink-0 text-xs px-2 py-1 rounded-lg border ${accentChip}`}
                        >
                          {accent === "ember" ? "Ember" : accent === "ice" ? "Ice" : "Gold"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="text-xs text-stone-400 mb-1">Bowl</div>
                        <div className="text-sm text-stone-200 line-clamp-1">
                          {previewText.h}
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="text-xs text-stone-400 mb-1">Ring</div>
                        <div className="text-sm text-stone-200 line-clamp-1">
                          {previewText.r}
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="text-xs text-stone-400 mb-1">Stem</div>
                        <div className="text-sm text-stone-200 line-clamp-1">
                          {previewText.ta}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name & actions */}
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-sm text-stone-300 mb-2">Name your pipe</div>
                  <input
                    value={pipeName}
                    onChange={(e) => setPipeName(e.target.value)}
                    placeholder="e.g. Golden Ember"
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#c9a36a]/50"
                  />

                  <div className="mt-4 flex gap-3">
                    <motion.button
                      whileHover={canFinish ? { scale: 1.02 } : {}}
                      whileTap={canFinish ? { scale: 0.98 } : {}}
                      onClick={confirmAdd}
                      disabled={!canFinish}
                      className={`flex-1 px-5 py-3 rounded-xl font-bold shadow-lg ${
                        canFinish
                          ? "bg-gradient-to-r from-[#c9a36a] to-[#d4b173] text-black"
                          : "bg-stone-700/50 text-stone-400 cursor-not-allowed"
                      }`}
                    >
                      Add to Cart
                    </motion.button>

                    <button
                      onClick={reset}
                      className="px-5 py-3 rounded-xl border border-white/10 bg-black/30 text-stone-200 hover:bg-black/40 transition inline-flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                  </div>

                  <div className="mt-4 text-xs text-stone-500 leading-relaxed">
                    Tip: Choose the bowl first, then lock the ring, then finish with the stem —
                    it’s designed as a 3-part build experience.
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </main>
    </>
  );
}