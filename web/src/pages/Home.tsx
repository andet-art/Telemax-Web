// src/pages/Orders.tsx
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart, X, CheckCircle } from "lucide-react";

import { useCart } from "../context/CartContext";
import { api } from "@/lib/api";

/** ---------------------------
 *  BACKEND DATA (DB SHAPE)
 *  --------------------------*/
type DbProduct = {
  id: number | string;
  sku: string | number;
  name: string;
  description: string | null;
  price: number | string | null;
  currency: string | null;
  primary_photo: string | null;
  type_id: number | null;
  subtype_id: number | null;
  is_active: number | boolean | null;
  created_at?: string;
  updated_at?: string;
};

type ProductsApiResponse = {
  success: boolean;
  count?: number;
  data: DbProduct[];
  message?: string;
};

type ApiProduct = {
  id: string | number;
  sku?: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  image?: string;
};

/** Simple throttle */
const throttle = (fn: (...args: any[]) => void, wait = 100) => {
  let last = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn(...args);
    }
  };
};

// ✅ Build absolute image URL from DB values like "photos/3273001.png"
function getApiOrigin(): string {
  const base = (
    api?.defaults?.baseURL ||
    (import.meta as any)?.env?.VITE_API_URL ||
    ""
  )
    .toString()
    .trim();

  if (!base) return window.location.origin;

  const noTrailing = base.replace(/\/+$/, "");
  const stripped = noTrailing.replace(/\/api$/i, "");
  return stripped || window.location.origin;
}

function resolveImageUrl(primary_photo?: string | null): string {
  const fallback =
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop";
  if (!primary_photo) return fallback;

  const raw = String(primary_photo).trim();
  if (!raw) return fallback;

  if (/^https?:\/\//i.test(raw)) return raw;

  const origin = getApiOrigin();
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${origin}${path}`;
}

// ✅ currency-aware display
function fmtMoney(amount: number, currency?: string) {
  const c = (currency || "EUR").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: c,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${c}`;
  }
}

