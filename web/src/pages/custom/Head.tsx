import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Palette } from "lucide-react";
import { api } from "@/lib/api";

export type PipePart = {
  id: string | number;
  part_type: "head" | "ring" | "tail";
  code: string;
  name: string;
  photo: string;
  created_at?: string;
};

type HeadProps = {
  value: PipePart | null;
  onChange: (p: PipePart) => void;
  onToast?: (msg: string) => void;
};

function resolvePhoto(photo: string) {
  if (!photo) return "";
  if (photo.startsWith("http")) return photo;

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

  /* =========================
     FETCH ONLY HEAD PARTS
  ========================= */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // 🔥 Explicitly calling /api/parts
        const res = await api.get("/api/parts", {
          params: { part_type: "head" },
        });

        const rows =
          (res.data?.data ?? res.data ?? []) as PipePart[];

        if (alive) setHeads(rows);
      } catch (err) {
        console.error("Failed to fetch heads:", err);
        if (alive) setHeads([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (value?.code) {
      setModelKey(getModelKey(value.code));
    }
  }, [value?.code]);

  const models = useMemo(() => {
    const map = new Map<string, PipePart>();

    for (const h of heads) {
      const mk = getModelKey(h.code);
      if (!map.has(mk)) {
        map.set(mk, h);
      }
    }

    return Array.from(map.entries()).map(([mk, sample]) => ({
      modelKey: mk,
      sample,
      displayName:
        sample.name ||
        mk.replace(/^HEAD-/, "").replace(/-/g, " "),
      cover: resolvePhoto(sample.photo),
    }));
  }, [heads]);

  const colorsForModel = useMemo(() => {
    if (!modelKey) return [];

    const variants = heads.filter(
      (h) => getModelKey(h.code) === modelKey
    );

    const map = new Map<string, PipePart>();

    for (const v of variants) {
      const ck = getColorKey(v.code) || v.code;
      if (!map.has(ck)) {
        map.set(ck, v);
      }
    }

    return Array.from(map.entries()).map(([ck, v]) => ({
      colorKey: ck,
      variant: v,
      photo: resolvePhoto(v.photo),
      label: ck.replace(/_/g, " "),
    }));
  }, [heads, modelKey]);

  const selectedColorKey = value?.code
    ? getColorKey(value.code)
    : "";

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-stone-400">
          Step 1
        </div>
        <div className="text-xl font-bold">
          Choose Head Model
        </div>
      </div>

      {loading ? (
        <div className="text-stone-300">
          Loading head models…
        </div>
      ) : models.length === 0 ? (
        <div className="text-stone-300">
          No head parts found. Add rows in DB where{" "}
          <b>part_type = head</b>.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {models.map(({ modelKey: mk, cover, displayName }) => {
            const active = mk === modelKey;

            return (
              <motion.button
                key={mk}
                type="button"
                onClick={() => {
                  setModelKey(mk);
                  onToast?.(
                    "Model selected. Choose a color."
                  );
                }}
                className={`relative rounded-2xl border overflow-hidden transition ${
                  active
                    ? "border-[#c9a36a]/70 bg-[#c9a36a]/10"
                    : "border-white/10 bg-black/20 hover:border-[#c9a36a]/35"
                }`}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
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
                  <div className="text-lg font-bold">
                    {displayName}
                  </div>
                  <div className="text-xs text-stone-400 mt-1">
                    {mk}
                  </div>
                </div>

                {active && (
                  <div className="absolute top-3 right-3 bg-black/60 rounded-full p-2">
                    <CheckCircle className="w-5 h-5 text-[#c9a36a]" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modelKey && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <div className="flex justify-between mb-4">
              <div>
                <div className="text-sm text-stone-400">
                  Step 2
                </div>
                <div className="text-lg font-bold">
                  Choose Color
                </div>
              </div>
              <div className="text-xs text-stone-300">
                <Palette className="w-4 h-4 inline mr-1 text-[#c9a36a]" />
                {colorsForModel.length} colors
              </div>
            </div>

            {colorsForModel.length === 0 ? (
              <div className="text-stone-300">
                No colors found for this model.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {colorsForModel.map(
                  ({ colorKey, variant, photo, label }) => {
                    const active =
                      colorKey === selectedColorKey;

                    return (
                      <button
                        key={colorKey}
                        type="button"
                        onClick={() => {
                          onChange(variant);
                          onToast?.(
                            "Head color selected."
                          );
                        }}
                        className={`rounded-xl border overflow-hidden transition ${
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
                        <div className="px-2 py-2 text-[11px] text-stone-200">
                          {label}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}