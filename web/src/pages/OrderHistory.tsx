// src/pages/OrderHistory.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api"; // ✅ shared axios client (uses VITE_API_BASE_URL)

type OrderItem = {
  id?: string | number;
  product_id?: string | number;
  product_name?: string;
  name?: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string | number;
  created_at?: string;
  status?: string;
  total_price?: number;
  items?: OrderItem[];
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        // 🔗 Backend route is /api/orders/mine (per your server.js routes)
        const { data } = await api.get<Order[]>("/api/orders/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error("Failed to load orders", e);
        setErr(
          e?.response?.data?.message ||
            (typeof e?.response?.data === "string" ? e.response.data : "") ||
            "Failed to load orders."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Your Order History</h1>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Order History</h1>

      {err && (
        <div className="mb-6 rounded-lg border border-red-700/30 bg-red-900/20 text-red-200 px-4 py-3">
          {err}
        </div>
      )}

      {!err && orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const created =
              order.created_at?.slice(0, 19).replace("T", " ") || "";
            return (
              <div key={order.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-center border-b pb-2 mb-3">
                  <div>
                    <div className="font-semibold text-lg">Order #{order.id}</div>
                    <div className="text-sm text-gray-500">{created}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      Total: ${Number(order.total_price ?? 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-teal-600 font-semibold">
                      {order.status || "processing"}
                    </div>
                  </div>
                </div>

                <div className="text-sm">
                  <div className="font-semibold mb-2">Items:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {(order.items || []).map((item) => (
                      <li key={item.id ?? `${item.product_id}-${item.name}`}>
                        {item.product_name || item.name || "Item"} × {item.quantity} – $
                        {Number(item.price ?? 0).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