// Toast
const Toast = ({
  message,
  type = "success",
  onClose,
}: {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}) => (
  <motion.div
    className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-[70] flex items-center gap-3 ${
      type === "success"
        ? "bg-gradient-to-r from-green-800 to-green-700 text-green-100"
        : "bg-gradient-to-r from-red-800 to-red-700 text-red-100"
    }`}
    initial={{ opacity: 0, y: -20, x: 20 }}
    animate={{ opacity: 1, y: 0, x: 0 }}
    exit={{ opacity: 0, y: -20, x: 20 }}
    transition={{ type: "spring", damping: 20, stiffness: 300 }}
  >
    <CheckCircle className="w-5 h-5" />
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

export default function OrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart, cartTotal, cartItemCount } = useCart();

  // Backend products
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // UI state
  const [activeSection, setActiveSection] = useState<"commercial" | "custom">(
    "commercial"
  );

  // ✅ ONLY SORT: price-high / price-low
  const [sortBy, setSortBy] = useState<"price-high" | "price-low">("price-high");

  // Navbar hide behavior
  const [navbarHidden, setNavbarHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  // Product modal (click card)
  const [selectedPipe, setSelectedPipe] = useState<ApiProduct | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Custom pipe builder (kept minimal)
  const [selectedHead, setSelectedHead] = useState<any>(null);
  const [selectedRing, setSelectedRing] = useState<any>(null);
  const [selectedTail, setSelectedTail] = useState<any>(null);
  const [customPipeName, setCustomPipeName] = useState("");
  const [buildStep, setBuildStep] = useState(1);

  /** ---------- EFFECTS ---------- */
  useEffect(() => {
    const onScroll = throttle(() => {
      const current = window.scrollY;
      const showNavbarNow = current < lastScrollYRef.current || current < 10;
      setNavbarHidden(!showNavbarNow);
      lastScrollYRef.current = current;
    }, 120);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ Fetch products (backend response: { success, count, data })
  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const base = String(api?.defaults?.baseURL || "").replace(/\/+$/, "");
        const usesApiPrefix = /\/api$/i.test(base);
        const endpoint = usesApiPrefix ? "/products" : "/api/products";

        const res = await api.get<ProductsApiResponse>(endpoint);
        if (!mounted) return;

        if (!res.data?.success) {
          throw new Error(res.data?.message || "Products API failed");
        }

        const rawList: DbProduct[] = Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        const mapped: ApiProduct[] = (rawList ?? [])
          .filter((p) => {
            const active = p?.is_active;
            return active === null || active === undefined
              ? true
              : Number(active) === 1;
          })
          .map((p) => {
            const currency = (p.currency || "EUR").toString().toUpperCase();
            const price = Number(p.price ?? 0);

            return {
              id: p.id,
              sku: String(p.sku ?? ""),
              name: p.name,
              description: p.description ?? "",
              price: Number.isFinite(price) ? price : 0,
              currency,
              image: resolveImageUrl(p.primary_photo),
            };
          });

        setProducts(mapped);
      } catch (e: any) {
        setLoadError(e?.message || t("orders.errors.loadFailed"));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, [t]);

  // Toast
  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      const id = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(id);
    },
    []
  );

  /** ---------- SORT ONLY ---------- */
  const sortedPipes = useMemo(() => {
    const arr = products.slice();
    if (sortBy === "price-high") {
      arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else {
      arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    }
    return arr;
  }, [products, sortBy]);

  /** ---------- MODAL ---------- */
  const openProduct = useCallback((pipe: ApiProduct) => setSelectedPipe(pipe), []);
  const closeProduct = useCallback(() => setSelectedPipe(null), []);

  /** ---------- CART ---------- */
  const addCommercialToCart = useCallback(
    (pipe: ApiProduct) => {
      addToCart({
        id: pipe.id,
        type: "commercial",
        name: pipe.name,
        price: Number(pipe.price ?? 0),
        currency: pipe.currency ?? "EUR",
        image: pipe.image,
        sku: pipe.sku,
        quantity: 1,
      } as any);

      showToast(t("orders.toasts.added"));
    },
    [addToCart, showToast, t]
  );

  /** ---------- CUSTOM PIPE ---------- */
  const getCustomPipeTotal = useCallback(() => {
    return (
      (selectedHead?.price || 0) +
      (selectedRing?.price || 0) +
      (selectedTail?.price || 0)
    );
  }, [selectedHead, selectedRing, selectedTail]);

  const resetCustomPipe = useCallback(() => {
    setSelectedHead(null);
    setSelectedRing(null);
    setSelectedTail(null);
    setCustomPipeName("");
    setBuildStep(1);
    showToast(t("orders.toasts.reset"));
  }, [showToast, t]);

  const addCustomPipeToCart = useCallback(() => {
    if (!selectedHead || !selectedRing || !selectedTail || !customPipeName.trim()) {
      showToast(t("orders.toasts.completeDesign"), "error");
      return;
    }

    addToCart({
      id: `custom-${Date.now()}`,
      type: "custom",
      name: customPipeName || t("orders.custom.defaultName"),
      price: getCustomPipeTotal(),
      quantity: 1,
      image: selectedHead.image,
      currency: "EUR",
      head: selectedHead,
      ring: selectedRing,
      tail: selectedTail,
    } as any);

    showToast(t("orders.toasts.customAdded"));
  }, [
    selectedHead,
    selectedRing,
    selectedTail,
    customPipeName,
    getCustomPipeTotal,
    addToCart,
    showToast,
    t,
  ]);

  return (
    <>
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Cart button */}
      <button
        onClick={() => navigate("/cart")}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-xl bg-gradient-to-r from-[#c9a36a] to-[#d4b173] text-black font-semibold hover:opacity-90 transition"
        aria-label="View Cart"
      >
        <ShoppingCart className="w-4 h-4" />
        <span>
          {cartItemCount} – {fmtMoney(cartTotal, "EUR")}
        </span>
      </button>

      {/* Product Photo Modal */}
      <AnimatePresence>
        {selectedPipe && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProduct}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            <motion.div
              className="relative z-10 w-full max-w-4xl rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0f0b07] to-[#1a120b] shadow-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: "spring", damping: 22, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeProduct}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 hover:bg-black/75 border border-white/10"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="w-full aspect-[4/3] bg-black">
                <img
                  src={selectedPipe.image}
                  alt={selectedPipe.name}
                  className="w-full h-full object-contain"
                  loading="eager"
                />
              </div>

              <div className="p-4 sm:p-6 border-t border-white/10 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lg sm:text-xl font-bold text-white line-clamp-1">
                    {selectedPipe.name}
                  </div>
                  <div className="text-sm text-stone-400 line-clamp-2">
                    {selectedPipe.description || ""}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <div className="text-lg sm:text-2xl font-bold text-[#c9a36a]">
                    {fmtMoney(Number(selectedPipe.price ?? 0), selectedPipe.currency)}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addCommercialToCart(selectedPipe)}
                    className="px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-[#c9a36a] to-[#d4b173] hover:from-[#d4b173] hover:to-[#e5c584] text-black shadow-[#c9a36a]/25"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm">{t("orders.actions.addToCart")}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative min-h-screen pt-20 sm:pt-28 pb-24 flex overflow-auto bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')] bg-cover bg-center text-white font-serif">
        <div className="absolute inset-0 bg-black/70 z-0" />

        <motion.div
          className="relative z-20 flex-1 px-3 sm:px-6 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 drop-shadow-xl bg-gradient-to-r from-white via-[#c9a36a] to-white bg-clip-text text-transparent"
              animate={{
                textShadow: [
                  "0 0 20px rgba(201,163,106,.3)",
                  "0 0 30px rgba(201,163,106,.5)",
                  "0 0 20px rgba(201,163,106,.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {t("orders.title")}
            </motion.h1>

            <p className="text-base sm:text-lg md:text-xl text-stone-300 max-w-2xl mx-auto px-4">
              {t("orders.subtitle")}
            </p>

            {/* ✅ ONLY sort + build button */}
            <div className="mt-6 max-w-5xl mx-auto flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-center px-2">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "price-high" | "price-low")
                }
                className="w-full md:w-[320px] px-4 py-3 rounded-xl bg-black/50 border border-white/10 outline-none focus:border-[#c9a36a]/50"
              >
                <option value="price-high" className="bg-black">
                  {t("orders.sort.priceHigh")}
                </option>
                <option value="price-low" className="bg-black">
                  {t("orders.sort.priceLow")}
                </option>
              </select>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection("custom")}
                className="w-full md:w-[320px] px-5 py-3 rounded-xl font-bold shadow-lg bg-gradient-to-r from-[#c9a36a] to-[#d4b173] hover:from-[#d4b173] hover:to-[#e5c584] text-black"
              >
                {t("orders.actions.buildYourOwn")}
              </motion.button>
            </div>

            <div className="mt-3 text-sm text-stone-400">
              {t("orders.showing")}{" "}
              <span className="text-[#c9a36a] font-semibold">{sortedPipes.length}</span>{" "}
              {t("orders.products")}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeSection === "commercial" && (
              <motion.div
                key="commercial"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
                  {!loading &&
                    !loadError &&
                    sortedPipes.map((pipe, idx) => (
                      <motion.div
                        key={pipe.id}
                        className="group bg-gradient-to-br from-[#1a120b]/95 via-[#1a120b]/90 to-[#2a1d13]/95 backdrop-blur-lg border border-[#2a1d13]/50 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-[#c9a36a]/10 transition-all overflow-hidden relative cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.45 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5, borderColor: "rgba(201,163,106,.4)" }}
                        onClick={() => openProduct(pipe)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") openProduct(pipe);
                        }}
                        aria-label={`Open ${pipe.name}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#c9a36a]/0 via-[#c9a36a]/5 to-[#c9a36a]/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                        <div className="relative z-10">
                          {/* single photo only */}
                          <div className="relative overflow-hidden rounded-xl mb-4 aspect-[4/3] bg-black/30">
                            <img
                              src={pipe.image}
                              alt={pipe.name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                            />
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg sm:text-xl font-bold mb-2 line-clamp-1 group-hover:text-[#c9a36a] transition-colors">
                                {pipe.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-stone-400 mb-3 line-clamp-2 leading-relaxed">
                                {pipe.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-xl sm:text-2xl font-bold text-[#c9a36a]">
                                {fmtMoney(Number(pipe.price ?? 0), pipe.currency)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Only this button should NOT open modal */}
                        <div className="relative z-10 flex gap-3 mt-5">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              addCommercialToCart(pipe);
                            }}
                            className="flex-1 px-5 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-[#c9a36a] to-[#d4b173] hover:from-[#d4b173] hover:to-[#e5c584] text-black shadow-[#c9a36a]/25"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span className="text-sm">{t("orders.actions.addToCart")}</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                </div>

                {loading && (
                  <div className="text-center text-stone-300 py-10">
                    {t("orders.loading")}
                  </div>
                )}

                {loadError && (
                  <div className="text-center text-red-300 py-10">
                    {t("orders.errors.failedPrefix")} {loadError}
                  </div>
                )}
              </motion.div>
            )}

            {activeSection === "custom" && (
              <motion.div
                key="custom"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#1a120b]/95 to-[#2a1d13]/95 backdrop-blur-lg border border-[#c9a36a]/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="text-left">
                      <div className="text-2xl font-bold">{t("orders.custom.title")}</div>
                      <div className="text-stone-400 text-sm">
                        {t("orders.custom.subtitle")}
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveSection("commercial")}
                      className="text-sm text-[#c9a36a] hover:text-[#e5c584] transition"
                    >
                      {t("orders.actions.backToShop")}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <div className="text-sm text-stone-300 mb-2">
                        {t("orders.custom.nameLabel")}
                      </div>
                      <input
                        value={customPipeName}
                        onChange={(e) => setCustomPipeName(e.target.value)}
                        placeholder={t("orders.custom.namePlaceholder")}
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#c9a36a]/50"
                      />

                      <div className="mt-4 text-sm text-stone-400">
                        {t("orders.custom.total")}{" "}
                        <span className="text-[#c9a36a] font-bold">
                          {fmtMoney(getCustomPipeTotal(), "EUR")}
                        </span>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <motion.button
                          onClick={addCustomPipeToCart}
                          disabled={
                            !customPipeName.trim() ||
                            !selectedHead ||
                            !selectedRing ||
                            !selectedTail
                          }
                          className={`flex-1 px-5 py-3 rounded-xl font-bold shadow-lg ${
                            customPipeName.trim() &&
                            selectedHead &&
                            selectedRing &&
                            selectedTail
                              ? "bg-gradient-to-r from-[#c9a36a] to-[#d4b173] text-black"
                              : "bg-stone-700/50 text-stone-400 cursor-not-allowed"
                          }`}
                          whileHover={customPipeName.trim() ? { scale: 1.02 } : {}}
                          whileTap={customPipeName.trim() ? { scale: 0.98 } : {}}
                        >
                          {t("orders.actions.confirmAdd")}
                        </motion.button>

                        <button
                          onClick={resetCustomPipe}
                          className="px-5 py-3 rounded-xl border border-white/10 bg-black/30 text-stone-200 hover:bg-black/40 transition"
                        >
                          {t("orders.actions.reset")}
                        </button>
                      </div>

                      <button
                        onClick={() => navigate("/cart")}
                        className="inline-flex items-center justify-center gap-2 mt-4 text-sm text-[#c9a36a] hover:text-[#e5c584] transition"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {t("orders.actions.viewCart")}
                      </button>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <div className="text-sm text-stone-300 mb-2">
                        {t("orders.custom.noteTitle")}
                      </div>
                      <div className="text-sm text-stone-400 leading-relaxed">
                        {t("orders.custom.noteBody")}
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3">
                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                          <div className="text-xs text-stone-400 mb-1">
                            {t("orders.custom.parts.head")}
                          </div>
                          <div className="text-sm text-stone-200">
                            {selectedHead?.name || "—"}
                          </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                          <div className="text-xs text-stone-400 mb-1">
                            {t("orders.custom.parts.ring")}
                          </div>
                          <div className="text-sm text-stone-200">
                            {selectedRing?.name || "—"}
                          </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                          <div className="text-xs text-stone-400 mb-1">
                            {t("orders.custom.parts.tail")}
                          </div>
                          <div className="text-sm text-stone-200">
                            {selectedTail?.name || "—"}
                          </div>
                        </div>
                      </div>

                      {/* you can wire real selectors later */}
                      <div className="mt-4 text-xs text-stone-500">
                        {t("orders.custom.todo")}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </>
  );
}