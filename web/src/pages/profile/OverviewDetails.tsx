import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://138.68.248.164:4000";

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  country: string;
  marketing_emails: boolean;
  created_at: string;
};

export default function Overview() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/signin");
        return;
      }

      if (!response.ok) throw new Error("Failed to load profile");

      const result = await response.json();
      setUser(result.data);
    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center pt-24">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 text-white py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full mb-4 shadow-2xl">
            <span className="text-4xl font-bold text-white">
              {user?.first_name.charAt(0)}{user?.last_name.charAt(0)}
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            {user?.first_name} {user?.last_name}
          </h1>
          <p className="text-stone-400">{user?.email}</p>
        </div>

        {/* Main Card */}
        <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-800/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-amber-500/5 to-transparent p-5 rounded-xl border border-stone-700">
              <p className="text-xs text-stone-400 mb-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                First Name
              </p>
              <p className="text-lg font-semibold">{user?.first_name}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500/5 to-transparent p-5 rounded-xl border border-stone-700">
              <p className="text-xs text-stone-400 mb-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Last Name
              </p>
              <p className="text-lg font-semibold">{user?.last_name}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/5 to-transparent p-5 rounded-xl border border-stone-700">
              <p className="text-xs text-stone-400 mb-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                Email
              </p>
              <p className="text-lg font-semibold break-all">{user?.email}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/5 to-transparent p-5 rounded-xl border border-stone-700">
              <p className="text-xs text-stone-400 mb-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                Phone
              </p>
              <p className="text-lg font-semibold">{user?.phone_number || "Not provided"}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/5 to-transparent p-5 rounded-xl border border-stone-700">
              <p className="text-xs text-stone-400 mb-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Date of Birth
              </p>
              <p className="text-lg font-semibold">
                {user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : "Not provided"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/5 to-transparent p-5 rounded-xl border border-stone-700">
              <p className="text-xs text-stone-400 mb-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Country
              </p>
              <p className="text-lg font-semibold">{user?.country || "Not provided"}</p>
            </div>
          </div>

          {/* Account Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-stone-800">
            <div className="bg-gradient-to-br from-amber-500/10 to-transparent p-4 rounded-xl border border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-stone-400">Member Since</p>
                  <p className="text-sm font-semibold">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-transparent p-4 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-stone-400">Account ID</p>
                  <p className="text-sm font-semibold">#{user?.id}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-transparent p-4 rounded-xl border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-stone-400">Status</p>
                  <p className="text-sm font-semibold text-green-400">Verified</p>
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Status */}
          <div className="mt-8 pt-8 border-t border-stone-800">
            <h3 className="text-xl font-semibold mb-4">Communication Preferences</h3>
            <div className="bg-gradient-to-br from-amber-500/5 to-transparent p-5 rounded-xl border border-stone-700">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <div className="flex-1">
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-stone-400">
                    {user?.marketing_emails ? "Subscribed to receive updates" : "Not subscribed"}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user?.marketing_emails ? "bg-green-500/20 text-green-400" : "bg-stone-700 text-stone-400"
                }`}>
                  {user?.marketing_emails ? "Active" : "Inactive"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}