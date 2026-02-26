// src/pages/costum.tsx
import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Sparkles,
  ShoppingCart,
  ShieldCheck,
  RotateCcw,
  Wand2,
  Layers,
  Eye,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";

import HeadPicker, { type PipePart as DbPipePart } from "@/pages/custom/Head";
import RingPicker from "@/pages/custom/Ring";
import TailPicker from "@/pages/custom/Tail";

type PipeAccent = "gold" | "ember" | "ice";

type PipePart = DbPipePart & {
  id: number | string;
  name: string;
  price?: number | string | null;
  photo?: string | null;
  accent?: PipeAccent | string | null;
};

type BuildStep = 1 | 2 | 3;

type CustomDraft = {
  head: PipePart;
  ring: PipePart | null; // ✅ ring can be null (No Ring)
  tail: PipePart;
  total: number;
  accent: PipeAccent;
  currency: string;
  createdAt: number;
};

function fmtMoney(amount: number, currency = "EUR") {
  const c = currency.toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${c}`;
  }
}

const DRAFT_KEY = "telemax_custom_draft";
function saveDraft(draft: CustomDraft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {}
}

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
  const { cartItemCount, cartTotal } = useCart();

  const [step, setStep] = useState<BuildStep>(1);

  const [head, setHead] = useState<PipePart | null>(null);

  // ✅ tri-state:
  // undefined = not chosen yet
  // null = No Ring chosen
  // PipePart = ring chosen
  const [ring, setRing] = useState<PipePart | null | undefined>(undefined);

  const [tail, setTail] = useState<PipePart | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [introOpen, setIntroOpen] = useState(true);

  const total = useMemo(() => {
    const h = Number(head?.price || 0);
    const r = Number((ring && (ring as any).price) || 0); // ring might be null/undefined
    const ta = Number(tail?.price || 0);
    return h + r + ta;
  }, [head, ring, tail]);

  const accent: PipeAccent = useMemo(() => {
    const a = (tail?.accent || (ring as any)?.accent || head?.accent || "gold") as string;
    if (a === "ember" || a === "ice" || a === "gold") return a;
    return "gold";
  }, [head, ring, tail]);

  // ✅ step rules:
  // step1 needs head
  // step2 needs ring "chosen" (either null or object) => ring !== undefined
  // step3 needs tail
  const canNext = useMemo(() => {
    if (step === 1) return !!head;
    if (step === 2) return ring !== undefined; // ✅ allow null
    return !!tail;
  }, [step, head, ring, tail]);

  // ✅ complete rules: head + tail + ring chosen (null is valid)
  const isComplete = useMemo(() => !!head && ring !== undefined && !!tail, [head, ring, tail]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const reset = useCallback(() => {
    setHead(null);
    setRing(undefined);
    setTail(null);
    setStep(1);
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {}
    showToast(t("orders.toasts.reset") || "Reset.");
  }, [showToast, t]);

  const next = useCallback(() => {
    if (!canNext) return;
    setStep((s) => (s === 1 ? 2 : s === 2 ? 3 : 3));
  }, [canNext]);

  const back = useCallback(() => {
    setStep((s) => (s === 3 ? 2 : s === 2 ? 1 : 1));
  }, []);

  const goPreview = useCallback(() => {
    if (!head || ring === undefined || !tail) {
      showToast(t("orders.toasts.completeDesign") || "Complete the build first.");
      return;
    }

    const draft: CustomDraft = {
      head,
      ring: ring ?? null,
      tail,
      total: Number(total || 0),
      accent,
      currency: "EUR",
      createdAt: Date.now(),
    };

    saveDraft(draft);
    navigate("/custom/preview", { state: draft });
  }, [accent, head, navigate, ring, showToast, t, tail, total]);

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

  const accentChip =
    accent === "ember"
      ? "text-[#ffb26b] border-[#ffb26b]/30 bg-[#ffb26b]/10"
      : accent === "ice"
      ? "text-[#a8d8ff] border-[#a8d8ff]/30 bg-[#a8d8ff]/10"
      : "text-[#c9a36a] border-[#c9a36a]/30 bg-[#c9a36a]/10";

  return (
    <>
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

      <AnimatePresence>
        {introOpen && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black/80" />

            <motion.div
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-[680px] h-[680px] rounded-full blur-3xl opacity-25"
              style={{
                background: "radial-gradient(circle, rgba(201,163,106,.9), rgba(0,0,0,0) 55%)",
              }}
              animate={{ y: [0, 18, 0], scale: [1, 1.03, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f0b07]/95 to-[#1b120b]/95 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,.65)] overflow-hidden"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", damping: 22, stiffness: 260 }}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#c9a36a]/15 border border-[#c9a36a]/25 flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-[#c9a36a]" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-semibold tracking-widest text-stone-400 uppercase">
                      Customization Studio
                    </div>
                    <h2 className="mt-2 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-[#c9a36a] to-white bg-clip-text text-transparent">
                      Build your own premium pipe
                    </h2>
                    <p className="mt-3 text-stone-300 leading-relaxed">
                      You’ll customize your pipe in{" "}
                      <span className="text-white font-semibold">3 steps</span>: pick a{" "}
                      <span className="text-white font-semibold">bowl</span>, lock a{" "}
                      <span className="text-white font-semibold">ring</span>, and finish with a{" "}
                      <span className="text-white font-semibold">stem</span>. <br />
                      <span className="text-white font-semibold">There is NO preview during the steps.</span>{" "}
                      Only after Step 3 you continue to Preview.
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIntroOpen(false);
                      showToast("Welcome. Start with the bowl.");
                    }}
                    className="flex-1 px-6 py-3 rounded-2xl font-bold shadow-lg bg-gradient-to-r from-[#c9a36a] to-[#d4b173] text-black inline-flex items-center justify-center gap-2"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  <button
                    onClick={() => navigate("/orders")}
                    className="px-6 py-3 rounded-2xl border border-white/10 bg-black/30 text-stone-200 hover:bg-black/40 transition inline-flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Orders
                  </button>
                </div>

                <div className="mt-4 text-xs text-stone-500">
                  Tip: Select an item and it auto-advances to the next step.
                </div>
              </div>

              <div className="h-1 bg-gradient-to-r from-transparent via-[#c9a36a] to-transparent opacity-60" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6">
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

          <motion.div
            className="mb-8 sm:mb-10 text-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 drop-shadow-xl bg-gradient-to-r from-white via-[#c9a36a] to-white bg-clip-text text-transparent"
              transition={{ duration: 3, repeat: Infinity }}
            >
              Build Your Pipe
            </motion.h1>

            <div className="text-lg sm:text-xl font-semibold mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-[#c9a36a]" />
              <span>{heroTitle}</span>
            </div>

            <p className="text-base sm:text-lg text-stone-300 max-w-3xl mx-auto">{heroSub}</p>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <StepPill step={1} active={step === 1} label="Bowl" />
              <StepPill step={2} active={step === 2} label="Ring" />
              <StepPill step={3} active={step === 3} label="Stem" />
            </div>
          </motion.div>

          <motion.section
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f0b07]/85 to-[#1a120b]/85 backdrop-blur-lg shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
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
                  className="px-3 py-2 rounded-xl border border-white/10 bg-black/30 hover:bg-black/40 transition text-sm inline-flex items-center gap-2 disabled:opacity-50"
                  disabled={step === 1}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                {step !== 3 ? (
                  <button
                    onClick={next}
                    className={`px-3 py-2 rounded-xl border text-sm inline-flex items-center gap-2 transition disabled:opacity-50 ${
                      canNext
                        ? "border-[#c9a36a]/30 bg-[#c9a36a]/15 hover:bg-[#c9a36a]/20 text-white"
                        : "border-white/10 bg-black/30 text-stone-500 cursor-not-allowed"
                    }`}
                    disabled={!canNext}
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <motion.button
                    whileHover={isComplete ? { scale: 1.02 } : {}}
                    whileTap={isComplete ? { scale: 0.98 } : {}}
                    onClick={goPreview}
                    disabled={!isComplete}
                    className={`px-3 py-2 rounded-xl border text-sm inline-flex items-center gap-2 transition ${
                      isComplete
                        ? "border-[#c9a36a]/30 bg-[#c9a36a]/15 hover:bg-[#c9a36a]/20 text-white"
                        : "border-white/10 bg-black/30 text-stone-500 cursor-not-allowed"
                    }`}
                  >
                    Preview <Eye className="w-4 h-4" />
                  </motion.button>
                )}

                <button
                  onClick={reset}
                  className="px-3 py-2 rounded-xl border border-white/10 bg-black/30 text-stone-200 hover:bg-black/40 transition inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {step === 1 && (
                <HeadPicker
                  value={head as any}
                  onChange={(p: any) => {
                    setHead(p);
                    showToast("Bowl chosen. The chamber feels right.");
                    setStep(2);
                  }}
                  onToast={showToast}
                />
              )}

              {step === 2 && (
                <RingPicker
                  value={ring as any}
                  onChange={(p: any) => {
                    setRing(p); // ✅ can be null (No Ring)
                    showToast(p ? "Ring locked. The build tightens." : "No ring. Clean build.");
                    setStep(3);
                  }}
                  onToast={showToast}
                />
              )}

              {step === 3 && (
                <TailPicker
                  value={tail as any}
                  onChange={(p: any) => {
                    setTail(p);
                    showToast("Stem attached. Continue to preview.");
                  }}
                  onToast={showToast}
                  onFinish={goPreview} // ✅ FIX: Finish opens /custom/preview with state + session draft
                />
              )}
            </div>
          </motion.section>
        </div>
      </main>
    </>
  );
}