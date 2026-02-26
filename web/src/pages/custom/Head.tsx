// web/src/pages/custom/Head.tsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  Loader2,
  Palette,
  ArrowLeft,
} from "lucide-react";
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

/**
 * ✅ IMPORTANT:
 * Your images are served from:
 *   http://138.68.248.164:4000/parts/...
 * but your VITE_API_URL may be:
 *   http://138.68.248.164:4000/api
 *
 * So we must remove trailing "/api" (or "/api/...") when building static URLs.
 */
function resolvePhoto(photo: string) {
  if (!photo) return "";

  const raw = String(photo).trim();

  // If backend returns absolute URL already, use it
  if (/^https?:\/\//i.test(raw)) return raw;

  // API base may include /api (axios base), but static files are served from the host root
  const apiBase = String((import.meta as any).env?.VITE_API_URL || "").replace(
    /\/$/,
    ""
  );

  // ✅ Strong strip: remove "/api" and anything after it ("/api", "/api/", "/api/v1", etc.)
  const staticBase = apiBase.replace(/\/api(\/.*)?$/i, "");

  // normalize path, remove leading slashes
  let p = raw.replace(/^\/+/, "");

  // if DB stored "public/parts/xx.jpg" or "api/public/parts/xx.jpg", normalize it
  p = p.replace(/^api\/public\//i, "");
  p = p.replace(/^public\//i, "");

  return `${staticBase}/${p}`;
}

function getModelKey(code: string) {
  return code.includes("__") ? code.split("__")[0] : code;
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
  // 0 = Intro, 1 = Models, 2 = Colors, 3 = Summary
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  const [loadingHeads, setLoadingHeads] = useState(true);
  const [heads, setHeads] = useState<PipePart[]>([]);

  const [loadingSubtypes, setLoadingSubtypes] = useState(true);
  const [subtypes, setSubtypes] = useState<CatalogSubtype[]>([]);

  const [selectedModelKey, setSelectedModelKey] = useState<string | null>(null);
  const [selectedSubtypeId, setSelectedSubtypeId] = useState<number | null>(
    null
  );

  /* =========================
     FETCH HEAD PARTS
  ========================= */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingHeads(true);
        const res = await api.get("/api/parts", {
          params: { part_type: "head" },
        });
        const rows = (res.data?.data ?? res.data ?? []) as PipePart[];

        // normalize photos defensively (if backend sends weird prefixes)
        const normalized = rows.map((r) => ({
          ...r,
          photo: typeof r.photo === "string" ? r.photo.trim() : "",
        }));

        if (alive) setHeads(normalized);
      } catch (e) {
        console.error("Failed to fetch heads:", e);
        if (alive) setHeads([]);
      } finally {
        if (alive) setLoadingHeads(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  /* =========================
     FETCH SUBTYPES (COLORS)
  ========================= */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingSubtypes(true);
        const res = await api.get("/api/catalog-subtypes");
        const rows = (res.data?.data ?? res.data ?? []) as CatalogSubtype[];

        const normalized = rows.map((r) => ({
          ...r,
          photo: r.photo ? String(r.photo).trim() : null,
        }));

        if (alive) setSubtypes(normalized);
      } catch (e) {
        console.error("Failed to fetch catalog subtypes:", e);
        if (alive) setSubtypes([]);
      } finally {
        if (alive) setLoadingSubtypes(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // hydrate (optional)
  useEffect(() => {
    if (!value?.code) return;

    const mk = getModelKey(value.code);
    setSelectedModelKey(mk);

    const suffix = value.code.includes("__") ? value.code.split("__")[1] : "";
    const normSuffix = normalizeKey(suffix);

    if (!normSuffix) return;
    const match = subtypes.find((s) => normalizeKey(s.name) === normSuffix);
    if (match) setSelectedSubtypeId(match.id);
  }, [value?.code, subtypes]);

  /* =========================
     DERIVED
  ========================= */
  const models = useMemo(() => {
    const map = new Map<string, PipePart>();
    for (const h of heads) {
      const mk = getModelKey(h.code);
      if (!map.has(mk)) map.set(mk, h);
    }
    return Array.from(map.entries()).map(([mk, sample]) => ({
      modelKey: mk,
      displayName: sample.name || mk.replace(/^HEAD-/, "").replace(/-/g, " "),
      cover: resolvePhoto(sample.photo),
      sample,
    }));
  }, [heads]);

  const colors = useMemo(() => {
    return subtypes
      .slice()
      .filter((s) => Number(s.is_active) === 1)
      .sort((a, b) => {
        const t = (a.type_id ?? 0) - (b.type_id ?? 0);
        if (t !== 0) return t;
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      });
  }, [subtypes]);

  const selectedModel = useMemo(() => {
    if (!selectedModelKey) return null;
    return models.find((m) => m.modelKey === selectedModelKey) || null;
  }, [models, selectedModelKey]);

  const selectedSubtype = useMemo(() => {
    if (!selectedSubtypeId) return null;
    return colors.find((c) => c.id === selectedSubtypeId) || null;
  }, [colors, selectedSubtypeId]);

  const variantsForSelectedModel = useMemo(() => {
    if (!selectedModelKey) return [];
    return heads.filter((h) => getModelKey(h.code) === selectedModelKey);
  }, [heads, selectedModelKey]);

  function buildSelection(): PipePart | null {
    if (!selectedModelKey || !selectedSubtype) return null;

    const colorKey = normalizeKey(selectedSubtype.name);

    const best =
      variantsForSelectedModel.find(
        (v) => normalizeKey((v.code.split("__")[1] || "").trim()) === colorKey
      ) ||
      variantsForSelectedModel.find((v) => normalizeKey(v.name) === colorKey) ||
      null;

    if (best) return best;

    const sample = variantsForSelectedModel[0] ?? null;
    if (!sample) return null;

    return {
      ...sample,
      code: `${selectedModelKey}__${colorKey}`,
      name: `${sample.name} — ${selectedSubtype.name}`,
      photo: sample.photo,
    };
  }

  function continueToStep2() {
    const picked = buildSelection();
    if (!picked) {
      onToast?.("Missing selection.");
      return;
    }
    onChange(picked);
    onToast?.("Head selected. Moving to Step 2.");
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {/* =========================
            INTRO BIG SCREEN
        ========================= */}
        {step === 0 && (
          <motion.section
            key="intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-[32px] border border-white/10 bg-[#0b0704]/60 backdrop-blur-xl overflow-hidden"
          >
            <div className="relative p-8 sm:p-10">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#c9a36a]/10 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
              </div>

              <div className="relative">
                <div className="text-sm text-stone-400">Step 1</div>
                <div className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-100">
                  Choose Head
                </div>
                <div className="mt-3 text-sm sm:text-base text-stone-400 max-w-2xl">
                  Start by selecting a head model, then pick one of the available
                  colors.
                </div>

                <div className="mt-7 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-2xl px-6 py-4 font-semibold inline-flex items-center gap-2 border bg-[#c9a36a]/15 border-[#c9a36a]/45 text-stone-100 hover:bg-[#c9a36a]/22 transition"
                  >
                    Continue <ArrowRight className="w-5 h-5" />
                  </button>

                  <div className="text-xs text-stone-500 inline-flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#c9a36a]" />
                    Model → Color → Summary
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* =========================
            MODELS SCREEN (click -> goes to colors immediately)
        ========================= */}
        {step === 1 && (
          <motion.section
            key="models"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-3xl border border-white/10 bg-black/15 p-5"
          >
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <div className="text-sm text-stone-400">Select a model</div>
                <div className="text-2xl font-bold text-stone-100">
                  Head Models
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  Tap a model to continue to colors.
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

            {loadingHeads ? (
              <div className="text-stone-300 inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading models…
              </div>
            ) : models.length === 0 ? (
              <div className="text-stone-300">
                No head parts found. Add rows where <b>part_type=head</b>.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {models.map((m) => {
                  const active = m.modelKey === selectedModelKey;

                  return (
                    <motion.button
                      key={m.modelKey}
                      type="button"
                      onClick={() => {
                        setSelectedModelKey(m.modelKey);
                        onToast?.("Model selected.");
                        setStep(2);
                      }}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative overflow-hidden rounded-2xl border text-left transition ${
                        active
                          ? "border-[#c9a36a]/70 bg-[#c9a36a]/10"
                          : "border-white/10 bg-black/20 hover:border-[#c9a36a]/35"
                      }`}
                    >
                      <div className="aspect-[4/3] bg-black/40">
                        <img
                          src={m.cover}
                          alt={m.displayName}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition"
                          loading="lazy"
                          // ✅ helps if server has referer hotlink protection
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={() =>
                            console.log("IMG FAIL (model cover):", m.cover)
                          }
                        />
                      </div>

                      <div className="p-4">
                        <div className="text-lg font-bold text-stone-100">
                          {m.displayName}
                        </div>
                        <div className="text-xs text-stone-500 mt-1">
                          {m.modelKey}
                        </div>
                      </div>

                      {active && (
                        <div className="absolute top-3 right-3 bg-black/60 rounded-full p-2 border border-white/10">
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

        {/* =========================
            COLORS SCREEN
        ========================= */}
        {step === 2 && (
          <motion.section
            key="colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-3xl border border-white/10 bg-black/15 p-5"
          >
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <div className="text-sm text-stone-400">Select a color</div>
                <div className="text-2xl font-bold text-stone-100">Colors</div>
                <div className="text-xs text-stone-500 mt-1">
                  Choose one color to continue.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-2xl px-4 py-3 font-semibold border border-white/10 bg-black/20 text-stone-200 hover:bg-black/30 transition inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Models
              </button>
            </div>

            {loadingSubtypes ? (
              <div className="text-stone-300 inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading colors…
              </div>
            ) : colors.length === 0 ? (
              <div className="text-stone-300">
                No subtype colors found. Check <b>catalog_subtypes</b>.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {colors.map((c) => {
                  const active = c.id === selectedSubtypeId;

                  return (
                    <motion.button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedSubtypeId(c.id);
                        onToast?.("Color selected.");
                        setStep(3);
                      }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative overflow-hidden rounded-2xl border p-3 text-left transition ${
                        active
                          ? "border-[#c9a36a]/70 bg-[#c9a36a]/10"
                          : "border-white/10 bg-black/20 hover:border-[#c9a36a]/35"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                          {c.photo ? (
                            <img
                              src={resolvePhoto(c.photo)}
                              alt={c.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                              onError={() =>
                                console.log(
                                  "IMG FAIL (color thumb):",
                                  resolvePhoto(c.photo!)
                                )
                              }
                            />
                          ) : (
                            <div className="w-full h-full bg-white/5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-stone-100 truncate">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-stone-500 truncate">
                            type_id={c.type_id}
                          </div>
                        </div>

                        {active && (
                          <CheckCircle className="w-5 h-5 text-[#c9a36a]" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.section>
        )}

        {/* =========================
            SUMMARY + CONTINUE ONLY
        ========================= */}
        {step === 3 && (
          <motion.section
            key="summary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-3xl border border-white/10 bg-black/15 p-5"
          >
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <div className="text-sm text-stone-400">Review</div>
                <div className="text-2xl font-bold text-stone-100">Summary</div>
                <div className="text-xs text-stone-500 mt-1">
                  Confirm, then continue.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-2xl px-4 py-3 font-semibold border border-white/10 bg-black/20 text-stone-200 hover:bg-black/30 transition inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Colors
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-stone-400 mb-2">Model</div>
                {selectedModel ? (
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-14 rounded-xl overflow-hidden border border-white/10 bg-black/30">
                      <img
                        src={selectedModel.cover}
                        alt={selectedModel.displayName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={() =>
                          console.log(
                            "IMG FAIL (summary model):",
                            selectedModel.cover
                          )
                        }
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-stone-100 truncate">
                        {selectedModel.displayName}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {selectedModel.modelKey}
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-[#c9a36a] ml-auto" />
                  </div>
                ) : (
                  <div className="text-sm text-stone-500">Not selected</div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-stone-400 mb-2">Color</div>
                {selectedSubtype ? (
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-14 rounded-xl overflow-hidden border border-white/10 bg-black/30">
                      {selectedSubtype.photo ? (
                        <img
                          src={resolvePhoto(selectedSubtype.photo)}
                          alt={selectedSubtype.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={() =>
                            console.log(
                              "IMG FAIL (summary color):",
                              resolvePhoto(selectedSubtype.photo!)
                            )
                          }
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-stone-100 truncate">
                        {selectedSubtype.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        type_id={selectedSubtype.type_id}
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-[#c9a36a] ml-auto" />
                  </div>
                ) : (
                  <div className="text-sm text-stone-500">Not selected</div>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-[#0b0704]/60 backdrop-blur-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-sm text-stone-300 inline-flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#c9a36a]" />
                Ready to continue to Step 2 (Ring).
              </div>

              <button
                type="button"
                onClick={continueToStep2}
                disabled={!selectedModelKey || !selectedSubtypeId}
                className={`rounded-2xl px-5 py-4 font-semibold inline-flex items-center gap-2 border transition ${
                  selectedModelKey && selectedSubtypeId
                    ? "bg-[#c9a36a]/15 border-[#c9a36a]/45 text-stone-100 hover:bg-[#c9a36a]/22"
                    : "bg-black/20 border-white/10 text-stone-500 cursor-not-allowed"
                }`}
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}