import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Palette } from "lucide-react";
import { api } from "@/lib/api";

export type PipePart = {
  id: string | number;
  part_type: "head" | "ring" | "tail";
  code: string; // e.g. HEAD-AVERY-01__BLACK
  name: string;
  photo: string; // e.g. parts/HEAD-AVERY-01.png or full URL
  created_at?: string;

  // optional (if you add them later in DB)
  material?: string | null;
  vibe?: string | null;
  price?: number | null;
  accent?: "gold" | "ember" | "ice" | null;
};

type HeadProps = {
  value: PipePart | null;
  onChange: (p: PipePart) => void;
  onToast?: (msg: string) => void;
};

function resolvePhoto(photo: string) {
  if (!photo) return "";
  if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
  const base = (import.meta as any).env?.VITE_API_URL || "";
  return `${base.replace(/\/$/, "")}/${photo.replace(/^\//, "")}`;
}

function getModelKey(code: string) {
  return code.includes("__") ? code.split("__")[0] : code;
}
function getColorKey(code: string) {
  return code.includes("__") ? code.split("__")[1] : "";
}

export default function Head({ value, onChange, onToast }: HeadProps) {
  const [loading, setLoading] = useState(true);
  const [heads, setHeads] = useState<PipePart[]>([]);
  const [modelKey, setModelKey] = useState<string | null>(null);

  // FETCH heads from backend (parts table)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/parts", { params: { part_type: "head" } });

        const rows = (res.data?.data ?? res.data ?? []) as PipePart[];

        // normalize photo -> full URL
        const normalized = rows.map((r) => ({
          ...r,
          photo: r.photo, // keep raw in state; we resolve when rendering
        }));

        if (alive) setHeads(normalized);
      } catch {
        if (alive) setHeads([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // keep UI aligned to selected head model
  useEffect(() => {
    if (value?.code) setModelKey(getModelKey(value.code));
  }, [value?.code]);

  const models = useMemo(() => {
    const map = new Map<string, PipePart>();
    for (const h of heads) {
      const mk = getModelKey(h.code);
      if (!map.has(mk)) map.set(mk, h); // first variant as cover
    }

    return Array.from(map.entries()).map(([mk, sample]) => ({
      modelKey: mk,
      sample,
      displayName: sample.name || mk.replace(/^HEAD-/, "").replace(/-/g, " "),
      cover: resolvePhoto(sample.photo),
    }));
  }, [heads]);

  const colorsForModel = useMemo(() => {
    if (!modelKey) return [];

    const variants = heads.filter((h) => getModelKey(h.code) === modelKey);

    const map = new Map<string, PipePart>();
    for (const v of variants) {
      const ck = getColorKey(v.code) || v.code;
      if (!map.has(ck)) map.set(ck, v);
    }

    return Array.from(map.entries()).map(([ck, v]) => ({
      colorKey: ck,
      variant: v,
      photo: resolvePhoto(v.photo),
      label: ck.replace(/_/g, " "),
    }));
  }, [heads, modelKey]);

  const selectedModelKey = modelKey;
  const selectedColorKey = value?.code ? getColorKey(value.code) : "";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-stone-400">Step 1</div>
          <div className="text-xl font-bold">Choose Head Model</div>
        </div>

        {selectedModelKey && (
          <div className="text-xs px-3 py-2 rounded-xl border border-white/10 bg-black/25 text-stone-200">
            Model:{" "}
            <span className="text-[#c9a36a] font-semibold">
              {selectedModelKey}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-stone-300">Loading head models…</div>
      ) : models.length === 0 ? (
        <div className="text-stone-300">
          No head parts found. Add rows in DB where <b>part_type=head</b>.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {models.map(({ modelKey: mk, cover, displayName }, idx) => {
            const active = mk === selectedModelKey;

            return (
              <motion.button
                key={mk}
                type="button"
                onClick={() => {
                  setModelKey(mk);
                  onToast?.("Model chosen. Now pick a color.");
                }}
                className={`relative text-left rounded-2xl border overflow-hidden transition shadow-xl ${
                  active
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
                    src={cover}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="p-4">
                  <div className="text-lg font-bold line-clamp-1">
                    {displayName}
                  </div>
                  <div className="text-xs text-stone-400 mt-1">{mk}</div>
                </div>

                {active && (
                  <div className="absolute top-3 right-3 bg-black/60 border border-white/10 rounded-full p-2">
                    <CheckCircle className="w-5 h-5 text-[#c9a36a]" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* COLORS */}
      <AnimatePresence>
        {selectedModelKey && (
          <motion.div
            key="colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <div className="text-sm text-stone-400">Step 2</div>
                <div className="text-lg font-bold">Choose Color</div>
              </div>
              <div className="inline-flex items-center gap-2 text-xs text-stone-300">
                <Palette className="w-4 h-4 text-[#c9a36a]" />
                {colorsForModel.length} colors
              </div>
            </div>

            {colorsForModel.length === 0 ? (
              <div className="text-stone-300">
                No colors for this model. Make sure you inserted rows like{" "}
                <b>HEAD-XXX__COLOR</b>.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {colorsForModel.map(({ colorKey, variant, photo, label }) => {
                  const active = colorKey === selectedColorKey;

                  return (
                    <button
                      key={colorKey}
                      type="button"
                      onClick={() => {
                        onChange(variant);
                        onToast?.("Head color selected.");
                      }}
                      className={`rounded-xl border overflow-hidden text-left transition ${
                        active
                          ? "border-[#c9a36a]/70 bg-[#c9a36a]/10"
                          : "border-white/10 bg-black/20 hover:border-[#c9a36a]/35"
                      }`}
                    >
                      <div className="aspect-[4/3] bg-black/40">
                        <img
                          src={photo}
                          alt={label}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="px-2 py-2">
                        <div className="text-[11px] text-stone-200 line-clamp-1">
                          {label}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}