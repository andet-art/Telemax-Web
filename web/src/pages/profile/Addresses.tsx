import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://138.68.248.164:4000";

type Address = {
  id: number;
  address_type: string;
  full_address: string;
  country: string;
  is_default: boolean;
};

type User = {
  addresses: Address[];
};

export default function Addresses() {
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

  const shippingAddress = user?.addresses?.find((a) => a.address_type === "shipping" || a.address_type === "both");
  const billingAddress = user?.addresses?.find((a) => a.address_type === "billing");

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 text-white py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Addresses</h1>
          <p className="text-stone-400">Manage your shipping and billing addresses</p>
        </div>

        {/* Main Card */}
        <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-800/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
            </div>
            Saved Addresses
          </h2>
          
          {(shippingAddress || billingAddress) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shippingAddress && (
                <div className="bg-gradient-to-br from-amber-500/5 to-transparent p-6 rounded-xl border border-stone-700 hover:border-amber-500/50 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-500 text-lg">Shipping Address</h4>
                        {shippingAddress.is_default && (
                          <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">Default</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-stone-300 leading-relaxed mb-3">{shippingAddress.full_address}</p>
                  {shippingAddress.country && (
                    <p className="text-sm text-stone-400 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {shippingAddress.country}
                    </p>
                  )}
                </div>
              )}

              {billingAddress && (
                <div className="bg-gradient-to-br from-blue-500/5 to-transparent p-6 rounded-xl border border-stone-700 hover:border-blue-500/50 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-400 text-lg">Billing Address</h4>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-stone-300 leading-relaxed mb-3">{billingAddress.full_address}</p>
                  {billingAddress.country && (
                    <p className="text-sm text-stone-400 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {billingAddress.country}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-stone-950 rounded-xl border border-stone-800 border-dashed">
              <svg className="w-20 h-20 text-stone-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <p className="text-stone-400 text-lg mb-2">No addresses saved yet</p>
              <p className="text-sm text-stone-500">Add an address during checkout</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}