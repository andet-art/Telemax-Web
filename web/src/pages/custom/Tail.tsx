// web/src/pages/custom/Tail.tsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { PipePart } from "./Head";

type TailProps = {
  value: PipePart | null;
  onChange: (p: PipePart) => void;
  onToast?: (msg: string) => void;

  // ✅ NEW: parent will handle draft + navigation
  onFinish?: () => void;
};

function resolvePhoto(photo: string) {
  if (!photo) return "";
  if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
  const base = (import.meta as any).env?.VITE_API_URL || "";
  return `${String(base).replace(/\/$/, "")}/${String(photo).replace(/^\//, "")}`;
}

export default function Tail({ value, onChange, onToast, onFinish }: TailProps) {
  const [step, setStep] = useState<0 | 1>(0);
  const [loading, setLoading] = useState(true);
  const [tails, setTails] = useState<PipePart[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    onToast?.("Final step. Choose your tail.");
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/parts", { params: { part_type: "tail" } });
        const rows = (res.data?.data ?? res.data ?? []) as PipePart[];
        if (alive) setTails(rows);
      } catch (err) {
        console.error("Failed to fetch tails:", err);
        if (alive) setTails([]);
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
      tails.map((t) => ({
        ...t,
        _photo: resolvePhoto((t as any).photo),
      })),
    [tails]
  );

  return (
    <div className="w-full space-y-6">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.section
            key="intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-[32px] border border-white/10 bg-[#0b0704]/60 backdrop-blur-xl p-10"
          >
            <div className="text-sm text-stone-400">Final Step</div>
            <div className="mt-2 text-4xl font-extrabold text-stone-100">Choose Tail</div>
            <div className="mt-3 text-stone-400 max-w-xl">
              Complete your pipe by selecting the tail.
            </div>

            <div className="mt-7">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-2xl px-6 py-4 font-semibold inline-flex items-center gap-2 border bg-[#c9a36a]/15 border-[#c9a36a]/45 text-stone-100 hover:bg-[#c9a36a]/22 transition"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.section>
        )}

        {step === 1 && (
          <motion.section
            key="tails"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-3xl border border-white/10 bg-black/15 p-5"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-sm text-stone-400">Select a tail</div>
                <div className="text-2xl font-bold text-stone-100">Tails</div>
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
                <Loader2 className="w-4 h-4 animate-spin" /> Loading tails…
              </div>
            ) : items.length === 0 ? (
              <div className="text-stone-300">
                No tails found. Add rows in DB where <b>part_type = tail</b>.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {items.map((p, idx) => {
                    const selected = String(value?.id) === String(p.id);

                    return (
                      <motion.button
                        key={String(p.id)}
                        type="button"
                        onClick={() => {
                          onChange(p);
                          onToast?.("Tail selected.");
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
                          <div className="text-lg font-bold text-stone-100">
                            {(p as any).name}
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

                {/* ✅ FINISH -> call parent goPreview() */}
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (!value) return;
                      onFinish?.();
                    }}
                    disabled={!value}
                    className={`w-full sm:w-auto text-center rounded-3xl px-10 py-5 text-lg font-bold inline-flex items-center justify-center gap-3 border transition ${
                      value
                        ? "bg-[#c9a36a]/20 border-[#c9a36a]/50 text-stone-100 hover:bg-[#c9a36a]/30"
                        : "bg-black/20 border-white/10 text-stone-500 cursor-not-allowed"
                    }`}
                  >
                    Finish & Preview <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}