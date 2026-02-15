import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { api } from "@/lib/api"; // ✅ use droplet-aware axios instance

const safeNum = (v: number | string | undefined) => Number(v ?? 0) || 0;

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalPrice = useMemo(
    () => cart.reduce((acc, item) => acc + safeNum(item.price) * safeNum(item.quantity), 0),
    [cart]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      setErrorMsg("Please fill in all required fields.");
      return false;
    }
    const emailOK = /\S+@\S+\.\S+/.test(formData.email);
    if (!emailOK) {
      setErrorMsg("Please enter a valid email address.");
      return false;
    }
    if (formData.phone.replace(/\D/g, "").length < 7) {
      setErrorMsg("Please enter a valid phone number.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validate()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMsg("You must be logged in to place an order.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
        items: cart.map((item) => ({
          product_id: item.id,
          product_type: item.type,
          name: item.name,
          color: item.color ?? null,
          quantity: safeNum(item.quantity),
          price: safeNum(item.price),
          line_total: safeNum(item.price) * safeNum(item.quantity),
          head_id: item.type === "custom" ? item.head?.id ?? null : null,
          ring_id: item.type === "custom" ? item.ring?.id ?? null : null,
          tail_id: item.type === "custom" ? item.tail?.id ?? null : null,
        })),
        total_price: totalPrice,
      };

      // ✅ POST to droplet API (base URL from VITE_API_BASE_URL)
      const { data } = await api.post("/api/orders", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orderId: string | number | undefined = data?.order?.id ?? data?.id ?? null;

      clearCart();
      navigate("/payment", {
        state: {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          total: totalPrice,
          orderId,
        },
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : "") ||
        err?.message ||
        "Error placing order.";
      setErrorMsg(msg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="relative min-h-screen w-full bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')] bg-cover bg-center text-white font-serif flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center space-y-6">
          <h1 className="text-3xl font-bold">🛒 Your cart is empty.</h1>
          <button
            onClick={() => navigate("/orders")}
            className="bg-[#c9a36a] hover:bg-[#b68d58] text-[#1a120b] px-6 py-3 rounded-full font-semibold shadow-lg transition"
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')] bg-cover bg-center text-white font-serif">
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 pt-28 pb-16 px-4 sm:px-6 md:px-10 max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-10 text-[#c9a36a] drop-shadow-xl">
          🧾 Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#1a120b]/95 to-[#2a1d13]/95 border border-[#c9a36a]/20 rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-white">Order Summary</h2>
              <ul className="divide-y divide-stone-700/60 text-stone-300 text-base">
                {cart.map((item) => (
                  <li key={`${item.id}-${item.type}-${item.color ?? ""}`} className="py-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover border border-stone-700/60"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-stone-800/60 border border-stone-700/60" />
                      )}
                      <div>
                        <div className="font-semibold text-white leading-tight">{item.name}</div>
                        <div className="text-xs text-stone-400 mt-0.5">
                          {item.type === "custom" ? "Custom" : "Commercial"}
                          {item.color ? ` · ${item.color}` : ""}
                        </div>
                        {item.type === "custom" && (
                          <div className="text-xs text-stone-500 mt-1">
                            {item.head?.name ?? "Head"} · {item.ring?.name ?? "Ring"} · {item.tail?.name ?? "Tail"}
                          </div>
                        )}
                        <div className="text-xs text-stone-500 mt-1">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#c9a36a] font-semibold">
                        ${(safeNum(item.price) * safeNum(item.quantity)).toFixed(2)}
                      </div>
                      {item.originalPrice && safeNum(item.originalPrice) > safeNum(item.price) && (
                        <div className="text-xs text-stone-500 line-through">
                          ${(safeNum(item.originalPrice) * safeNum(item.quantity)).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 text-right text-xl font-bold text-white">
                Total: <span className="text-[#c9a36a]">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-gradient-to-br from-[#1a120b]/95 to-[#2a1d13]/95 border border-[#c9a36a]/20 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
            >
              {errorMsg && (
                <div className="rounded-lg border border-red-700/40 bg-red-900/30 px-4 py-3 text-red-200">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block mb-2 font-semibold text-[#c9a36a]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="w-full px-4 py-2 rounded-md bg-[#1e130a] border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-[#c9a36a]"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block mb-2 font-semibold text-[#c9a36a]">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="w-full px-4 py-2 rounded-md bg-[#1e130a] border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-[#c9a36a]"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block mb-2 font-semibold text-[#c9a36a]">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    className="w-full px-4 py-2 rounded-md bg-[#1e130a] border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-[#c9a36a]"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="md:col-span-1">
                  <label htmlFor="address" className="block mb-2 font-semibold text-[#c9a36a]">
                    Shipping Address
                  </label>
                  <textarea
                    name="address"
                    id="address"
                    rows={3}
                    className="w-full px-4 py-2 rounded-md bg-[#1e130a] border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-[#c9a36a]"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block mb-2 font-semibold text-[#c9a36a]">
                  Order Notes (optional)
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  className="w-full px-4 py-2 rounded-md bg-[#1e130a] border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-[#c9a36a]"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#c9a36a] to-[#d4b173] hover:from-[#d4b173] hover:to-[#e5c584] text-[#1a120b] px-6 py-3 rounded-xl font-extrabold shadow-lg transition disabled:opacity-70"
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
