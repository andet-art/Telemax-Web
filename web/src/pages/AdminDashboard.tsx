// src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PanelLeft,
  Users,
  Package,
  ShoppingCart,
  LayoutDashboard,
  UserCheck,
  Pencil,
  Trash,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
} from "recharts";

const API = import.meta.env.VITE_API_BASE_URL || "http://209.38.231.125:4000";

type AnyObj = Record<string, any>;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "products" | "orders" | "activeUsers">("overview");
  const [users, setUsers] = useState<AnyObj[]>([]);
  const [products, setProducts] = useState<AnyObj[]>([]);
  const [orders, setOrders] = useState<AnyObj[]>([]);
  const [activeUsers, setActiveUsers] = useState<AnyObj[]>([]);
  const [activeUserCount, setActiveUserCount] = useState<number>(0);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const handleAuthErr = (err: any) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      navigate("/signin");
    }
  };

  const preloadOverviewData = async () => {
    try {
      const [usersRes, productsRes, ordersRes, statsRes] = await Promise.all([
        axios.get(`${API}/api/admin/users`, { headers }),
        axios.get(`${API}/api/products`), // or /api/admin/products if you want admin-only
        axios.get(`${API}/api/admin/orders`, { headers }),
        axios.get(`${API}/api/admin/stats`, { headers }),
      ]);

      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);

      const stats = statsRes.data ?? {};
      setActiveUserCount(Number(stats.activeUsers ?? 0));
      // Try to surface a list if the API provides one (e.g., activeUsers, recentActive, sessions, etc.)
      const list =
        stats.activeUsersList ??
        stats.activeUsers ??
        stats.recentActive ??
        stats.sessions ??
        [];
      setActiveUsers(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error("❌ Overview preload error:", err);
      handleAuthErr(err);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/signin");
      return;
    }

    (async () => {
      try {
        switch (activeTab) {
          case "overview":
            await preloadOverviewData();
            break;
          case "users": {
            const res = await axios.get(`${API}/api/admin/users`, { headers });
            setUsers(Array.isArray(res.data) ? res.data : []);
            break;
          }
          case "products": {
            const res = await axios.get(`${API}/api/products`);
            setProducts(Array.isArray(res.data) ? res.data : []);
            break;
          }
          case "orders": {
            const res = await axios.get(`${API}/api/admin/orders`, { headers });
            setOrders(Array.isArray(res.data) ? res.data : []);
            break;
          }
          case "activeUsers": {
            const res = await axios.get(`${API}/api/admin/stats`, { headers });
            const stats = res.data ?? {};
            const list =
              stats.activeUsersList ??
              stats.activeUsers ??
              stats.recentActive ??
              stats.sessions ??
              [];
            setActiveUsers(Array.isArray(list) ? list : []);
            setActiveUserCount(Number(stats.activeUsers ?? list.length ?? 0));
            break;
          }
        }
      } catch (err: any) {
        console.error("❌ Fetch error:", err);
        handleAuthErr(err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    preloadOverviewData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navItems = [
    { label: "Overview", key: "overview", icon: LayoutDashboard },
    { label: "Users", key: "users", icon: Users },
    { label: "Products", key: "products", icon: Package },
    { label: "Orders", key: "orders", icon: ShoppingCart },
    { label: "Active Users", key: "activeUsers", icon: UserCheck },
  ] as const;

  const StatCard = ({ label, value }: { label: string; value: number | string }) => (
    <motion.div whileHover={{ scale: 1.03 }} className="bg-white p-5 rounded-xl shadow">
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-xl font-bold mt-2">{value}</div>
    </motion.div>
  );

  const Overview = () => {
    const statsData = [
      { name: "Users", value: users.length },
      { name: "Products", value: products.length },
      { name: "Orders", value: orders.length },
      { name: "Active Users", value: activeUserCount },
    ];

    const categoryCounts = products.reduce<Record<string, number>>((acc, p: AnyObj) => {
      const key = String(p.category ?? "Uncategorized");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

    return (
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Users" value={users.length} />
          <StatCard label="Products" value={products.length} />
          <StatCard label="Orders" value={orders.length} />
          <StatCard label="Active Users" value={activeUserCount} />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-gray-700 mb-4 font-semibold">Overview Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-gray-700 mb-4 font-semibold">Product Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label />
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const UsersTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-xl shadow">
        <thead className="bg-zinc-100">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Phone</th>
            <th className="px-4 py-3 text-left">Role</th>
            <th className="px-4 py-3 text-left">Country</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-4 py-2">{u.id}</td>
              <td className="px-4 py-2">
                {u.first_name} {u.last_name}
              </td>
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2">{u.phone}</td>
              <td className="px-4 py-2 capitalize">{u.role}</td>
              <td className="px-4 py-2">{u.country}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const ProductsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-xl shadow">
        <thead className="bg-zinc-100">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Version</th>
            <th className="px-4 py-3 text-left">Price</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="px-4 py-2">{p.id}</td>
              <td className="px-4 py-2">{p.name}</td>
              <td className="px-4 py-2">{p.version}</td>
              <td className="px-4 py-2">${p.price}</td>
              <td className="px-4 py-2 space-x-2">
                <button className="text-blue-600">
                  <Pencil size={16} />
                </button>
                <button className="text-red-600">
                  <Trash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const OrdersTable = () => (
    <div className="space-y-6">
      {orders.map((o) => (
        <div key={o.id} className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center border-b pb-2 mb-3">
            <div>
              <div className="font-semibold text-lg">Order #{o.id}</div>
              <div className="text-sm text-gray-500">
                {o.created_at ? String(o.created_at).slice(0, 19).replace("T", " ") : ""}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">Customer: {o.full_name}</div>
              <div className="text-sm text-gray-600">Email: {o.user_email}</div>
              <div className="text-sm text-gray-600">Total: ${o.total_price}</div>
              <div className="text-sm text-teal-600 font-semibold">{o.status}</div>
            </div>
          </div>
          <div className="text-sm">
            <div className="font-semibold mb-2">Items:</div>
            <ul className="list-disc list-inside space-y-1">
              {(o.items ?? []).map((it: AnyObj) => (
                <li key={it.id}>
                  {it.product_name} × {it.quantity} – ${it.price}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );

  const ActiveUsersTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-xl shadow">
        <thead className="bg-zinc-100">
          <tr>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Last Active</th>
            <th className="px-4 py-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {activeUsers.map((u: AnyObj, idx: number) => (
            <tr key={idx} className="border-t">
              <td className="px-4 py-2">{u.email ?? u.user_email ?? "—"}</td>
              <td className="px-4 py-2">
                {u.loginTime ? new Date(u.loginTime).toLocaleString() : u.lastActive ?? "—"}
              </td>
              <td className="px-4 py-2">
                {u.isActive ? (
                  <span className="text-green-600 font-medium">Active</span>
                ) : (
                  <span className="text-gray-500">Inactive</span>
                )}
              </td>
            </tr>
          ))}
          {activeUsers.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-sm text-gray-500" colSpan={3}>
                No active user list exposed by /api/admin/stats.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex h-screen">
      <aside className="bg-zinc-900 text-white w-64 p-4 space-y-4">
        <div className="text-2xl font-bold mb-6 flex items-center gap-2">
          <PanelLeft /> Admin Panel
        </div>
        {navItems.map(({ label, key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex gap-2 items-center w-full p-2 rounded-md ${
              activeTab === key ? "bg-teal-700" : "hover:bg-zinc-800"
            }`}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </aside>

      <main className="flex-1 p-6 overflow-y-auto bg-zinc-50">
        <h1 className="text-3xl font-semibold mb-4 capitalize">{activeTab}</h1>
        {activeTab === "overview" && <Overview />}
        {activeTab === "users" && <UsersTable />}
        {activeTab === "products" && <ProductsTable />}
        {activeTab === "orders" && <OrdersTable />}
        {activeTab === "activeUsers" && <ActiveUsersTable />}
      </main>
    </div>
  );
}
