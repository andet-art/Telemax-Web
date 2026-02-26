// web/src/pages/custom/Ring.tsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, ArrowLeft, Loader2, Ban } from "lucide-react";
import { api } from "@/lib/api";
import type { PipePart } from "./Head";

type RingProps = {
  value: PipePart | null;
  onChange: (p: PipePart | null) => void;
  onToast?: (msg: string) => void;
};

function resolvePhoto(photo: string) {
  if (!photo) return "";
  if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
  const base = (import.meta as any).env?.VITE_API_URL || "";
  return `${String(base).replace(/\/$/, "")}/${String(photo).replace(/^\//, "")}`;
}

export default function Ring({ value, onChange, onToast }: RingProps) {
  const [step, setStep] = useState<0 | 1>(0);
  const [loading, setLoading] = useState(true);
  const [rings, setRings] = useState<PipePart[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    onToast?.("Let’s continue to the ring part.");
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/parts", { params: { part_type: "ring" } });
        const rows = (res.data?.data ?? res.data ?? []) as PipePart[];
        if (alive) setRings(rows);
      } catch (err) {
        console.error("Failed to fetch rings:", err);
        if (alive) setRings([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(
    () =>
      rings.map((r) => ({
        ...r,
        _photo: resolvePhoto((r as any).photo),
      })),
    [rings]
  );

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {/* INTRO SCREEN */}
        {step === 0 && (
          <motion.section
            key="intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-[32px] border border-white/10 bg-[#0b0704]/60 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-8 sm:p-10">
              <div className="text-sm text-stone-400">Step 2</div>
              <div className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-100">
                Choose Ring
              </div>
              <div className="mt-3 text-sm sm:text-base text-stone-400 max-w-2xl">
                You can add a ring for extra character — or skip it completely.
              </div>

              <div className="mt-7">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-2xl px-6 py-4 font-semibold inline-flex items-center gap-2 border bg-[#c9a36a]/15 border-[#c9a36a]/45 text-stone-100 hover:bg-[#c9a36a]/22 transition"
                >
                  Continue to Ring <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {/* RINGS GRID */}
        {step === 1 && (
          <motion.section
            key="rings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-3xl border border-white/10 bg-black/15 p-5"
          >
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <div className="text-sm text-stone-400">Select a ring</div>
                <div className="text-2xl font-bold text-stone-100">Rings</div>
                <div className="text-xs text-stone-500 mt-1">
                  You may also choose to skip the ring.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(0)}
                className="rounded-2xl px-4 py-3 font-semibold border border-white/10 bg-black/20 text-stone-200 hover:bg-black/30 transition inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>

            {loading ? (
              <div className="text-stone-300 inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading rings…
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* ✅ NO RING OPTION */}
                <motion.button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    onToast?.("No ring selected.");
                  }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.99 }}
                  className={`relative text-left rounded-2xl border overflow-hidden transition shadow-xl ${
                    value === null
                      ? "border-[#c9a36a]/60 bg-[#c9a36a]/10"
                      : "border-white/10 bg-black/20 hover:border-[#c9a36a]/35"
                  }`}
                >
                  <div className="aspect-[4/3] bg-black/40 flex items-center justify-center">
                    <Ban className="w-10 h-10 text-stone-400" />
                  </div>

                  <div className="p-4">
                    <div className="text-lg font-bold text-stone-100">
                      No Ring
                    </div>
                    <div className="text-xs text-stone-400">
                      Clean, minimal design.
                    </div>
                  </div>

                  {value === null && (
                    <div className="absolute top-3 right-3 bg-black/60 border border-white/10 rounded-full p-2">
                      <CheckCircle className="w-5 h-5 text-[#c9a36a]" />
                    </div>
                  )}
                </motion.button>

                {/* EXISTING RINGS */}
                {items.map((p, idx) => {
                  const selected = value && String(value.id) === String(p.id);

                  return (
                    <motion.button
                      key={String(p.id)}
                      type="button"
                      onClick={() => {
                        onChange(p);
                        onToast?.("Ring selected.");
                      }}
                      className={`relative text-left rounded-2xl border overflow-hidden transition shadow-xl ${
                        selected
                          ? "border-[#c9a36a]/60 bg-[#c9a36a]/10"
                          : "border-white/10 bg-black/20 hover:border-[#c9a36a]/35"
                      }`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.35 }}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="aspect-[4/3] bg-black/40">
                        <img
                          src={(p as any)._photo}
                          alt={(p as any).name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-lg font-bold text-stone-100">
                              {(p as any).name}
                            </div>
                            <div className="text-xs text-stone-400">
                              {(p as any).material || ""}
                            </div>
                          </div>

                          <div className="text-sm font-bold text-[#c9a36a]">
                            €{Number((p as any).price || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {selected && (
                        <div className="absolute top-3 right-3 bg-black/60 border border-white/10 rounded-full p-2">
                          <CheckCircle className="w-5 h-5 text-[#c9a36a]" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}