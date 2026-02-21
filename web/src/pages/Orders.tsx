import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Star,
  Eye,
  Plus,
  RotateCcw,
  Search,
  Filter,
  Heart,
  X,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
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
  currency: string | null; // e.g. "EUR"
  primary_photo: string | null; // e.g. "photos/3273001.png"
  type_id: number | null;
  subtype_id: number | null;
  is_active: number | boolean | null; // 1/0
  created_at?: string;
  updated_at?: string;
};

type ApiProduct = {
  id: string | number;
  sku?: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;

  originalPrice?: number | null;
  image?: string;

  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  featured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;

  category?: string;
  tags?: string[];
  specs?: Record<string, any>;
};

const categoriesList = ["All", "Wood", "Metal", "Hybrid", "Luxury"];
const sortOptions = [
  { value: "featured", label: "Featured First", icon: Star },
  { value: "price-low", label: "Price: Low to High", icon: ArrowUp },
  { value: "price-high", label: "Price: High to Low", icon: ArrowDown },
  { value: "rating", label: "Highest Rated", icon: Award },
  { value: "newest", label: "Newest First", icon: Sparkles },
  { value: "bestseller", label: "Best Sellers", icon: TrendingUp }
];

/** Simple throttle */
const throttle = (fn: (...args: any[]) => void, wait = 100) => {
  let last = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - last >= wait) {
      last = now; fn(...args);
    }
  };
};

// ✅ Build absolute image URL from DB values like "photos/3273001.png"
function getApiOrigin(): string {
  // Prefer axios baseURL if set, otherwise environment, otherwise current origin
  const base =
    (api?.defaults?.baseURL || (import.meta as any)?.env?.VITE_API_URL || "").toString().trim();

  if (!base) return window.location.origin;

  // If base is ".../api" strip it, because images usually live at "/" not "/api"
  const noTrailing = base.replace(/\/+$/, "");
  const stripped = noTrailing.replace(/\/api$/i, "");
  return stripped || window.location.origin;
}

