import { useCallback, useEffect, useState } from "react";
import Alert from "../components/Alert.jsx";
import Spinner from "../components/Spinner.jsx";
import { allOrders, updateOrderStatus } from "../services/orderService.js";
import { subscribeOrderEvents } from "../services/orderSocket.js";

function money(n) {
  if (n == null) return "-";
  const v = typeof n === "number" ? n : Number(n);
  if (Number.isNaN(v)) return String(n);
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v);
}

function apiErr(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Failed to load orders."
  );
}

const STATUSES = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function ManageOrders() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orders, setOrders] = useState([]);
  const [live, setLive] = useState(false);

  function formatDateTime(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await allOrders();
      setOrders(list);
    } catch (err) {
      setError(apiErr(err));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let timer;
    const unsub = subscribeOrderEvents(() => {
      setLive(true);
      load();
      clearTimeout(timer);
      timer = setTimeout(() => setLive(false), 4000);
    });
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [load]);

  async function onStatusChange(orderId, nextStatus) {
    setSavingId(orderId);
    setError("");
    setSuccess("");
    try {
      await updateOrderStatus(orderId, nextStatus);
      setSuccess(`Order #${orderId} updated to ${nextStatus}.`);
      await load();
    } catch (err) {
      setError(apiErr(err));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="section-surface mb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">📦 Manage Orders</h1>
            <p className="mt-1 text-sm font-medium text-slate-700">View all orders and update status (ADMIN). List syncs via WebSocket.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {live ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">✓ Live update</span>
            ) : null}
            <button
              className="btn-primary px-3 py-2 text-sm font-semibold"
              onClick={load}
              type="button"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4">
          <Alert type="error" title="Error">
            {error}
          </Alert>
        </div>
      ) : null}
      {success ? (
        <div className="mt-4">
          <Alert type="success" title="Success">
            {success}
          </Alert>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-10 flex justify-center">
          <Spinner label="Loading orders..." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.length === 0 ? <Alert title="No orders">No orders found.</Alert> : null}

          {orders.map((o) => {
            const unpaid = String(o?.paymentStatus || "").toUpperCase() === "PENDING";
            const statusOptions = unpaid ? STATUSES.filter((s) => s === "PENDING" || s === "CANCELLED") : STATUSES;
            const isExpanded = expandedOrderId === o?.orderId;
            return (
              <div key={o?.orderId} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm text-slate-600">Order</div>
                    <div className="text-lg font-bold">#{o?.orderId}</div>
                    <div className="mt-1 text-sm text-slate-700">
                      {o?.customerName} · <span className="text-slate-500">{o?.customerEmail}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-3 py-1">Total: {money(o?.totalAmount)}</span>
                      <span className={`rounded-full px-3 py-1 ${unpaid ? "bg-amber-100 text-amber-900" : "bg-slate-100"}`}>
                        Payment: {o?.paymentStatus}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">Status: {o?.status}</span>
                    </div>
                    {unpaid ? (
                      <p className="mt-2 text-xs text-amber-800">Fulfillment (ship/deliver) is blocked until the customer completes demo payment.</p>
                    ) : null}
                  </div>

                  <div className="w-full md:w-64">
                    <button
                      type="button"
                      onClick={() => setExpandedOrderId(isExpanded ? null : o?.orderId)}
                      className="mb-2 w-full rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
                    >
                      {isExpanded ? "Hide details" : "View details"}
                    </button>
                    <label className="text-sm font-medium">Update status</label>
                    <select
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-60"
                      value={o?.status ?? "PENDING"}
                      onChange={(e) => onStatusChange(o?.orderId, e.target.value)}
                      disabled={savingId === o?.orderId}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {unpaid ? (
                      <p className="mt-1 text-xs text-slate-500">Until payment is PAID, only PENDING or CANCELLED is available. Ship/deliver unlock after payment.</p>
                    ) : null}
                    {savingId === o?.orderId ? (
                      <div className="mt-2">
                        <Spinner label="Updating..." />
                      </div>
                    ) : null}
                  </div>
                </div>

                {isExpanded ? (
                  <div className="mt-4 rounded-lg border bg-slate-50 p-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <div className="text-xs text-slate-500">Order ID</div>
                        <div className="font-semibold">#{o?.orderId}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Customer</div>
                        <div className="font-semibold">{o?.customerName || "-"}</div>
                        <div className="text-xs text-slate-600">{o?.customerEmail || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Order Date</div>
                        <div className="font-semibold">{formatDateTime(o?.createdAt)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Payment</div>
                        <div className="font-semibold">{o?.paymentStatus || "-"}</div>
                        <div className="text-xs text-slate-600">Status: {o?.status || "-"}</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-semibold">Items</div>
                      <div className="mt-2 divide-y rounded-lg border bg-white">
                        {(o?.items ?? []).map((it, idx) => (
                          <div key={it?.id ?? idx} className="flex items-center justify-between px-3 py-2 text-sm">
                            <div className="min-w-0">
                              <div className="truncate font-medium">{it?.bookTitle}</div>
                              <div className="text-xs text-slate-500">Qty: {it?.quantity}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{money(it?.priceAtPurchase)}</div>
                              <div className="text-xs text-slate-500">
                                Subtotal: {money((Number(it?.priceAtPurchase) || 0) * (Number(it?.quantity) || 0))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-lg border bg-white px-3 py-2">
                      <div className="text-sm text-slate-600">Total items: {(o?.items ?? []).reduce((acc, it) => acc + (Number(it?.quantity) || 0), 0)}</div>
                      <div className="text-base font-bold">Order total: {money(o?.totalAmount)}</div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
