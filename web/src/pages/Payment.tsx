import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, CreditCard, Banknote, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

type MethodId = "card" | "cash" | null;

type LocationState = {
  name: string;
  email: string;
  address: string;
  total: number;
  orderId?: string | number;
};

const fieldBase =
  "w-full px-4 py-3 rounded bg-[#2a1d13] text-white placeholder-stone-400 border border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#c9a36a]";

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = (location.state || null) as LocationState | null;

  const [selectedMethod, setSelectedMethod] = useState<MethodId>("cash");

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const totalFormatted = useMemo(
    () => (orderData ? `$${Number(orderData.total || 0).toFixed(2)}` : "$0.00"),
    [orderData]
  );

  if (!orderData || !orderData.orderId) {
    return (
      <main className="pt-32 min-h-screen bg-[#1a120b] text-white font-serif w-full flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="text-3xl font-bold text-white drop-shadow">No valid order found.</h1>
        <button
          onClick={() => navigate("/checkout")}
          className="bg-[#c9a36a] hover:bg-[#b68d58] text-[#1a120b] px-6 py-3 rounded-full font-semibold shadow-lg transition"
        >
          Back to Checkout
        </button>
      </main>
    );
  }

  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (v: string) =>
    v.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(\d{1,2})/, "$1/$2");

  const validateCard = () => {
    if (cardNumber.replace(/\s/g, "").length < 15) return "Enter a valid card number.";
    if (!cardHolder.trim()) return "Enter the cardholder name.";
    if (expiry.length < 4) return "Enter a valid expiry (MM/YY).";
    if (cvv.length < 3) return "Enter a valid CVV.";
    return null;
  };

  const handleConfirm = async () => {
    if (!selectedMethod) return alert("Please select a payment method.");

    if (selectedMethod === "card") {
      const err = validateCard();
      if (err) return alert(err);
    }

    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in.");

    setSubmitting(true);

    try {
      const last4 =
        selectedMethod === "card" ? cardNumber.replace(/\D/g, "").slice(-4) : undefined;

      await api.post(
        `/api/orders/${orderData.orderId}/pay`,
        {
          method: selectedMethod === "card" ? "card" : "cash",
          last4: last4 || undefined,
          total: orderData.total,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await new Promise((r) => setTimeout(r, 600));
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Payment failed.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const SuccessView = () => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center"
    >
      <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-6" />
      <h2 className="text-3xl font-bold mb-3">Order Confirmed</h2>
      <p className="text-stone-300 mb-6">
        Thanks, <span className="text-white font-semibold">{orderData.name}</span>! Your order{" "}
        <span className="text-[#c9a36a] font-semibold">#{orderData.orderId}</span> is being prepared.
      </p>

      <div className="bg-[#20160f] border border-stone-800 rounded-xl p-5 text-left space-y-2 mb-6">
        <div className="flex justify-between">
          <span className="text-stone-400">Total</span>
          <span className="text-[#c9a36a] font-bold">{totalFormatted}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Payment Method</span>
          <span className="capitalize text-stone-200">
            {selectedMethod === "cash" ? "Cash on Delivery" : "Card"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-400 pt-2">
          <ShieldCheck className="w-4 h-4" />
          {selectedMethod === "cash"
            ? "You’ll pay the courier when the order arrives."
            : "Your card info is not stored on our servers."}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate("/order-history")}
          className="px-6 py-3 rounded-xl font-semibold bg-[#c9a36a] text-[#1a120b] hover:bg-[#b68d58]"
        >
          View Order History
        </button>
        <button
          onClick={() => navigate("/home")}
          className="px-6 py-3 rounded-xl font-semibold border border-stone-700 hover:border-stone-500 transition"
        >
          Continue Shopping
        </button>
      </div>
    </motion.div>
  );

  return (
    <main className="min-h-screen bg-[#1a120b] text-white font-serif pt-28 px-4">
      <AnimatePresence mode="wait">
        {success ? (
          <SuccessView />
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <h1 className="text-4xl font-bold text-center text-[#c9a36a]">💳 Payment</h1>

            {/* Summary */}
            <div className="bg-[#2a1d13] p-6 rounded-2xl border border-stone-800">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="grid sm:grid-cols-2 gap-2 text-stone-200">
                <p>
                  <span className="text-stone-400">Name:</span> {orderData.name}
                </p>
                <p>
                  <span className="text-stone-400">Email:</span> {orderData.email}
                </p>
                <p className="sm:col-span-2">
                  <span className="text-stone-400">Address:</span> {orderData.address}
                </p>
              </div>
              <p className="mt-4 text-2xl font-bold text-[#c9a36a]">{totalFormatted}</p>
            </div>

            {/* Payment method */}
            <div className="bg-[#2a1d13] p-6 rounded-2xl border border-stone-800">
              <h2 className="mb-4 font-semibold">Select Payment Method</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedMethod("cash")}
                  className={`rounded-2xl border p-5 text-left transition ${
                    selectedMethod === "cash"
                      ? "border-[#c9a36a] bg-[#20160f]"
                      : "border-stone-700 hover:border-stone-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="w-6 h-6 text-[#c9a36a]" />
                    <div>
                      <div className="font-bold text-white">Cash on Delivery</div>
                      <div className="text-sm text-stone-400">Pay when your order arrives.</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("card")}
                  className={`rounded-2xl border p-5 text-left transition ${
                    selectedMethod === "card"
                      ? "border-[#c9a36a] bg-[#20160f]"
                      : "border-stone-700 hover:border-stone-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-[#c9a36a]" />
                    <div>
                      <div className="font-bold text-white">Card</div>
                      <div className="text-sm text-stone-400">Pay securely using your card.</div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Card fields */}
              <AnimatePresence>
                {selectedMethod === "card" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-5 space-y-4"
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Card Number"
                      className={fieldBase}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCard(e.target.value))}
                      disabled={submitting}
                    />
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      className={fieldBase}
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      disabled={submitting}
                    />
                    <div className="flex gap-4">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/YY"
                        className={`${fieldBase} flex-1`}
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        disabled={submitting}
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="CVV"
                        className={`${fieldBase} flex-1`}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        disabled={submitting}
                      />
                    </div>
                    <p className="text-xs text-stone-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Your payment info is encrypted and never stored on our servers.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full mt-6 bg-[#c9a36a] hover:bg-[#b68d58] disabled:opacity-60 text-[#1a120b] font-bold py-3 rounded-full shadow-lg transition inline-flex items-center justify-center gap-2"
              >
                {submitting ? "Processing..." : "Confirm"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Payment;