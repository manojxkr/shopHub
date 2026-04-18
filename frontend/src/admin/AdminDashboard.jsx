import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import Spinner from "../components/Spinner.jsx";
import { fetchAdminStats, fetchAdminProfile } from "../services/adminService.js";
import { allOrders } from "../services/orderService.js";

function money(n) {
  if (n == null) return "-";
  const v = typeof n === "number" ? n : Number(n);
  if (Number.isNaN(v)) return String(n);
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v);
}

function StatCard({ label, value, icon, color = "slate", loading = false, error = null }) {
  const colorClasses = {
    slate: "bg-slate-50 border-slate-300 text-slate-900",
    blue: "bg-blue-50 border-blue-300 text-blue-900",
    green: "bg-green-50 border-green-300 text-green-900",
    amber: "bg-amber-50 border-amber-300 text-amber-900",
    rose: "bg-rose-50 border-rose-300 text-rose-900",
  };

  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-700">{label}</div>
          {error ? (
            <div className="mt-2 text-sm text-red-700 font-medium">{error}</div>
          ) : loading ? (
            <div className="mt-2 flex justify-center">
              <Spinner label="Loading…" />
            </div>
          ) : (
            <>
              <div className="mt-2 text-3xl font-bold">{value}</div>
            </>
          )}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [statsError, setStatsError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [ordersError, setOrdersError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setStatsError("");
    setProfileError("");
    setOrdersError("");
    try {
      const [statsData, profileData, ordersData] = await Promise.all([
        fetchAdminStats().catch(() => null),
        fetchAdminProfile().catch(() => null),
        allOrders().catch(() => null),
      ]);
      if (!statsData) setStatsError("Could not load stats.");
      else setStats(statsData);
      if (!profileData) setProfileError("Could not load profile.");
      else setProfile(profileData);
      if (!Array.isArray(ordersData)) setOrdersError("Could not load top product analytics.");
      else setOrders(ordersData);
    } catch (e) {
      setStatsError(e?.message || "Could not load stats.");
      setProfileError(e?.message || "Could not load profile.");
      setOrdersError(e?.message || "Could not load top product analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  const topProducts = useMemo(() => {
    const agg = new Map();
    for (const order of orders) {
      if (String(order?.status || "").toUpperCase() === "CANCELLED") continue;
      for (const item of order?.items || []) {
        const title = item?.bookTitle || "Unknown Product";
        const qty = Number(item?.quantity || 0);
        const revenue = (Number(item?.priceAtPurchase || 0) * qty) || 0;
        const prev = agg.get(title) || { title, qty: 0, revenue: 0, orders: 0 };
        prev.qty += qty;
        prev.revenue += revenue;
        prev.orders += 1;
        agg.set(title, prev);
      }
    }
    return Array.from(agg.values())
      .sort((a, b) => (b.qty - a.qty) || (b.revenue - a.revenue))
      .slice(0, 5);
  }, [orders]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function exportDashboardReport() {
    const payload = {
      generatedAt: new Date().toISOString(),
      admin: profile || null,
      stats: stats || null,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Admin Profile Card */}
      {profile && (
        <div className="section-surface mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-slate-900">Welcome back, {profile.name}!</h2>
              <p className="mb-4 text-sm text-slate-700">{profile.email}</p>
              <div className="flex items-center gap-3">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
                  {profile.role?.replace("ROLE_", "") || "ADMIN"}
                </span>
                <span className="text-sm text-slate-600">Admin ID: {profile.id}</span>
              </div>
            </div>
            <div className="text-5xl opacity-70">👨‍💼</div>
          </div>
        </div>
      )}

      {/* Header with Quick Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between relative z-20">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm font-medium text-slate-700">Manage your store and monitor performance.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            to="/admin/products"
          >
            ➕ Add Product
          </Link>
          <Link
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            to="/admin/products"
          >
            📦 Manage Products
          </Link>
          <Link
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
            to="/admin/orders"
          >
            📋 View Orders
          </Link>
          <button
            type="button"
            onClick={() => loadDashboard()}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
          >
            🔄 Refresh Data
          </button>
          <button
            type="button"
            onClick={exportDashboardReport}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            ⬇ Export Report
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={stats?.totalBooks || 0}
          icon="📚"
          color="blue"
          loading={loading}
          error={statsError}
        />
        <StatCard
          label="Total Orders"
          value={stats?.totalOrders || 0}
          icon="🛒"
          color="green"
          loading={loading}
          error={statsError}
        />
        <StatCard
          label="Total Users"
          value={stats?.totalUsers || 0}
          icon="👥"
          color="slate"
          loading={loading}
          error={statsError}
        />
        <StatCard
          label="Total Revenue"
          value={money(stats?.totalRevenue || 0)}
          icon="💰"
          color="green"
          loading={loading}
          error={statsError}
        />
      </div>

      {/* Order Status Overview */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Order Status Overview</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div className="text-sm font-semibold text-amber-700">Pending Orders</div>
            <div className="text-3xl font-bold text-amber-600 mt-2">{stats?.pendingOrders || 0}</div>
            <p className="text-xs text-amber-600 mt-2">⚠️ Awaiting processing</p>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="text-sm font-semibold text-blue-700">Shipped Orders</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{stats?.shippedOrders || 0}</div>
            <p className="text-xs text-blue-600 mt-2">🚚 In transit</p>
          </div>
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <div className="text-sm font-semibold text-green-700">Delivered Orders</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{stats?.deliveredOrders || 0}</div>
            <p className="text-xs text-green-600 mt-2">✓ Completed</p>
          </div>
        </div>
      </div>

      {/* Most Bought Products */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Most Bought Products</h3>
          <span className="text-xs text-slate-500">Based on non-cancelled orders</span>
        </div>
        {loading ? (
          <div className="mt-4 flex justify-center">
            <Spinner label="Calculating top products..." />
          </div>
        ) : ordersError ? (
          <div className="mt-3 text-sm text-red-600">{ordersError}</div>
        ) : topProducts.length === 0 ? (
          <div className="mt-3 text-sm text-slate-600">No order analytics available yet.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-2 pr-4">Rank</th>
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Units Sold</th>
                  <th className="py-2 pr-4">Order Lines</th>
                  <th className="py-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={`${p.title}-${i}`} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 font-semibold">#{i + 1}</td>
                    <td className="py-2 pr-4 font-medium">{p.title}</td>
                    <td className="py-2 pr-4">{p.qty}</td>
                    <td className="py-2 pr-4">{p.orders}</td>
                    <td className="py-2">{money(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inventory Alerts */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">⚠️ Inventory Alerts</h3>
        {stats?.lowStockProducts > 0 ? (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-rose-700 mb-2">
              {stats.lowStockProducts} Products Low on Stock
            </div>
            <p className="text-sm text-rose-600 mb-3">
              You have {stats.lowStockProducts} product(s) with stock less than 10 units.
            </p>
            <Link
              to="/admin/products"
              className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
            >
              Manage Inventory
            </Link>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-green-700">✓ All products well-stocked</div>
            <p className="text-sm text-green-600 mt-1">Your inventory levels are healthy.</p>
          </div>
        )}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          to="/admin/products"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📚</div>
          <h3 className="font-semibold text-slate-900 group-hover:text-slate-600">Manage Products</h3>
          <p className="text-sm text-slate-600 mt-2">Add, edit, or delete products from your catalog.</p>
        </Link>
        <Link
          to="/admin/orders"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📋</div>
          <h3 className="font-semibold text-slate-900 group-hover:text-slate-600">Manage Orders</h3>
          <p className="text-sm text-slate-600 mt-2">View and update order statuses and details.</p>
        </Link>
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="font-semibold text-slate-900">Performance</h3>
          <p className="text-sm text-slate-600 mt-2">Track your store's revenue and growth metrics.</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Alert title="💡 Pro Tip: Product Management">
          Keep your inventory updated regularly. Products with low stock (less than 10 units) will appear in the alerts section.
        </Alert>
        <Alert title="🔒 Security Note">
          All admin endpoints are secured with role-based access control. Your actions are logged for audit purposes.
        </Alert>
      </div>
    </div>
  );
}
