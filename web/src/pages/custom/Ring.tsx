import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { PipePart } from "./Head";

type RingProps = {
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

export default function Ring({ value, onChange, onToast }: RingProps) {
  const [loading, setLoading] = useState(true);
  const [rings, setRings] = useState<PipePart[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/parts", { params: { part_type: "ring" } });
        const rows = (res.data?.data || res.data || []) as PipePart[];
        if (alive) setRings(rows);
      } catch {
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
        _photo: resolvePhoto(r.photo),
      })),
    [rings]
  );

  if (loading) return <div className="text-stone-300">Loading rings…</div>;
  if (items.length === 0)
    return (
      <div className="text-stone-300">
        No rings found. Add rows in DB where <b>part_type=ring</b>.
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((p, idx) => {
        const selected = String(value?.id) === String(p.id);
        return (
          <motion.button
            key={String(p.id)}
            type="button"
            onClick={() => {
              onChange(p);
              onToast?.("Ring locked. The build tightens.");
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
                src={p._photo}
                alt={p.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-lg font-bold line-clamp-1">{p.name}</div>
                  <div className="text-xs text-stone-400">{p.material || ""}</div>
                </div>
                <div className="shrink-0 text-sm font-bold text-[#c9a36a]">
                  €{Number(p.price || 0).toFixed(2)}
                </div>
              </div>

              {p.vibe && (
                <div className="mt-3 text-sm text-stone-300 line-clamp-2">
                  {p.vibe}
                </div>
              )}
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
  );
}