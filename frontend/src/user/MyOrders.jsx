import { useCallback, useEffect, useState } from "react";
import Alert from "../components/Alert.jsx";
import Spinner from "../components/Spinner.jsx";
import { myOrders, payDemo } from "../services/orderService.js";
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
    "Failed."
  );
}

export default function MyOrders() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orders, setOrders] = useState([]);
  const [payingId, setPayingId] = useState(null);
  const [live, setLive] = useState(false);
  const [simulateDecline, setSimulateDecline] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const list = await myOrders();
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

  async function onPay(orderId) {
    setPayingId(orderId);
    setError("");
    setSuccess("");
    try {
      await payDemo(orderId, { simulateFailure: simulateDecline });
      setSuccess(`Demo payment completed for order #${orderId}. Stock is updated; fulfillment status appears below.`);
      setSimulateDecline(false);
      await load();
    } catch (err) {
      setError(apiErr(err));
    } finally {
      setPayingId(null);
    }
  }

  return (
    <div>
      <div className="section-surface mb-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">📋 My Orders</h1>
            <p className="mt-1 text-sm font-medium text-slate-700">Your order history. List refreshes when orders change (WebSocket).</p>
          </div>
          {live ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">✓ Live update</span>
          ) : null}
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
          <Alert type="success" title="Demo payment">
            {success}
          </Alert>
        </div>
      ) : null}

      {orders.some((o) => String(o?.paymentStatus || "").toUpperCase() === "PENDING") ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="text-sm font-semibold text-amber-950">Demo checkout (no real card)</div>
          <p className="mt-1 text-xs text-amber-900/90">
            Unpaid orders use a simulated payment: tap <strong>Pay (demo)</strong> on an order. The server applies a short delay (
            <span className="font-mono">demo.payment.delay-ms</span>) then marks the order <strong>PAID</strong> and reduces inventory.
          </p>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-amber-950">
            <input type="checkbox" checked={simulateDecline} onChange={(e) => setSimulateDecline(e.target.checked)} />
            Simulate declined card (API returns 409; no charge, stock unchanged)
          </label>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-10 flex justify-center">
          <Spinner label="Loading orders..." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.length === 0 ? (
            <Alert title="No orders yet">Place an order from the dashboard to see it here.</Alert>
          ) : null}

          {orders.map((o) => {
            const unpaid = String(o?.paymentStatus || "").toUpperCase() === "PENDING";
            return (
              <div key={o?.orderId} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm text-slate-600">Order</div>
                    <div className="font-semibold">#{o?.orderId}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-3 py-1">Status: {o?.status}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">Payment: {o?.paymentStatus}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">Total: {money(o?.totalAmount)}</span>
                    {unpaid ? (
                      <button
                        type="button"
                        disabled={payingId === o.orderId}
                        className="rounded-full bg-amber-600 px-3 py-1 font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                        onClick={() => onPay(o.orderId)}
                      >
                        {payingId === o.orderId ? "Paying…" : "Pay (demo)"}
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-sm font-semibold">Items</div>
                  <div className="mt-2 divide-y rounded-lg border">
                    {(o?.items ?? []).map((it, idx) => (
                        <div key={it?.id ?? idx} className="flex items-center justify-between px-3 py-2 text-sm">
                        <div className="min-w-0">
                          <div className="truncate font-medium">{it?.bookTitle}</div>
                          <div className="text-xs text-slate-500">Qty: {it?.quantity}</div>
                        </div>
                        <div className="text-sm font-medium">{money(it?.priceAtPurchase)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
