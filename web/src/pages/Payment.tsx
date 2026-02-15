import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, CreditCard, ArrowLeft, ShieldCheck, Clock } from "lucide-react";
import { api } from "@/lib/api";

import visaLogo from "../assets/visa.jpg";
import mastercardLogo from "../assets/mastercard.jpg";
import paypalLogo from "../assets/paypal.png";
import amexLogo from "../assets/amex.jpg";
import applePayLogo from "../assets/apple-pay.png";
import cashLogo from "../assets/cash.png";

type MethodId = "visa" | "mastercard" | "paypal" | "amex" | "apple" | "cash" | null;

type LocationState = {
  name: string;
  email: string;
  address: string;
  total: number;
  orderId?: string | number;
};

const paymentMethods = [
  { id: "visa", label: "VISA", logo: visaLogo },
  { id: "mastercard", label: "Mastercard", logo: mastercardLogo },
  { id: "paypal", label: "Paypal", logo: paypalLogo },
  { id: "amex", label: "AMEX", logo: amexLogo },
  { id: "apple", label: "Apple Pay", logo: applePayLogo },
  { id: "cash", label: "Cash", logo: cashLogo },
] as const;

const cardBrands: MethodId[] = ["visa", "mastercard", "amex"];
const fieldBase =
  "w-full px-4 py-3 rounded bg-[#2a1d13] text-white placeholder-stone-400 border border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#c9a36a]";

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = (location.state || null) as LocationState | null;

  const [selectedMethod, setSelectedMethod] = useState<MethodId>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | number | undefined>(orderData?.orderId);

  const totalFormatted = useMemo(
    () => (orderData ? `$${Number(orderData.total || 0).toFixed(2)}` : "$0.00"),
    [orderData]
  );

  if (!orderData) {
    return (
      <main className="pt-32 min-h-screen bg-[#1a120b] text-white font-serif w-full flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="text-3xl font-bold text-white drop-shadow">No order data found.</h1>
        <button
          onClick={() => navigate("/checkout")}
          className="bg-[#c9a36a] hover:bg-[#b68d58] text-[#1a120b] px-6 py-3 rounded-full font-semibold shadow-lg transition"
        >
          Back to Checkout
        </button>
      </main>
    );
  }

  const isCardBrand = selectedMethod && cardBrands.includes(selectedMethod);
  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) =>
    v.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(\d{1,2})/, "$1/$2");

  const handleConfirm = async () => {
    if (!selectedMethod) return alert("Please select a payment method.");

    if (isCardBrand) {
      if (cardNumber.replace(/\s/g, "").length < 15) return alert("Enter a valid card number.");
      if (!cardHolder.trim()) return alert("Enter the cardholder name.");
      if (expiry.length < 4) return alert("Enter a valid expiry (MM/YY).");
      if (cvv.length < 3) return alert("Enter a valid CVV.");
    }

    setSubmitting(true);
    try {
      // 1) Ensure order exists (backend: POST /api/orders)
      if (!orderId) {
        try {
          const { data } = await api.post("/api/orders", {
            name: orderData.name,
            email: orderData.email,
            address: orderData.address,
            total: orderData.total,
          });
          if (data?.id) setOrderId(data.id);
        } catch { /* ignore if endpoint not present */ }
      }

      // 2) Mark as paid if backend supports it (POST /api/orders/:id/pay)
      if (orderId) {
        const last4 = cardNumber.replace(/\D/g, "").slice(-4);
        try {
          await api.post(`/api/orders/${orderId}/pay`, {
            method: selectedMethod,
            last4: last4 || undefined,
            total: orderData.total,
          });
        } catch { /* optional endpoint */ }
      }

      // Simulate external redirect latency
      await new Promise((r) =>
        setTimeout(r, selectedMethod === "paypal" || selectedMethod === "apple" ? 1400 : 800)
      );

      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const SuccessView = () => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center">
      <div className="flex items-center justify-center mb-6">
        <CheckCircle2 className="w-16 h-16 text-green-400" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3">Payment Successful</h2>
      <p className="text-stone-300 mb-6">
        Thanks, <span className="text-white font-semibold">{orderData.name}</span>!{" "}
        {orderId ? <>Your order <span className="text-[#c9a36a] font-semibold">#{orderId}</span> is being prepared.</> : "Your order is being prepared."}
      </p>

      <div className="bg-[#20160f] border border-stone-800 rounded-xl p-5 text-left space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-stone-400">Total Paid</span>
          <span className="text-[#c9a36a] font-bold">{totalFormatted}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-stone-400">Payment Method</span>
          <span className="text-stone-200 capitalize">{selectedMethod || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-stone-400 text-sm pt-2">
          <ShieldCheck className="w-4 h-4" />
          Secured payment • Encrypted • PCI-DSS
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate("/order-history")}
          className="px-6 py-3 rounded-xl font-semibold bg-[#c9a36a] text-[#1a120b] hover:bg-[#b68d58] transition shadow"
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

  const renderPaymentFields = () => {
    switch (selectedMethod) {
      case "visa":
      case "mastercard":
      case "amex":
        return (
          <div className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Card Number"
              className={fieldBase}
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCard(e.target.value))}
            />
            <input
              type="text"
              placeholder="Cardholder Name"
              className={fieldBase}
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
            />
            <div className="flex gap-4">
              <input
                type="text"
                inputMode="numeric"
                placeholder="MM/YY"
                className={`${fieldBase} flex-1`}
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="CVV"
                className={`${fieldBase} flex-1`}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              />
            </div>
            <p className="text-xs text-stone-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Your payment info is encrypted and never stored on our servers.
            </p>
          </div>
        );
      case "paypal":
        return <p className="text-base text-stone-300 italic">You’ll be redirected to PayPal.</p>;
      case "apple":
        return <p className="text-base text-stone-300 italic">Confirm with Apple&nbsp;Pay.</p>;
      case "cash":
        return (
          <p className="text-base text-stone-300 italic">
            Cash on Delivery selected. Please have the exact amount ready.
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')] bg-cover bg-center text-white font-serif">
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative pt-28 pb-16 px-4 sm:px-6 md:px-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-stone-300 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <motion.h1 className="text-4xl sm:text-5xl font-extrabold text-center text-[#c9a36a] mb-10" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          💳 Payment
        </motion.h1>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div key="success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-[#2a1d13] p-8 rounded-2xl shadow-xl border border-stone-800">
              <SuccessView />
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid md:grid-cols-2 gap-6">
              {/* Order summary */}
              <div className="bg-[#2a1d13] p-6 rounded-2xl shadow-xl border border-stone-800 space-y-4">
                <h2 className="text-xl font-bold">Order Summary</h2>
                <div className="space-y-2 text-stone-200">
                  {orderId && (
                    <p>
                      <span className="text-stone-400">Order #:</span>{" "}
                      <span className="font-semibold text-white">#{orderId}</span>
                    </p>
                  )}
                  <p><span className="text-stone-400">Name:</span> <span className="font-medium text-white">{orderData.name}</span></p>
                  <p><span className="text-stone-400">Email:</span> <span className="font-medium text-white break-all">{orderData.email}</span></p>
                  <p><span className="text-stone-400">Address:</span> <span className="font-medium text-white">{orderData.address}</span></p>
                </div>
                <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                  <span className="text-lg">Total</span>
                  <span className="text-2xl font-bold text-[#c9a36a]">{totalFormatted}</span>
                </div>
                <div className="text-xs text-stone-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Orders placed before 5pm ship the same day.
                </div>
              </div>

              {/* Payment method & fields */}
              <div className="bg-[#2a1d13] p-6 rounded-2xl shadow-xl border border-stone-800">
                <h2 className="text-lg font-semibold text-white mb-3">Select a payment method</h2>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id as MethodId)}
                      className={`rounded-xl p-3 bg-[#1e130a] border-2 transition flex items-center justify-center shadow-inner hover:border-[#c9a36a] ${
                        selectedMethod === method.id ? "border-[#c9a36a] ring-2 ring-[#c9a36a]" : "border-stone-700"
                      }`}
                    >
                      <img src={method.logo} alt={method.label} className="h-6 sm:h-8 object-contain" />
                    </button>
                  ))}
                </div>

                {selectedMethod && (
                  <div className="pt-2">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#c9a36a]" />
                      Enter Payment Details
                    </h3>
                    {renderPaymentFields()}
                  </div>
                )}

                {selectedMethod && (
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="w-full mt-6 bg-[#c9a36a] hover:bg-[#b68d58] disabled:opacity-60 text-[#1a120b] font-bold py-3 rounded-full shadow-lg transition inline-flex items-center justify-center gap-2"
                  >
                    {submitting && (
                      <svg className="animate-spin h-5 w-5 text-[#1a120b]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    )}
                    {submitting ? "Processing..." : "Confirm Payment"}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default Payment;
