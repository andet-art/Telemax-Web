// pages/signup.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

type Form = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  date_of_birth: string;
  country: string;

  shipping_address: string;
  billing_address: string;
  same_billing_address: boolean;

  age_verified: boolean;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  marketing_emails: boolean;
};

const calcAge = (dob: string) => {
  const t = new Date();
  const b = new Date(dob);
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
};

export default function SignUp() {
  const navigate = useNavigate();

  const [form, setForm] = useState<Form>({
    first_name: "", last_name: "", email: "", password: "",
    phone_number: "", date_of_birth: "", country: "",
    shipping_address: "", billing_address: "",
    same_billing_address: true,
    age_verified: false, terms_accepted: false, privacy_accepted: false,
    marketing_emails: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, type } = e.target;
    const value =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.date_of_birth) return setError("Please enter your date of birth.");
    if (calcAge(form.date_of_birth) < 18)
      return setError("You must be at least 18.");
    if (!form.age_verified)
      return setError("Please verify legal age.");
    if (!form.terms_accepted)
      return setError("Please accept the Terms.");
    if (!form.privacy_accepted)
      return setError("Please accept the Privacy Policy.");

    setLoading(true);

    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone_number: form.phone_number.trim() || undefined,
        date_of_birth: form.date_of_birth || undefined,
        country: form.country || undefined,
        shipping_address: form.shipping_address.trim() || undefined,
        billing_address: !form.same_billing_address && form.billing_address.trim() ? form.billing_address.trim() : undefined,
        billing_same_as_shipping: form.same_billing_address,
        marketing_emails: form.marketing_emails,
        terms_accepted: form.terms_accepted,
        privacy_accepted: form.privacy_accepted,
        age_verified: form.age_verified,
      };

      const { data } = await api.post("/api/auth/signup", payload);

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
        d?.error ||
        d?.message ||
        (typeof d === "string" ? d : "") ||
        err?.message ||
        "Sign up failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#14110f] text-white flex items-center justify-center px-4 py-24">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1e1b18] border border-stone-800 rounded-xl p-8 w-full max-w-xl shadow-lg"
      >
        <h1 className="text-3xl font-semibold mb-6 text-center">
          Create Account
        </h1>

        {error && (
          <p className="text-red-400 text-center mb-4">{error}</p>
        )}

        <div className="space-y-4">
          <input
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
            required
            className="w-full bg-[#13100d] px-4 py-2 rounded-md border border-stone-700"
          />

          <input
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
            required
            className="w-full bg-[#13100d] px-4 py-2 rounded-md border border-stone-700"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full bg-[#13100d] px-4 py-2 rounded-md border border-stone-700"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full bg-[#13100d] px-4 py-2 rounded-md border border-stone-700"
          />

          <input
            name="date_of_birth"
            type="date"
            value={form.date_of_birth}
            onChange={handleChange}
            required
            className="w-full bg-[#13100d] px-4 py-2 rounded-md border border-stone-700"
          />

          <div className="space-y-3 pt-4 border-t border-stone-700">
            <label className="flex gap-2">
              <input
                type="checkbox"
                name="age_verified"
                checked={form.age_verified}
                onChange={handleChange}
                required
              />
              I verify that I am 18+
            </label>

            <label className="flex gap-2">
              <input
                type="checkbox"
                name="terms_accepted"
                checked={form.terms_accepted}
                onChange={handleChange}
                required
              />
              I accept the Terms of Service
            </label>

            <label className="flex gap-2">
              <input
                type="checkbox"
                name="privacy_accepted"
                checked={form.privacy_accepted}
                onChange={handleChange}
                required
              />
              I accept the Privacy Policy
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-stone-700 hover:bg-stone-600 py-3 rounded-md"
        >
          {loading ? "Creating Account…" : "Create Account"}
        </button>
      </form>
    </main>
  );
}