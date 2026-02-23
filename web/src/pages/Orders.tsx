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
  type_id?: number | null;
  typeName?: string;
};

/** catalog_types table */
type CatalogType = {
  id: number;
  name: string;
  sort_order?: number | null;
  created_at?: string;
};

/** For flexible APIs */
type GenericApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  count?: number;
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

async function tryGetFirst<T>(paths: string[]) {
  const base = String(api?.defaults?.baseURL || "").replace(/\/+$/, "");
  const usesApiPrefix = /\/api$/i.test(base);

  const normalized = paths.map((p) => {
    // if baseURL already ends with /api, calling "/api/xxx" becomes "/api/api/xxx"
    // so if usesApiPrefix, strip leading "/api" in candidates.
    if (usesApiPrefix) return p.replace(/^\/api\b/i, "");
    return p;
  });

  let lastErr: any = null;

  for (const p of normalized) {
    try {
      const res = await api.get(p);
      return res;
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr;
}

export default function OrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart, cartTotal, cartItemCount } = useCart();

  // Backend products
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ✅ Types from DB (catalog_types)
  const [types, setTypes] = useState<CatalogType[]>([]);
  const [typesError, setTypesError] = useState<string | null>(null);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All"); // holds type name
  const [sortBy, setSortBy] = useState<"price-high" | "price-low">("price-high");

  // Navbar hide behavior
  const [navbarHidden, setNavbarHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  // Photo modal
  const [selectedPipe, setSelectedPipe] = useState<ApiProduct | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Toast
  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      const id = setTimeout(() => setToast(null), 2200);
      return () => clearTimeout(id);
    },
    []
  );

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

  /** ---------- FETCH TYPES (catalog_types) ---------- */
  useEffect(() => {
    let mounted = true;

    const fetchTypes = async () => {
      try {
        setTypesError(null);

        // Try common endpoints (adjust if your backend uses a different one)
        const res = await tryGetFirst<GenericApiResponse<CatalogType[]>>([
          "/api/catalog-types",
          "/api/catalog_types",
          "/api/catalog/types",
          "/api/types",
          "/catalog-types",
          "/catalog_types",
          "/catalog/types",
          "/types",
        ]);

        if (!mounted) return;

        const body: any = res?.data;

        // Accept either:
        // 1) { success: true, data: [...] }
        // 2) { data: [...] }
        // 3) [...] (raw array)
        let list: any = Array.isArray(body) ? body : body?.data;

        if (!Array.isArray(list)) list = [];

        const cleaned: CatalogType[] = list
          .filter((x: any) => x && (x.id || x.id === 0) && x.name)
          .map((x: any) => ({
            id: Number(x.id),
            name: String(x.name),
            sort_order:
              x.sort_order === null || x.sort_order === undefined
                ? null
                : Number(x.sort_order),
            created_at: x.created_at ? String(x.created_at) : undefined,
          }))
          .sort((a, b) => {
            const ao = a.sort_order ?? 999999;
            const bo = b.sort_order ?? 999999;
            if (ao !== bo) return ao - bo;
            return a.name.localeCompare(b.name);
          });

        setTypes(cleaned);
      } catch (e: any) {
        if (!mounted) return;
        setTypesError(e?.message || "Failed to load types");
        setTypes([]); // fallback to All only
      }
    };

    fetchTypes();
    return () => {
      mounted = false;
    };
  }, []);

  /** ---------- FETCH PRODUCTS ---------- */
  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const res = await tryGetFirst<ProductsApiResponse>([
          "/api/products",
          "/products",
        ]);

        if (!mounted) return;

        const body: ProductsApiResponse = res.data;

        if (!body?.success) {
          throw new Error(body?.message || "Products API failed");
        }

        const rawList: DbProduct[] = Array.isArray(body?.data) ? body.data : [];

        const mapped: ApiProduct[] = rawList
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
              type_id: p.type_id,
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

  /** ---------- TYPE NAME LOOKUP ---------- */
  const typeIdToName = useMemo(() => {
    const map = new Map<number, string>();
    for (const tp of types) map.set(Number(tp.id), tp.name);
    return map;
  }, [types]);

  const categoriesList = useMemo(() => {
    // "All" + DB types (names)
    const names = types.map((x) => x.name);
    return ["All", ...names];
  }, [types]);

  /** ---------- FILTER + SORT (search includes name, sku, description) ---------- */
  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const normalizedType = categoriesList.includes(selectedType)
      ? selectedType
      : "All";

    const withTypeName = products.map((p) => {
      const typeName = p.type_id ? typeIdToName.get(Number(p.type_id)) : undefined;
      return { ...p, typeName: typeName || "Unknown" };
    });

    let filtered = withTypeName.filter((p) => {
      if (normalizedType === "All") return true;
      // match DB type name
      return (p.typeName || "").toLowerCase() === normalizedType.toLowerCase();
    });

    if (term) {
      filtered = filtered.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const sku = (p.sku || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        return name.includes(term) || sku.includes(term) || desc.includes(term);
      });
    }

    const arr = filtered.slice();

    if (sortBy === "price-high") arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    else arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));

    return arr;
  }, [products, searchTerm, selectedType, categoriesList, sortBy, typeIdToName]);

  /** ---------- MODAL: PHOTO ONLY ---------- */
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

      {/* ✅ PHOTO MODAL: single photo only (no info) */}
      <AnimatePresence>
        {selectedPipe && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProduct}
          >
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

            <motion.div
              className="relative z-10 w-full max-w-5xl rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative min-h-screen pt-20 sm:pt-28 pb-24 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')] bg-cover bg-center text-white font-serif">
        <div className="absolute inset-0 bg-black/70 z-0" />

        <motion.div
          className="relative z-20 px-3 sm:px-6"
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

            {/* ✅ Controls: Search + Types (from DB) + Sort (2 only) + Build button */}
            <div className="mt-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-center px-2">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("orders.searchPlaceholder")}
                className="w-full md:w-[420px] px-4 py-3 rounded-xl bg-black/50 border border-white/10 outline-none focus:border-[#c9a36a]/50"
              />

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full md:w-[260px] px-4 py-3 rounded-xl bg-black/50 border border-white/10 outline-none focus:border-[#c9a36a]/50"
              >
                {categoriesList.map((c) => (
                  <option key={c} value={c} className="bg-black">
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "price-high" | "price-low")
                }
                className="w-full md:w-[260px] px-4 py-3 rounded-xl bg-black/50 border border-white/10 outline-none focus:border-[#c9a36a]/50"
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
                onClick={() => navigate("/custom")}
                className="w-full md:w-[260px] px-5 py-3 rounded-xl font-bold shadow-lg bg-gradient-to-r from-[#c9a36a] to-[#d4b173] hover:from-[#d4b173] hover:to-[#e5c584] text-black"
              >
                {t("orders.actions.buildYourOwn")}
              </motion.button>
            </div>

            {typesError && (
              <div className="mt-3 text-xs text-red-300">
                Types failed to load: {typesError}
              </div>
            )}

            <div className="mt-3 text-sm text-stone-400">
              {t("orders.showing")}{" "}
              <span className="text-[#c9a36a] font-semibold">
                {filteredAndSorted.length}
              </span>{" "}
              {t("orders.products")}
            </div>
          </motion.div>

          {/* Grid */}
          <div className="max-w-7xl mx-auto">
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

            {!loading && !loadError && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredAndSorted.map((pipe, idx) => (
                  <motion.div
                    key={pipe.id}
                    className="group bg-gradient-to-br from-[#1a120b]/95 via-[#1a120b]/90 to-[#2a1d13]/95 backdrop-blur-lg border border-[#2a1d13]/50 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-[#c9a36a]/10 transition-all overflow-hidden relative cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.45 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5, borderColor: "rgba(201,163,106,.4)" }}
                    onClick={() => openProduct(pipe)} // ✅ click anywhere opens photo
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") openProduct(pipe);
                    }}
                    aria-label={`Open ${pipe.name}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#c9a36a]/0 via-[#c9a36a]/5 to-[#c9a36a]/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                    <div className="relative z-10">
                      {/* ✅ single photo only in image area (no sku, no like, no rating, no stock, no eye, no hover quick view) */}
                      <div className="relative overflow-hidden rounded-xl mb-4 aspect-[4/3] bg-black/30">
                        <img
                          src={pipe.image}
                          alt={pipe.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>

                      {/* Minimal info only */}
                      <div className="space-y-3">
                        <h3 className="text-lg sm:text-xl font-bold line-clamp-1 group-hover:text-[#c9a36a] transition-colors">
                          {pipe.name}
                        </h3>

                        <div className="flex items-center justify-between">
                          <span className="text-xl sm:text-2xl font-bold text-[#c9a36a]">
                            {fmtMoney(Number(pipe.price ?? 0), pipe.currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ✅ Add to cart: must NOT open photo */}
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
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}