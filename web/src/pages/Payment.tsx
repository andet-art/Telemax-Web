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

  const totalFormatted = useMemo(
    () => (orderData ? `$${Number(orderData.total || 0).toFixed(2)}` : "$0.00"),
    [orderData]
  );

  if (!orderData || !orderData.orderId) {
    return (
      <main className="pt-32 min-h-screen bg-[#1a120b] text-white font-serif w-full flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="text-3xl font-bold text-white drop-shadow">
          No valid order found.
        </h1>
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
      if (cardNumber.replace(/\s/g, "").length < 15)
        return alert("Enter a valid card number.");
      if (!cardHolder.trim()) return alert("Enter the cardholder name.");
      if (expiry.length < 4) return alert("Enter a valid expiry (MM/YY).");
      if (cvv.length < 3) return alert("Enter a valid CVV.");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return alert("You must be logged in.");
    }

    setSubmitting(true);

    try {
      const last4 = cardNumber.replace(/\D/g, "").slice(-4);

      await api.post(
        `/api/orders/${orderData.orderId}/pay`,
        {
          method: selectedMethod,
          last4: last4 || undefined,
          total: orderData.total,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await new Promise((r) => setTimeout(r, 800));
      setSuccess(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Payment failed.";
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
      <h2 className="text-3xl font-bold mb-3">Payment Successful</h2>
      <p className="text-stone-300 mb-6">
        Thanks, <span className="text-white font-semibold">{orderData.name}</span>!
        Your order{" "}
        <span className="text-[#c9a36a] font-semibold">
          #{orderData.orderId}
        </span>{" "}
        is being prepared.
      </p>

      <div className="bg-[#20160f] border border-stone-800 rounded-xl p-5 text-left space-y-2 mb-6">
        <div className="flex justify-between">
          <span>Total Paid</span>
          <span className="text-[#c9a36a] font-bold">
            {totalFormatted}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Payment Method</span>
          <span className="capitalize">{selectedMethod}</span>
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
          className="px-6 py-3 rounded-xl font-semibold border border-stone-700"
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
            className="max-w-3xl mx-auto space-y-6"
          >
            <h1 className="text-4xl font-bold text-center text-[#c9a36a]">
              💳 Payment
            </h1>

            <div className="bg-[#2a1d13] p-6 rounded-xl border border-stone-800">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <p>Name: {orderData.name}</p>
              <p>Email: {orderData.email}</p>
              <p>Address: {orderData.address}</p>
              <p className="mt-4 text-2xl font-bold text-[#c9a36a]">
                {totalFormatted}
              </p>
            </div>

            <div className="bg-[#2a1d13] p-6 rounded-xl border border-stone-800">
              <h2 className="mb-4 font-semibold">Select Payment Method</h2>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id as MethodId)}
                    className={`p-3 border rounded-xl ${
                      selectedMethod === method.id
                        ? "border-[#c9a36a]"
                        : "border-stone-700"
                    }`}
                  >
                    <img src={method.logo} alt={method.label} className="h-8 mx-auto" />
                  </button>
                ))}
              </div>

              {selectedMethod && (
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="w-full bg-[#c9a36a] text-[#1a120b] py-3 rounded-full font-bold"
                >
                  {submitting ? "Processing..." : "Confirm Payment"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Payment;