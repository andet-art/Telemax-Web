// src/pages/Preview.tsx
import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  ShoppingCart,
  ShieldCheck,
  Ban,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/context/CartContext";

type PipeAccent = "gold" | "ember" | "ice";

type PipePart = {
  id: number | string;
  name: string;
  price?: number | string | null;
  photo?: string | null;
  accent?: PipeAccent | string | null;
};

type CustomDraft = {
  head: PipePart | null;
  ring: PipePart | null; // ✅ optional
  tail: PipePart | null;
  total?: number;
  accent?: PipeAccent;
  currency?: string;
  createdAt?: number;
};

const DRAFT_KEY = "telemax_custom_draft";

function fmtMoney(amount: number, currency = "EUR") {
  const c = String(currency || "EUR").toUpperCase();
  const n = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: c,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${c}`;
  }
}

function num(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * ✅ IMPORTANT:
 * static images are served from host root (no /api):
 *   http://138.68.248.164:4000/parts/...
 *   http://138.68.248.164:4000/colors/...
 */
function resolvePhoto(photo?: string | null) {
  if (!photo) return "";

  const raw = String(photo).trim();
  if (/^https?:\/\//i.test(raw)) return raw;

  const apiBase = String((import.meta as any).env?.VITE_API_URL || "").replace(
    /\/$/,
    ""
  );

  // ✅ strip /api and anything after it
  const staticBase = apiBase.replace(/\/api(\/.*)?$/i, "");

  let p = raw.replace(/^\/+/, "");
  p = p.replace(/^api\/public\//i, "");
  p = p.replace(/^public\//i, "");

  return `${staticBase}/${p}`;
}

function readDraftFromSession(): CustomDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CustomDraft;
  } catch {
    return null;
  }
}

export default function Preview() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToCart, cartItemCount, cartTotal } = useCart();
  const location = useLocation();

  const draft: CustomDraft | null = useMemo(() => {
    const stateDraft = (location.state as any) as CustomDraft | undefined;
    const d =
      stateDraft?.head || stateDraft?.tail
        ? stateDraft
        : readDraftFromSession();

    // ✅ require head + tail, ring optional
    if (!d?.head || !d?.tail) return null;
    return d;
  }, [location.state]);

  const [pipeName, setPipeName] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const accent = (draft?.accent ?? "gold") as PipeAccent;
  const accentChip =
    accent === "ember"
      ? "text-[#ffb26b] border-[#ffb26b]/30 bg-[#ffb26b]/10"
      : accent === "ice"
      ? "text-[#a8d8ff] border-[#a8d8ff]/30 bg-[#a8d8ff]/10"
      : "text-[#c9a36a] border-[#c9a36a]/30 bg-[#c9a36a]/10";

  const currency = draft?.currency || "EUR";

  const headPrice = num(draft?.head?.price);
  const ringPrice = num(draft?.ring?.price);
  const tailPrice = num(draft?.tail?.price);
  const computedTotal = headPrice + ringPrice + tailPrice;

  const total = num(draft?.total) > 0 ? num(draft?.total) : computedTotal;

  const canAdd = !!draft && pipeName.trim().length > 0;

  const onAddToCart = useCallback(() => {
    if (!draft?.head || !draft?.tail) {
      showToast("No build found. Go back and complete at least Head + Tail.");
      return;
    }
    if (!pipeName.trim()) {
      showToast("Please name your pipe.");
      return;
    }

    addToCart({
      id: `custom-${Date.now()}`,
      type: "custom",
      name: pipeName.trim(),
      price: total,
      quantity: 1,
      currency,
      image: resolvePhoto(draft.head.photo),
      head: draft.head,
      ring: draft.ring ?? null,
      tail: draft.tail,
    } as any);

    showToast(t("orders.toasts.customAdded") || "Added to cart!");
    navigate("/cart");
  }, [addToCart, currency, draft, navigate, pipeName, showToast, t, total]);

  if (!draft) {
    return (
      <main className="min-h-screen pt-24 pb-20 bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f0b07]/95 to-[#1b120b]/95 p-6">
          <div className="text-xl font-bold mb-2">No build to preview</div>
          <div className="text-stone-300 mb-6">
            Go back to the builder and complete Head + Tail (Ring is optional).
          </div>
          <button
            onClick={() => navigate("/custom")}
            className="w-full px-5 py-3 rounded-2xl font-bold bg-gradient-to-r from-[#c9a36a] to-[#d4b173] text-black"
          >
            Back to Builder
          </button>
        </div>
      </main>
    );
  }

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

        <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <button
              onClick={() => navigate("/custom")}
              className="inline-flex items-center gap-2 text-sm text-[#c9a36a] hover:text-[#e5c584] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Builder
            </button>

            <div
              className={`px-3 py-2 rounded-xl border ${accentChip} text-xs font-semibold`}
            >
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Preview Mode
              </span>
            </div>
          </div>

          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white via-[#c9a36a] to-white bg-clip-text text-transparent">
              Preview Your Build
            </h1>
            <p className="text-stone-300 max-w-2xl mx-auto">
              Review the build, name it, then add it to your cart. (Ring is
              optional.)
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Preview cards */}
            <motion.section
              className="lg:col-span-8 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f0b07]/85 to-[#1a120b]/85 backdrop-blur-lg shadow-2xl overflow-hidden"
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
            >
              <div className="p-4 sm:p-6 border-b border-white/10">
                <div className="text-sm text-stone-400">Build</div>
                <div className="text-xl font-bold">Bowl • Ring • Stem</div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Bowl */}
                  <div className="rounded-2xl border border-white/10 bg-black/25 overflow-hidden">
                    <div className="p-3 border-b border-white/10 flex items-center justify-between">
                      <div className="text-sm font-semibold">Bowl</div>
                      <div className="text-xs text-stone-400">
                        {fmtMoney(headPrice, currency)}
                      </div>
                    </div>
                    <div className="relative aspect-[4/5] bg-black/40">
                      <img
                        src={resolvePhoto(draft.head?.photo)}
                        alt={draft.head?.name || "Head"}
                        className="absolute inset-0 w-full h-full object-cover opacity-95"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={() =>
                          console.log(
                            "IMG FAIL (preview head):",
                            resolvePhoto(draft.head?.photo)
                          )
                        }
                      />
                    </div>
                    <div className="p-3 text-sm text-stone-200">
                      {draft.head?.name || "Head"}
                    </div>
                  </div>

                  {/* Ring (optional) */}
                  <div className="rounded-2xl border border-white/10 bg-black/25 overflow-hidden">
                    <div className="p-3 border-b border-white/10 flex items-center justify-between">
                      <div className="text-sm font-semibold">Ring</div>
                      <div className="text-xs text-stone-400">
                        {draft.ring ? fmtMoney(ringPrice, currency) : "—"}
                      </div>
                    </div>

                    <div className="relative aspect-[4/5] bg-black/40">
                      {draft.ring?.photo ? (
                        <img
                          src={resolvePhoto(draft.ring.photo)}
                          alt={draft.ring.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-95"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={() =>
                            console.log(
                              "IMG FAIL (preview ring):",
                              resolvePhoto(draft.ring?.photo)
                            )
                          }
                        />
                      ) : (
                        // ✅ BIG CIRCLE "NO RING" (taken from Ring.tsx vibe)
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <div className="w-20 h-20 rounded-full border border-white/10 bg-black/35 grid place-items-center shadow-xl">
                            <Ban className="w-9 h-9 text-stone-400" />
                          </div>
                          <div className="text-sm font-semibold text-stone-200">
                            No Ring
                          </div>
                          <div className="text-xs text-stone-500">
                            Clean, minimal design.
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 text-sm text-stone-200">
                      {draft.ring?.name || "No Ring selected"}
                    </div>
                  </div>

                  {/* Stem */}
                  <div className="rounded-2xl border border-white/10 bg-black/25 overflow-hidden">
                    <div className="p-3 border-b border-white/10 flex items-center justify-between">
                      <div className="text-sm font-semibold">Stem</div>
                      <div className="text-xs text-stone-400">
                        {fmtMoney(tailPrice, currency)}
                      </div>
                    </div>
                    <div className="relative aspect-[4/5] bg-black/40">
                      <img
                        src={resolvePhoto(draft.tail?.photo)}
                        alt={draft.tail?.name || "Tail"}
                        className="absolute inset-0 w-full h-full object-cover opacity-95"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={() =>
                          console.log(
                            "IMG FAIL (preview tail):",
                            resolvePhoto(draft.tail?.photo)
                          )
                        }
                      />
                    </div>
                    <div className="p-3 text-sm text-stone-200">
                      {draft.tail?.name || "Tail"}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-stone-400">Build total</div>
                    <div className="text-2xl font-bold text-[#c9a36a]">
                      {fmtMoney(total, currency)}
                    </div>
                  </div>
                  <div
                    className={`shrink-0 text-xs px-2 py-1 rounded-lg border ${accentChip}`}
                  >
                    {accent === "ember"
                      ? "Ember"
                      : accent === "ice"
                      ? "Ice"
                      : "Gold"}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Finish + Add to cart */}
            <motion.aside
              className="lg:col-span-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a120b]/85 to-[#2a1d13]/85 backdrop-blur-lg shadow-2xl overflow-hidden"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
            >
              <div className="p-4 sm:p-6 border-b border-white/10">
                <div className="text-sm text-stone-400">Finish</div>
                <div className="text-xl font-bold">Name & Add to Cart</div>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-sm text-stone-300 mb-2">
                    Name your pipe
                  </div>
                  <input
                    value={pipeName}
                    onChange={(e) => setPipeName(e.target.value)}
                    placeholder="e.g. Golden Ember"
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#c9a36a]/50"
                  />
                </div>

                <motion.button
                  whileHover={canAdd ? { scale: 1.02 } : {}}
                  whileTap={canAdd ? { scale: 0.98 } : {}}
                  onClick={onAddToCart}
                  disabled={!canAdd}
                  className={`w-full px-5 py-3 rounded-2xl font-bold shadow-lg ${
                    canAdd
                      ? "bg-gradient-to-r from-[#c9a36a] to-[#d4b173] text-black"
                      : "bg-stone-700/50 text-stone-400 cursor-not-allowed"
                  }`}
                >
                  Add to Cart
                </motion.button>

                <div className="text-xs text-stone-500 leading-relaxed">
                  If you want to change parts, go back to the builder.
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </main>
    </>
  );
}