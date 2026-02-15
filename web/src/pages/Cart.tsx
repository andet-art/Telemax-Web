import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Minus,
  Plus,
  X,
  Star,
  Package,
  CreditCard,
  ArrowLeft,
  ShoppingBag,
  Gift,
  Info,
  Sparkles,
  Crown,
  CheckCircle,
  Trash2,
  Save,
  RotateCcw,
  LogIn,
} from "lucide-react";
import { useCart, availableColors, CartItem } from "../context/CartContext";
import { api } from "@/lib/api"; // 🔗 use droplet API

const colorSwatches: Record<string, string> = {
  Natural: "#D2B48C",
  "Dark Walnut": "#5C3A21",
  Ebony: "#2B2B2B",
  Mahogany: "#7B3F00",
};

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

const Cart = () => {
  const {
    cart,
    removeItem,
    clearCart,
    updateQuantity,
    updateColor,
    cartTotal,
    cartItemCount,
    cartSavings,
    saveCartForLater: ctxSaveCartForLater,
    loadSavedCart: ctxLoadSavedCart,
  } = useCart();

  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const isLoggedIn = useMemo(() => !!localStorage.getItem("token"), []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveCartForLater = () => {
    ctxSaveCartForLater();
    showToast("Your cart has been saved for later! 💾");
  };

  const loadSavedCart = () => {
    const ok = ctxLoadSavedCart();
    showToast(ok ? "Saved cart loaded!" : "No saved cart found", ok ? "success" : "error");
  };

  const handleRemoveItem = (item: CartItem) => {
    if (window.confirm(`Remove ${item.name} from your cart?`)) {
      removeItem(item.id, item.type);
      showToast(`${item.name} removed from cart`);
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Clear entire cart?")) {
      clearCart();
      showToast("Cart cleared successfully");
    }
  };

  const handleProceedToCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please log in to proceed to checkout.", "error");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    // 🔎 quick API health ping (uses droplet base URL)
    try {
      await api.get("/api/health");
    } catch {
      showToast("API is unreachable. Please try again.", "error");
      return;
    }

    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <>
        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>

        <main className="relative min-h-screen pt-20 sm:pt-28 pb-24 flex flex-col items-center justify-center bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')] bg-cover bg-center text-white font-serif px-4">
          <div className="absolute inset-0 bg-black/70 z-0" />
          <motion.div
            className="relative z-10 text-center max-w-lg mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="text-6xl sm:text-8xl mb-6"
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🛒
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-[#c9a36a] drop-shadow-lg">Your Cart is Empty</h1>
            <p className="text-lg text-stone-300 mb-8 leading-relaxed">
              Discover our exquisite collection of handcrafted pipes and create your perfect custom piece
            </p>
            <div className="space-y-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/orders"
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#c9a36a] to-[#d4b173] hover:from-[#d4b173] hover:to-[#e5c584] px-8 py-4 rounded-xl text-black font-bold transition-all duration-300 shadow-lg shadow-[#c9a36a]/25"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Continue Shopping
                </Link>
              </motion.div>

              <motion.button
                onClick={loadSavedCart}
                className="text-stone-400 hover:text-[#c9a36a] transition-colors underline"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Load Saved Cart
              </motion.button>
            </div>
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <main className="relative min-h-screen pt-20 sm:pt-28 pb-24 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')] bg-cover bg-center text-white font-serif">
        <div className="absolute inset-0 bg-black/70 z-0" />

        <div className="relative z-10 px-4 sm:px-6 max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-[#c9a36a] to-white bg-clip-text text-transparent"
              animate={{
                textShadow: [
                  "0 0 20px rgba(201,163,106,.3)",
                  "0 0 30px rgba(201,163,106,.5)",
                  "0 0 20px rgba(201,163,106,.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🛒 Your Cart
            </motion.h1>

            <div className="text-lg text-stone-300">
              {cartItemCount} item{cartItemCount !== 1 ? "s" : ""} ready for checkout
            </div>

            <motion.div className="mt-4">
              <Link to="/orders" className="inline-flex items-center gap-2 text-[#c9a36a] hover:text-[#e5c584] transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {cart.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${item.type}`}
                    className="bg-gradient-to-br from-[#1a120b]/95 to-[#2a1d13]/95 backdrop-blur-lg border border-[#c9a36a]/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-[#c9a36a]/30 transition-all duration-500"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50, scale: 0.9 }}
                    layout
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="relative">
                        <img src={item.image} alt={item.name} className="w-full sm:w-32 h-32 object-cover rounded-xl" />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {item.featured && (
                            <span className="bg-gradient-to-r from-[#c9a36a] to-[#d4b173] text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              Featured
                            </span>
                          )}
                          {item.isNew && (
                            <span className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              New
                            </span>
                          )}
                          {item.isBestseller && (
                            <span className="bg-gradient-to-r from-orange-600 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              Best Seller
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{item.name}</h2>

                          {item.type === "commercial" && item.description && (
                            <p className="text-sm text-stone-400 mb-2 line-clamp-2">{item.description}</p>
                          )}

                          {item.type === "custom" && (
                            <div className="text-sm text-stone-400 space-y-1">
                              <div>Head: {item.head?.name}</div>
                              <div>Ring: {item.ring?.name}</div>
                              <div>Tail: {item.tail?.name}</div>
                            </div>
                          )}

                          <span
                            className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                              item.type === "custom"
                                ? "bg-purple-800/30 text-purple-300 border border-purple-700/30"
                                : "bg-blue-800/30 text-blue-300 border border-blue-700/30"
                            }`}
                          >
                            {item.type === "custom" ? "🎨 Custom Design" : "🏪 Commercial"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium text-stone-300">Color:</label>
                          <select
                            value={item.color || availableColors[0]}
                            onChange={(e) => updateColor(item.id, e.target.value, item.type)}
                            className="bg-gradient-to-r from-stone-800/80 to-stone-700/80 border border-[#c9a36a]/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c9a36a] backdrop-blur-sm"
                          >
                            {availableColors.map((color) => (
                              <option key={color} value={color} className="bg-stone-800">
                                {color}
                              </option>
                            ))}
                          </select>
                          <div
                            className="w-6 h-6 rounded-full border-2 border-stone-600"
                            style={{ backgroundColor: colorSwatches[item.color || availableColors[0]] }}
                            title={item.color}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-[#c9a36a]">
                                ${Number(item.price ?? 0).toFixed(2)}
                              </span>
                              {typeof item.originalPrice !== "undefined" && (
                                <span className="text-sm text-stone-500 line-through">
                                  ${Number(item.originalPrice ?? 0).toFixed(2)}
                                </span>
                              )}
                            </div>
                            {item.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-stone-400">
                                  {item.rating} ({item.reviewCount} reviews)
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-gradient-to-r from-stone-800/60 to-stone-700/60 rounded-lg border border-[#c9a36a]/20 p-2">
                              <motion.button
                                onClick={() => updateQuantity(item.id, Math.max(1, Number(item.quantity) - 1), item.type)}
                                className="w-8 h-8 rounded-lg bg-stone-700/50 hover:bg-stone-600/50 flex items-center justify-center transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Minus className="w-4 h-4" />
                              </motion.button>

                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => {
                                  const value = Math.max(1, parseInt(e.target.value) || 1);
                                  updateQuantity(item.id, value, item.type);
                                }}
                                className="w-12 text-center bg-transparent text-white text-sm font-medium focus:outline-none"
                              />

                              <motion.button
                                onClick={() => updateQuantity(item.id, Number(item.quantity) + 1, item.type)}
                                className="w-8 h-8 rounded-lg bg-stone-700/50 hover:bg-stone-600/50 flex items-center justify-center transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Plus className="w-4 h-4" />
                              </motion.button>
                            </div>

                            <motion.button
                              onClick={() => handleRemoveItem(item)}
                              className="w-10 h-10 rounded-lg bg-red-800/30 hover:bg-red-700/50 border border-red-700/30 flex items-center justify-center transition-all duration-300"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </motion.button>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-bold text-white">
                            Subtotal:{" "}
                            <span className="text-[#c9a36a]">
                              ${(Number(item.price ?? 0) * Number(item.quantity ?? 0)).toFixed(2)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1">
              <motion.div
                className="sticky top-24 bg-gradient-to-br from-[#1a120b]/95 to-[#2a1d13]/95 backdrop-blur-lg border border-[#c9a36a]/20 rounded-2xl p-6 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold mb-6 text-[#c9a36a] flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-stone-700/50">
                    <span className="text-stone-300">Items ({cartItemCount}):</span>
                    <span className="font-medium">${cartTotal.toFixed(2)}</span>
                  </div>

                  {cartSavings > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-stone-700/50">
                      <span className="text-green-400">You Save:</span>
                      <span className="font-medium text-green-400">-${cartSavings.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 border-b border-stone-700/50">
                    <span className="text-stone-300">Shipping:</span>
                    <span className="font-medium text-green-400">Free</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-t border-[#c9a36a]/30 pt-4">
                    <span className="text-xl font-bold">Total:</span>
                    <span className="text-2xl font-bold text-[#c9a36a]">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <motion.button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-gradient-to-r from-[#c9a36a] to-[#d4b173] hover:from-[#d4b173] hover:to-[#e5c584] text-black font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#c9a36a]/25"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CreditCard className="w-5 h-5" />
                    Proceed to Checkout
                  </motion.button>

                  {!isLoggedIn && (
                    <div className="text-xs text-stone-400 flex items-center gap-2 justify-center">
                      <LogIn className="w-3 h-3" />
                      You’ll need to <Link to="/login" state={{ from: "/checkout" }} className="underline text-[#c9a36a]">log in</Link> to complete your purchase.
                    </div>
                  )}

                  <motion.button
                    onClick={handleClearCart}
                    className="w-full bg-gradient-to-r from-red-800/60 to-red-700/60 hover:from-red-700/60 hover:to-red-600/60 text-white font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-red-700/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Cart
                  </motion.button>
                </div>

                <div className="mt-6 pt-6 border-t border-stone-700/50 space-y-2">
                  <motion.button
                    onClick={saveCartForLater}
                    className="w-full text-sm text-stone-400 hover:text-[#c9a36a] transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Save className="w-4 h-4" />
                    Save Cart for Later
                  </motion.button>

                  <motion.button
                    onClick={loadSavedCart}
                    className="w-full text-sm text-stone-400 hover:text-[#c9a36a] transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Load Saved Cart
                  </motion.button>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-700/50">
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                    <Info className="w-3 h-3" />
                    <span>Free shipping on all orders</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Gift className="w-3 h-3" />
                    <span>30-day return guarantee</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Cart;
