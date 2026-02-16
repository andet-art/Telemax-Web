// pages/signup.tsx - FIXED TO MATCH BACKEND
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

type Form = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;  // Changed from 'phone'
  date_of_birth: string;
  country: string;
  shipping_address: string;
  billing_address: string;
  same_billing_address: boolean;
  age_verified: boolean;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  marketing_emails: boolean;  // Changed from 'marketing_consent'
};

const calcAge = (dob: string) => {
  const t = new Date(), b = new Date(dob);
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
};

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>({
    first_name: "", last_name: "", email: "", password: "",
    phone_number: "",  // Changed from 'phone'
    date_of_birth: "", country: "",
    shipping_address: "", billing_address: "",
    same_billing_address: true,
    age_verified: false, terms_accepted: false, privacy_accepted: false,
    marketing_emails: false,  // Changed from 'marketing_consent'
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, type } = e.target;
    const value = type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;

    setForm(prev => {
      const next = { ...prev, [name]: value } as Form;
      if (name === "shipping_address" && prev.same_billing_address) next.billing_address = value as string;
      if (name === "same_billing_address" && value === true) next.billing_address = prev.shipping_address;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.date_of_birth && calcAge(form.date_of_birth) < 18) return setError("You must be at least 18.");
    if (!form.age_verified) return setError("Please verify legal age.");
    if (!form.terms_accepted) return setError("Please accept the Terms.");
    if (!form.privacy_accepted) return setError("Please accept the Privacy Policy.");

    setLoading(true);
    try {
      // Send ALL fields that backend User.create() expects
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone_number: form.phone_number.trim() || null,  // Changed from 'phone'
        date_of_birth: form.date_of_birth || null,
        country: form.country || null,
        marketing_emails: form.marketing_emails,  // Changed from 'marketing_consent'
      };

      const { data } = await api.post("/api/auth/signup", payload);

      // If API returns token+user, auto sign-in; else send to signin
      if (data?.token && data?.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/profile");
      } else {
        navigate("/signin");
      }
    } catch (err: any) {
      const d = err?.response?.data;
      const msg =
        d?.error || d?.message || (typeof d === "string" ? d : "") || err?.message || "Sign up failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#14110f] text-white flex items-center justify-center px-4 py-24">
      <form onSubmit={handleSubmit} className="bg-[#1e1b18] border border-stone-800 rounded-xl p-8 w-full max-w-2xl shadow-lg">
        <h1 className="text-3xl font-semibold mb-6 text-center">Create Account</h1>
        {error && <p className="text-red-400 text-center mb-4 font-medium">{error}</p>}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} required className="w-full bg-[#13100d] px-4 py-2 rounded-md border border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#c9a36a]" />
            <input name="last_name"  placeholder="Last Name"  value={form.last_name}  onChange={handleChange} required className="w-full bg-[#13100d] px-4 py-2 rounded-md border border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#c9a36a]" />
          </div>

          <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required className="w-full bg-[#13100d] px-4 py-2 rounded-md border border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#c9a36a]" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="w-full bg-[#13100d] px-4 py-2 rounded-md border border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#c9a36a]" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="phone_number" type="tel" placeholder="Phone Number" value={form.phone_number} onChange={handleChange} className="w-full bg-[#13100d] px-4 py-2 rounded-md border border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#c9a36a]" />
            <input name="date_of_birth" type="date" placeholder="Date of Birth" value={form.date_of_birth} onChange={handleChange} required className="w-full bg-[#13100d] px-4 py-2 rounded-md border border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#c9a36a]" />
          </div>

          <select name="country" value={form.country} onChange={handleChange} className="w-full bg-[#13100d] px-4 py-2 rounded-md border border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#c9a36a]">
            <option value="">Select Country</option>
            <option value="US">United States</option><option value="CA">Canada</option>
            <option value="UK">United Kingdom</option><option value="DE">Germany</option>
            <option value="FR">France</option><option value="AU">Australia</option>
          </select>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Shipping Address</h3>
            <textarea name="shipping_address" placeholder="Enter your complete shipping address" value={form.shipping_address} onChange={handleChange} rows={3} className="w-full bg-[#13100d] px-4 py-2 rounded-md border border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#c9a36a] resize-none" />

            <label className="flex items-center gap-2">
              <input type="checkbox" name="same_billing_address" checked={form.same_billing_address} onChange={handleChange} className="w-4 h-4" />
              <span>Billing address same as shipping</span>
            </label>

            {!form.same_billing_address && (
              <div>
                <h3 className="text-lg font-medium mb-2">Billing Address</h3>
                <textarea name="billing_address" placeholder="Enter your billing address" value={form.billing_address} onChange={handleChange} rows={3} className="w-full bg-[#13100d] px-4 py-2 rounded-md border border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#c9a36a] resize-none" />
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-stone-700">
            <label className="flex items-start gap-2">
              <input type="checkbox" name="age_verified" checked={form.age_verified} onChange={handleChange} required className="w-4 h-4 mt-1" />
              <span className="text-sm">I verify that I am 18+.</span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" name="terms_accepted" checked={form.terms_accepted} onChange={handleChange} required className="w-4 h-4 mt-1" />
              <span className="text-sm">I accept the <span className="text-[#c9a36a] underline">Terms of Service</span></span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" name="privacy_accepted" checked={form.privacy_accepted} onChange={handleChange} required className="w-4 h-4 mt-1" />
              <span className="text-sm">I accept the <span className="text-[#c9a36a] underline">Privacy Policy</span></span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" name="marketing_emails" checked={form.marketing_emails} onChange={handleChange} className="w-4 h-4 mt-1" />
              <span className="text-sm">I want to receive marketing emails (optional)</span>
            </label>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full mt-6 bg-stone-700 hover:bg-stone-600 transition py-3 rounded-md font-medium disabled:opacity-50">
          {loading ? "Creating Account…" : "Create Account"}
        </button>

        <p className="text-center text-sm mt-4 text-stone-400">
          Already have an account?{" "}
          <span className="text-[#c9a36a] cursor-pointer hover:underline" onClick={() => navigate("/signin")}>
            Sign in
          </span>
        </p>
      </form>
    </main>
  );
}