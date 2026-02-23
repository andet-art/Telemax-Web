// src/pages/profile.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OverviewDetails from "@/pages/profile/OverviewDetails";
import Addresses from "@/pages/profile/Addresses";
import Settings from "@/pages/profile/Settings";

const API_URL = "http://138.68.248.164:4000";

export type Address = {
  id: number;
  address_type: string;
  full_address: string;
  country: string;
  is_default: boolean;
};

export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  country: string;
  marketing_emails: boolean;
  created_at: string;
  addresses: Address[];
};

type MenuItem = "overview" | "addresses" | "settings";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuItem>("overview");
  const [error, setError] = useState<string | null>(null);

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

      if (!response.ok) {
        throw new Error("Failed to load profile");
      }

      const result = await response.json();
      setUser(result.data);
    } catch (err: any) {
      console.error("Profile load error:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#14110f] via-[#1a1612] to-[#14110f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c9a36a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your profile...</p>
        </div>
      </main>
    );
  }

  const menuItems = [
    {
      id: "overview" as MenuItem,
      label: "Overview",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      ),
    },
    {
      id: "addresses" as MenuItem,
      label: "Addresses",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      ),
    },
    {
      id: "settings" as MenuItem,
      label: "Settings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#14110f] via-[#1a1612] to-[#14110f] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#c9a36a] to-[#b8935a] rounded-full flex items-center justify-center shadow-xl">
              <span className="text-2xl font-bold text-white">
                {user?.first_name.charAt(0)}{user?.last_name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {user?.first_name} {user?.last_name}
              </h1>
              <p className="text-stone-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-[#1e1b18]/80 backdrop-blur-xl border border-stone-800/50 rounded-2xl p-4 shadow-2xl sticky top-8">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeMenu === item.id
                        ? "bg-gradient-to-r from-[#c9a36a] to-[#b8935a] text-white shadow-lg"
                        : "text-stone-400 hover:bg-stone-800/50 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                    {activeMenu === item.id && (
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    )}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-stone-800">
                <div className="bg-gradient-to-br from-green-500/10 to-transparent p-4 rounded-xl border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-400">Active Member</span>
                  </div>
                  <p className="text-xs text-stone-400">
                    Since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <div className="bg-[#1e1b18]/80 backdrop-blur-xl border border-stone-800/50 rounded-2xl shadow-2xl overflow-hidden">
              {error && (
                <div className="m-6 bg-red-900/30 backdrop-blur-sm border border-red-700/50 text-red-200 px-6 py-4 rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="p-8">
                {activeMenu === "overview" && <OverviewDetails user={user} />}
                {activeMenu === "addresses" && <Addresses user={user} />}
                {activeMenu === "settings" && <Settings user={user} onUpdate={loadProfile} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}