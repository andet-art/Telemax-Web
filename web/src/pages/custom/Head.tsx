// web/src/pages/custom/Head.tsx
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

type CatalogSubtype = {
  id: number;
  type_id: number;
  name: string;
  sort_order: number;
  is_active: number;
  photo: string | null;
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

  // IMPORTANT: VITE_API_URL should be like http://138.68.248.164:4000 (NO /api)
  const base = (import.meta as any).env?.VITE_API_URL || "";
  return `${base.replace(/\/$/, "")}/${photo.replace(/^\//, "")}`;
}

function getModelKey(code: string) {
  return code.includes("__") ? code.split("__")[0] : code;
}

function getColorKey(code: string) {
  return code.includes("__") ? code.split("__")[1] : "";
}

function normalizeKey(s: string) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[_-]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export default function Head({ value, onChange, onToast }: HeadProps) {
  const [loading, setLoading] = useState(true);
  const [heads, setHeads] = useState<PipePart[]>([]);
  const [modelKey, setModelKey] = useState<string | null>(null);

  // ✅ fetch ALL subtypes (all 28)
  const [subtypeLoading, setSubtypeLoading] = useState(false);
  const [subtypes, setSubtypes] = useState<CatalogSubtype[]>([]);

  /* =========================
     FETCH ONLY HEAD PARTS
  ========================= */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/parts", { params: { part_type: "head" } });
        const rows = (res.data?.data ?? res.data ?? []) as PipePart[];
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

  /* =========================
     ✅ FETCH ALL SUBTYPES
     GET /api/catalog-subtypes
     (NO type_id filter)
  ========================= */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setSubtypeLoading(true);

        const res = await api.get("/api/catalog-subtypes"); // ✅ all 28
        const rows = (res.data?.data ?? res.data ?? []) as CatalogSubtype[];

        if (alive) setSubtypes(rows);
      } catch (err) {
        console.error("Failed to fetch catalog subtypes:", err);
        if (alive) setSubtypes([]);
      } finally {
        if (alive) setSubtypeLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (value?.code) setModelKey(getModelKey(value.code));
  }, [value?.code]);

  const models = useMemo(() => {
    const map = new Map<string, PipePart>();

    for (const h of heads) {
      const mk = getModelKey(h.code);
      if (!map.has(mk)) map.set(mk, h);
    }

    return Array.from(map.entries()).map(([mk, sample]) => ({
      modelKey: mk,
      sample,
      displayName: sample.name || mk.replace(/^HEAD-/, "").replace(/-/g, " "),
      cover: resolvePhoto(sample.photo),
    }));
  }, [heads]);

  const modelVariants = useMemo(() => {
    if (!modelKey) return [];
    return heads.filter((h) => getModelKey(h.code) === modelKey);
  }, [heads, modelKey]);

  const selectedColorKey = value?.code ? getColorKey(value.code) : "";

  /**
   * ✅ ALWAYS show ALL subtype colors (all 28)
   * sorted by type_id, then sort_order
   */
  const colorsAll = useMemo(() => {
    return subtypes
      .slice()
      .filter((s) => Number(s.is_active) === 1)
      .sort((a, b) => {
        const t = (a.type_id ?? 0) - (b.type_id ?? 0);
        if (t !== 0) return t;
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      })
      .map((s) => ({
        subtypeId: s.id,
        typeId: s.type_id,
        label: s.name,
        colorKey: normalizeKey(s.name),
        photo: resolvePhoto(s.photo || ""),
      }));
  }, [subtypes]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-stone-400">Step 1</div>
        <div className="text-xl font-bold">Choose Head Model</div>
      </div>

      {loading ? (
        <div className="text-stone-300">Loading head models…</div>
      ) : models.length === 0 ? (
        <div className="text-stone-300">
          No head parts found. Add rows in DB where <b>part_type = head</b>.
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
                  onToast?.("Model selected. Choose a color.");
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
                  <div className="text-lg font-bold">{displayName}</div>
                  <div className="text-xs text-stone-400 mt-1">{mk}</div>
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
                <div className="text-sm text-stone-400">Step 2</div>
                <div className="text-lg font-bold">Choose Color</div>
              </div>

              <div className="text-xs text-stone-300">
                <Palette className="w-4 h-4 inline mr-1 text-[#c9a36a]" />
                {subtypeLoading ? "Loading…" : `${colorsAll.length} colors`}
              </div>
            </div>

            {subtypeLoading ? (
              <div className="text-stone-300">Loading colors…</div>
            ) : colorsAll.length === 0 ? (
              <div className="text-stone-300">
                No subtype colors found. Check <b>catalog_subtypes</b>.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {colorsAll.map(({ subtypeId, label, photo, colorKey, typeId }) => {
                  const active = normalizeKey(selectedColorKey) === colorKey;

                  return (
                    <button
                      key={subtypeId}
                      type="button"
                      onClick={() => {
                        // find matching HEAD variant for this model + this color
                        const best =
                          modelVariants.find(
                            (v) => normalizeKey(getColorKey(v.code)) === colorKey
                          ) ||
                          modelVariants.find((v) => normalizeKey(v.name) === colorKey) ||
                          null;

                        if (best) {
                          onChange(best);
                          onToast?.("Head color selected.");
                        } else {
                          onToast?.(
                            `No HEAD variant for "${label}" (type_id=${typeId}) in parts. Add it to parts table for this head model.`
                          );
                        }
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
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}