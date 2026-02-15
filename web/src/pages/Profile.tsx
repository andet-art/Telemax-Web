// src/pages/profile.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_BASE_URL || "http://209.38.231.125:4000";

type Editable = {
  phone: string;
  shipping_address: string;
  billing_address: string;
  marketing_consent: boolean;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  country: string;
  password?: string;
};

type PublicUser = {
  id: number;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
  shipping_address?: string;
  billing_address?: string;
  age_verified?: boolean;
  terms_accepted?: boolean;
  privacy_accepted?: boolean;
  marketing_consent?: boolean;
  created_at?: string;
  updated_at?: string;
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editable, setEditable] = useState<Editable>({
    phone: "",
    shipping_address: "",
    billing_address: "",
    marketing_consent: false,
    first_name: "",
    last_name: "",
    date_of_birth: "",
    country: "",
    password: "",
  });

  const toggleSection = (key: string) => setExpanded(expanded === key ? null : key);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    (async () => {
      try {
        // ✅ Your backend exposes GET /api/auth/me and returns { user: {...} }
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/signin");
          return;
        }
        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        const me: PublicUser = data?.user ?? data; // tolerate either shape

        setUser(me);
        setEditable({
          phone: me.phone ?? "",
          shipping_address: me.shipping_address ?? "",
          billing_address: me.billing_address ?? "",
          marketing_consent: !!me.marketing_consent,
          first_name: me.first_name ?? "",
          last_name: me.last_name ?? "",
          date_of_birth: (me as any)?.date_of_birth ?? "", // if present
          country: me.country ?? "",
          password: "",
        });
      } catch (e) {
        console.error("Profile load error", e);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const tryUpdate = async (path: string, body: any, token: string) => {
    const res = await fetch(`${API}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/signin");
      return false;
    }
    if (res.ok) return true;
    // allow caller to decide fallback on 404/405
    if (res.status === 404 || res.status === 405) return false;
    throw new Error(await res.text());
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/signin");

    try {
      const body: any = { ...editable };
      if (!body.password) delete body.password; // don't send empty password

      // ✅ Try common update locations
      let updated = await tryUpdate("/api/users/me", body, token);
      if (!updated) {
        updated = await tryUpdate("/api/profile", body, token);
      }
      if (!updated) {
        // last resort: if you actually implemented PUT /api/auth/me
        updated = await tryUpdate("/api/auth/me", body, token);
      }
      if (!updated) {
        toast.error("Update endpoint not found (ask backend to add PUT /api/users/me)");
        return;
      }

      // Keep local user cache fresh
      const current = (user || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : {})) as any;
      const merged = { ...current, ...body };
      setUser(merged);
      localStorage.setItem("user", JSON.stringify(merged));

      toast.success("Profile updated successfully");
      setEditable((e) => ({ ...e, password: "" })); // clear password field
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  if (loading) return <main className="min-h-screen flex items-center justify-center">Loading...</main>;

  return (
    <main className="min-h-screen bg-[#14110f] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">Your Profile</h1>

        {/* PERSONAL INFO */}
        <section className="bg-[#1e1b18] rounded-lg shadow p-4">
          <button onClick={() => toggleSection("personal")} className="w-full text-left text-xl font-semibold">
            👤 Personal Info
          </button>
          {expanded === "personal" && (
            <div className="mt-4 grid gap-3 text-sm">
              <label>
                <span className="font-medium">First Name:</span>
                <input
                  className="mt-1 w-full px-3 py-1 rounded bg-zinc-800 text-white"
                  value={editable.first_name}
                  onChange={(e) => setEditable({ ...editable, first_name: e.target.value })}
                />
              </label>

              <label>
                <span className="font-medium">Last Name:</span>
                <input
                  className="mt-1 w-full px-3 py-1 rounded bg-zinc-800 text-white"
                  value={editable.last_name}
                  onChange={(e) => setEditable({ ...editable, last_name: e.target.value })}
                />
              </label>

              <label>
                <span className="font-medium">Date of Birth:</span>
                <input
                  type="date"
                  className="mt-1 w-full px-3 py-1 rounded bg-zinc-800 text-white"
                  value={editable.date_of_birth || ""}
                  onChange={(e) => setEditable({ ...editable, date_of_birth: e.target.value })}
                />
              </label>

              <label>
                <span className="font-medium">Country:</span>
                <input
                  className="mt-1 w-full px-3 py-1 rounded bg-zinc-800 text-white"
                  value={editable.country || ""}
                  onChange={(e) => setEditable({ ...editable, country: e.target.value })}
                />
              </label>

              <label>
                <span className="font-medium">Change Password:</span>
                <input
                  type="password"
                  className="mt-1 w-full px-3 py-1 rounded bg-zinc-800 text-white"
                  value={editable.password || ""}
                  onChange={(e) => setEditable({ ...editable, password: e.target.value })}
                  placeholder="Leave empty to keep current"
                />
              </label>
            </div>
          )}
        </section>

        {/* CONTACT INFO */}
        <section className="bg-[#1e1b18] rounded-lg shadow p-4">
          <button onClick={() => toggleSection("contact")} className="w-full text-left text-xl font-semibold">
            📱 Contact & Preferences
          </button>
          {expanded === "contact" && (
            <div className="mt-4 grid gap-3 text-sm">
              <label>
                <span className="font-medium">Phone:</span>
                <input
                  className="mt-1 w-full px-3 py-1 rounded bg-zinc-800 text-white"
                  value={editable.phone}
                  onChange={(e) => setEditable({ ...editable, phone: e.target.value })}
                />
              </label>
              <label>
                <span className="font-medium">Shipping Address:</span>
                <input
                  className="mt-1 w-full px-3 py-1 rounded bg-zinc-800 text-white"
                  value={editable.shipping_address}
                  onChange={(e) => setEditable({ ...editable, shipping_address: e.target.value })}
                />
              </label>
              <label>
                <span className="font-medium">Billing Address:</span>
                <input
                  className="mt-1 w-full px-3 py-1 rounded bg-zinc-800 text-white"
                  value={editable.billing_address}
                  onChange={(e) => setEditable({ ...editable, billing_address: e.target.value })}
                />
              </label>
              <label className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  checked={editable.marketing_consent}
                  onChange={(e) => setEditable({ ...editable, marketing_consent: e.target.checked })}
                />
                <span>Marketing Consent</span>
              </label>
            </div>
          )}
        </section>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-500 transition py-2 rounded-md text-white font-medium mt-4"
        >
          Save Changes
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/signin");
          }}
          className="w-full bg-stone-700 hover:bg-stone-600 transition py-2 rounded-md text-white font-medium mt-2"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}