function resolveImageUrl(primary_photo?: string | null): string {
  const fallback =
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop";

  if (!primary_photo) return fallback;

  const raw = String(primary_photo).trim();
  if (!raw) return fallback;

  // already absolute
  if (/^https?:\/\//i.test(raw)) return raw;

  const origin = getApiOrigin();
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${origin}${path}`;
}

// ✅ currency-aware display (uses product.currency)
function fmtMoney(amount: number, currency?: string) {
  const c = (currency || "EUR").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(amount);
  } catch {
    // if currency invalid
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

export default function EnhancedOrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart, cartTotal, cartItemCount } = useCart();

  // Backend products
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // UI state
  const [activeSection, setActiveSection] = useState<"commercial" | "custom">("commercial");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [favorites, setFavorites] = useState<(string | number)[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [navbarHidden, setNavbarHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPipe, setSelectedPipe] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Custom pipe builder (kept local; hook up to backend later if needed)
  const [selectedHead, setSelectedHead] = useState<any>(null);
  const [selectedRing, setSelectedRing] = useState<any>(null);
  const [selectedTail, setSelectedTail] = useState<any>(null);
  const [customPipeName, setCustomPipeName] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [buildStep, setBuildStep] = useState(1);

  /** ---------- EFFECTS ---------- */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const onScroll = throttle(() => {
      const current = window.scrollY;
      const showNavbar = current < lastScrollY || current < 10;
      setNavbarHidden(!showNavbar);
      setLastScrollY(current);
    }, 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

  // ✅ Fetch products from droplet: GET /api/products
  useEffect(() => {
    let mounted = true;

    const typeIdToCategory: Record<number, string> = {
      1: "Wood",
      2: "Metal",
      3: "Hybrid",
      4: "Luxury",
    };

    (async () => {
      try {
        setLoading(true);

        const res = await api.get<DbProduct[] | { data: DbProduct[] }>("/api/products");

        if (!mounted) return;

        // handle both direct array or {data:[...]}
        const rawList: DbProduct[] = Array.isArray((res as any).data)
          ? (res as any).data
          : ((res as any).data?.data ?? []);

        const mapped: ApiProduct[] = (rawList ?? [])
          .filter((p) => {
            const active = p?.is_active;
            return active === null || active === undefined ? true : Number(active) === 1;
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

              // frontend-only extras
              image: resolveImageUrl(p.primary_photo),
              rating: 4.5,
              reviewCount: 0,
              inStock: true, // if you add stock in DB later, map it here
              featured: false,
              isNew: false,
              isBestseller: false,
              category: typeIdToCategory[Number(p.type_id)] || "Wood",
              tags: [], // later you can build tags from type/subtype names
              specs: {
                type_id: p.type_id,
                subtype_id: p.subtype_id,
              },
            };
          });

        setProducts(mapped);
        setLoadError(null);
      } catch (e: any) {
        setLoadError(e?.message || "Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Toast
  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    const id = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(id);
  }, []);

  /** ---------- DERIVED ---------- */
  const filteredAndSortedPipes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let filtered = products
      .filter((p) => selectedCategory === "All" || p.category === selectedCategory)
      .filter((p) => {
        if (!term) return true;
        const tags = (p.tags ?? []).map((t) => t.toLowerCase());

        // ✅ include SKU in search
        return (
          p.name.toLowerCase().includes(term) ||
          (p.sku ?? "").toLowerCase().includes(term) ||
          (p.description ?? "").toLowerCase().includes(term) ||
          tags.some((tag) => tag.includes(term))
        );
      });

    const arr = filtered.slice();
    switch (sortBy) {
      case "price-low": arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0)); break;
      case "price-high": arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0)); break;
      case "rating": arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case "newest": arr.sort((a, b) => Number(b.isNew) - Number(a.isNew)); break;
      case "bestseller": arr.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller)); break;
      case "featured":
      default: arr.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return arr;
  }, [products, selectedCategory, searchTerm, sortBy]);

  /** ---------- FAVORITES / RECENT ---------- */
  const toggleFavorite = useCallback((pipeId: string | number) => {
    setFavorites((prev) => {
      const adding = !prev.includes(pipeId);
      const pipe = products.find((p) => p.id === pipeId);
      if (pipe) showToast(adding ? `${pipe.name} added to favorites!` : `${pipe.name} removed from favorites`);
      return adding ? [...prev, pipeId] : prev.filter((id) => id !== pipeId);
    });
  }, [products, showToast]);

  const addToRecentlyViewed = useCallback((pipe: any) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== pipe.id);
      return [pipe, ...filtered].slice(0, 5);
    });
  }, []);

  /** ---------- CUSTOM PIPE ---------- */
  const getCustomPipeTotal = useCallback(() => {
    return (selectedHead?.price || 0) + (selectedRing?.price || 0) + (selectedTail?.price || 0);
  }, [selectedHead, selectedRing, selectedTail]);

  const addCustomPipeToCart = useCallback(() => {
    if (!selectedHead || !selectedRing || !selectedTail || !customPipeName.trim()) {
      showToast("Please complete your design before adding to cart!", "error");
      return;
    }
    const customPipe = {
      id: `custom-${Date.now()}`,
      type: "custom" as const,
      name: customPipeName || "Custom Pipe",
      head: selectedHead,
      ring: selectedRing,
      tail: selectedTail,
      price: getCustomPipeTotal(),
      quantity: 1,
      image: selectedHead.image,
      currency: "EUR",
    };
    addToCart(customPipe);
    showToast("Custom pipe added to cart! 🎉");
  }, [selectedHead, selectedRing, selectedTail, customPipeName, getCustomPipeTotal, addToCart, showToast]);

  const resetCustomPipe = useCallback(() => {
    setSelectedHead(null);
    setSelectedRing(null);
    setSelectedTail(null);
    setCustomPipeName("");
    setBuildStep(1);
    showToast("Custom pipe design reset!");
  }, [showToast]);

  const nextStep = useCallback(() => setBuildStep((s) => Math.min(3, s + 1)), []);
  const prevStep = useCallback(() => setBuildStep((s) => Math.max(1, s - 1)), []);

  const handlePipeSelect = useCallback((pipe: any) => {
    setSelectedPipe(pipe);
    addToRecentlyViewed(pipe);
  }, [addToRecentlyViewed]);

  /** ---------- UI ---------- */
  return (
    <>
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        setIsSidebarExpanded={setIsSidebarExpanded}
        navbarHidden={navbarHidden}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categoriesList={categoriesList}
        setCurrentPage={() => {}}
        activeSection={activeSection}
        setActiveSection={setActiveSection as any}
        selectedHead={selectedHead}
        selectedRing={selectedRing}
        selectedTail={selectedTail}
        getCustomPipeTotal={getCustomPipeTotal}
        resetCustomPipe={resetCustomPipe}
        isMobile={isMobile}
      />

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Cart */}
      <button
        onClick={() => navigate("/cart")}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-xl bg-gradient-to-r from-[#c9a36a] to-[#d4b173] text-black font-semibold hover:opacity-90 transition"
        aria-label="View Cart"
      >
        <ShoppingCart className="w-4 h-4" />
        <span>{cartItemCount} – {fmtMoney(cartTotal, "EUR")}</span>
      </button>

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
              Premium Tobacco Pipes ✨
            </motion.h1>
            <p className="text-base sm:text-lg md:text-xl text-stone-300 max-w-2xl mx-auto px-4">
              Discover our exquisite collection of handcrafted pipes and create your perfect custom piece
            </p>
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
                {/* ... keep ALL your existing Search/Filters UI ... */}

                {/* Products grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
                  {!loading && !loadError && filteredAndSortedPipes.map((pipe, idx) => (
                    <motion.div
                      key={pipe.id}
                      className="group bg-gradient-to-br from-[#1a120b]/95 via-[#1a120b]/90 to-[#2a1d13]/95 backdrop-blur-lg border border-[#2a1d13]/50 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-[#c9a36a]/10 transition-all overflow-hidden relative"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06, duration: 0.5 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5, borderColor: "rgba(201,163,106,.4)" }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#c9a36a]/0 via-[#c9a36a]/5 to-[#c9a36a]/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                      <div className="relative z-10">
                        <div className="relative overflow-hidden rounded-xl mb-4">
                          <img
                            src={pipe.image}
                            alt={pipe.name}
                            className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs border border-white/10">
                            SKU: <span className="text-[#c9a36a] font-semibold">{pipe.sku || "—"}</span>
                          </div>

                          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                            <motion.button
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(pipe.id); }}
                              className="bg-black/70 backdrop-blur-sm p-2 rounded-full hover:bg-black/80"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              aria-label="Toggle favorite"
                            >
                              <Heart
                                className={`w-4 h-4 ${favorites.includes(pipe.id) ? "text-red-500 fill-current" : "text-white"}`}
                              />
                            </motion.button>

                            <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs font-medium">{pipe.rating ?? 4.5}</span>
                              <span className="text-xs text-stone-400">({pipe.reviewCount ?? 0})</span>
                            </div>
                          </div>

                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <motion.button
                              onClick={() => handlePipeSelect(pipe)}
                              className="bg-[#c9a36a] hover:bg-[#d4b173] text-black px-5 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Eye className="w-4 h-4" />
                              Quick View
                            </motion.button>
                          </div>
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
                            <div className="flex items-center gap-2">
                              <span className="text-xl sm:text-2xl font-bold text-[#c9a36a]">
                                {fmtMoney(Number(pipe.price ?? 0), pipe.currency)}
                              </span>
                              {pipe.originalPrice && (
                                <span className="text-sm text-stone-500 line-through">
                                  {fmtMoney(Number(pipe.originalPrice), pipe.currency)}
                                </span>
                              )}
                            </div>

                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full ${
                                pipe.inStock
                                  ? "bg-green-800/30 text-green-300 border border-green-700/30"
                                  : "bg-red-800/30 text-red-300 border border-red-700/30"
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${pipe.inStock ? "bg-green-400" : "bg-red-400"}`} />
                              {pipe.inStock ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 flex gap-3 mt-5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => addToCart({ ...pipe, type: "commercial" })}
                          disabled={!pipe.inStock}
                          className={`flex-1 px-5 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg ${
                            pipe.inStock
                              ? "bg-gradient-to-r from-[#c9a36a] to-[#d4b173] hover:from-[#d4b173] hover:to-[#e5c584] text-black shadow-[#c9a36a]/25"
                              : "bg-stone-700/50 text-stone-400 cursor-not-allowed"
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span className="text-sm">{pipe.inStock ? "Add to Cart" : "Sold Out"}</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePipeSelect(pipe)}
                          className="bg-gradient-to-r from-stone-800/80 to-stone-700/80 hover:from-stone-700/80 hover:to-stone-600/80 px-5 py-3.5 rounded-xl border border-[#c9a36a]/20 hover:border-[#c9a36a]/40 shadow-lg"
                        >
                          <Eye className="w-4 h-4 text-[#c9a36a]" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {loadError && (
                  <div className="text-center text-red-300 py-10">
                    Failed to load products: {loadError}
                  </div>
                )}
              </motion.div>
            )}

            {/* CUSTOM BUILDER stays as you had it */}
            {activeSection === "custom" && (
              <motion.div
                key="custom"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#1a120b]/95 to-[#2a1d13]/95 backdrop-blur-lg border border-[#c9a36a]/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
                  <div className="text-center mt-6">
                    <motion.button
                      onClick={addCustomPipeToCart}
                      disabled={!customPipeName.trim() || !selectedHead || !selectedRing || !selectedTail}
                      className={`px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl ${
                        customPipeName.trim() && selectedHead && selectedRing && selectedTail
                          ? "bg-gradient-to-r from-[#c9a36a] to-[#d4b173] text-black"
                          : "bg-stone-700/50 text-stone-400 cursor-not-allowed"
                      }`}
                      whileHover={customPipeName.trim() ? { scale: 1.02 } : {}}
                      whileTap={customPipeName.trim() ? { scale: 0.98 } : {}}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Confirm & Add to Cart
                    </motion.button>

                    <button
                      onClick={() => navigate("/cart")}
                      className="inline-flex items-center justify-center gap-2 mt-4 text-sm text-[#c9a36a] hover:text-[#e5c584] transition"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      View Cart
                    </button>
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