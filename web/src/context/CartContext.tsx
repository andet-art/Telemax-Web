import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
  useEffect,
} from "react";

export interface CartItem {
  id: string | number;
  name: string;
  price: number | string;
  originalPrice?: number | string;
  quantity: number;
  image: string;
  type: "commercial" | "custom";
  color?: string;

  // For commercial pipes
  category?: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  inStock?: boolean;
  featured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  tags?: string[];
  specs?: {
    weight: string;
    length: string;
    bowlDepth: string;
    material: string;
  };

  // For custom pipes
  head?: {
    id: number;
    name: string;
    material: string;
    price: number;
    image: string;
    description: string;
    features: string[];
  };
  ring?: {
    id: number;
    name: string;
    material: string;
    price: number;
    image: string;
    description: string;
    features: string[];
  };
  tail?: {
    id: number;
    name: string;
    material: string;
    price: number;
    image: string;
    description: string;
    features: string[];
  };
}

interface CartContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  clearCart: () => void;
  removeItem: (id: string | number, type?: string) => void;
  updateQuantity: (id: string | number, quantity: number, type?: string) => void;
  updateColor: (id: string | number, color: string, type?: string) => void;
  cartTotal: number;
  cartItemCount: number;
  cartSavings: number;

  // Save/Load helpers
  saveCartForLater: () => boolean;
  loadSavedCart: () => boolean;
  hasSavedCart: () => boolean;
  clearSavedCart: () => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const availableColors = ["Natural", "Dark Walnut", "Ebony", "Mahogany"];

// ---------- utils ----------

// SSR-safe localStorage getter
const getLS = () => (typeof window === "undefined" ? null : window.localStorage);

// Small helper to coerce numbers safely
const safeNum = (v: number | string | undefined) => Number(v ?? 0) || 0;

// Narrowing guard for items coming back from storage
const isCartItem = (x: any): x is CartItem =>
  x &&
  (typeof x.id === "string" || typeof x.id === "number") &&
  typeof x.name === "string" &&
  (typeof x.price === "number" || typeof x.price === "string") &&
  (x.type === "commercial" || x.type === "custom");

// ---------- provider ----------

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Load once from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const ls = getLS();
      const saved = ls?.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist on change
  useEffect(() => {
    try {
      const ls = getLS();
      ls?.setItem("cart", JSON.stringify(cart));
      // Optional: notify other tabs/pages
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart-updated"));
      }
    } catch {}
  }, [cart]);

  // Add item to cart (color-aware merging)
  const addToCart = useCallback((item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setCart((prev) => {
      const desiredColor = item.color || availableColors[0];

      const existing = prev.find(
        (ci) => ci.id === item.id && ci.type === item.type && (ci.color || availableColors[0]) === desiredColor
      );

      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id && ci.type === item.type && (ci.color || availableColors[0]) === desiredColor
            ? { ...ci, quantity: safeNum(ci.quantity) + Math.max(1, safeNum(quantity)) }
            : ci
        );
      }

      return [
        ...prev,
        {
          ...item,
          quantity: Math.max(1, safeNum(quantity)),
          color: desiredColor,
        },
      ];
    });
  }, []);

  // Remove item from cart
  const removeItem = useCallback((id: string | number, type?: string) => {
    setCart((prev) =>
      prev.filter((item) => (type ? !(item.id === id && item.type === type) : item.id !== id))
    );
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => setCart([]), []);

  // Update item quantity
  const updateQuantity = useCallback(
    (id: string | number, quantity: number, type?: string) => {
      if (quantity < 1) {
        removeItem(id, type);
        return;
      }
      setCart((prev) =>
        prev.map((item) =>
          type
            ? item.id === id && item.type === type
              ? { ...item, quantity: Math.max(1, safeNum(quantity)) }
              : item
            : item.id === id
            ? { ...item, quantity: Math.max(1, safeNum(quantity)) }
            : item
        )
      );
    },
    [removeItem]
  );

  // Update item color
  const updateColor = useCallback((id: string | number, color: string, type?: string) => {
    setCart((prev) =>
      prev.map((item) =>
        type
          ? item.id === id && item.type === type
            ? { ...item, color }
            : item
          : item.id === id
          ? { ...item, color }
          : item
      )
    );
  }, []);

  // Totals
  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + safeNum(item.price) * safeNum(item.quantity), 0),
    [cart]
  );

  const cartItemCount = useMemo(
    () => cart.reduce((acc, item) => acc + safeNum(item.quantity), 0),
    [cart]
  );

  const cartSavings = useMemo(
    () =>
      cart.reduce((acc, item) => {
        const orig = safeNum(item.originalPrice);
        const price = safeNum(item.price);
        return orig > price ? acc + (orig - price) * safeNum(item.quantity) : acc;
      }, 0),
    [cart]
  );

  // Save/Load helpers
  const saveCartForLater = useCallback((): boolean => {
    try {
      const ls = getLS();
      ls?.setItem("savedCart", JSON.stringify(cart));
      return true;
    } catch {
      return false;
    }
  }, [cart]);

  const loadSavedCart = useCallback((): boolean => {
    try {
      const ls = getLS();
      const saved = ls?.getItem("savedCart");
      if (!saved) return false;

      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every(isCartItem)) return false;

      setCart(parsed);
      return true;
    } catch {
      return false;
    }
  }, []);

  const hasSavedCart = useCallback((): boolean => {
    try {
      const ls = getLS();
      const saved = ls?.getItem("savedCart");
      if (!saved) return false;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 && parsed.every(isCartItem);
    } catch {
      return false;
    }
  }, []);

  const clearSavedCart = useCallback((): boolean => {
    try {
      const ls = getLS();
      ls?.removeItem("savedCart");
      return true;
    } catch {
      return false;
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      cart,
      setCart,
      addToCart,
      removeItem,
      clearCart,
      updateQuantity,
      updateColor,
      cartTotal,
      cartItemCount,
      cartSavings,
      saveCartForLater,
      loadSavedCart,
      hasSavedCart,
      clearSavedCart,
    }),
    [
      cart,
      addToCart,
      removeItem,
      clearCart,
      updateQuantity,
      updateColor,
      cartTotal,
      cartItemCount,
      cartSavings,
      saveCartForLater,
      loadSavedCart,
      hasSavedCart,
      clearSavedCart,
    ]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
