import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import Spinner from "../components/Spinner.jsx";
import { payDemo, placeOrder } from "../services/orderService.js";

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
    "Something went wrong."
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialItems = useMemo(() => {
    const items = location.state?.items;
    return Array.isArray(items) ? items.filter((item) => item?.bookId) : [];
  }, [location.state]);
  const [items] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [simulateDecline, setSimulateDecline] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [items]
  );
  const shipping = items.length > 0 ? 0 : 0;
  const total = subtotal + shipping;

  async function onStartCheckout() {
    if (!items.length) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const order = await placeOrder(items.map((item) => ({ bookId: Number(item.bookId), quantity: Number(item.quantity) })));
      const oid = order?.orderId;
      if (!oid) {
        throw new Error("Order created but order id was missing in the response.");
      }
      setOrderId(oid);
      setSuccess(`Order #${oid} created. Continue to demo payment below.`);
    } catch (err) {
      setError(apiErr(err));
    } finally {
      setLoading(false);
    }
  }

  async function onPay() {
    if (!orderId) return;
    setPaying(true);
    setError("");
    setSuccess("");
    try {
      await payDemo(orderId, { simulateFailure: simulateDecline });
      setSuccess("Demo payment successful. Redirecting to your orders…");
      setTimeout(() => navigate("/my-orders"), 900);
    } catch (err) {
      setError(apiErr(err));
    } finally {
      setPaying(false);
    }
  }

  if (!items.length) {
    return (
      <div className="section-surface space-y-4">
        <Alert type="error" title="Checkout unavailable">
          No items were passed to checkout. Start from a product page or your cart.
        </Alert>
        <div className="flex flex-wrap gap-3">
          <Link className="btn-primary" to="/shop">
            Continue shopping
          </Link>
          <Link className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900" to="/cart">
            Go to cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-surface space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
          <p className="mt-1 text-sm text-slate-600">Review your order, then complete the demo payment.</p>
        </div>
        <Link className="text-sm font-semibold text-slate-700 hover:underline" to="/cart">
          Back to cart
        </Link>
      </div>

      {error ? (
        <Alert type="error" title="Error">
          {error}
        </Alert>
      ) : null}

      {success ? (
        <Alert type="success" title="Checkout status">
          {success}
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.55fr_0.9fr] lg:items-start">
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
            <div className="mt-4 space-y-4">
              {items.map((item) => (
                <div key={item.bookId} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-xs font-semibold text-slate-500">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title ?? "Book"} className="h-full w-full object-cover" />
                    ) : (
                      "Book"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-slate-900">{item.title ?? "Selected book"}</div>
                    <div className="text-sm text-slate-600">{item.authors ?? "Unknown author"}</div>
                    <div className="mt-1 text-xs text-slate-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-right text-sm font-semibold text-slate-900">
                    {money(Number(item.price || 0) * Number(item.quantity || 0))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Payment</h2>
            <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-950">
              <div className="font-semibold">Demo checkout only</div>
              <div className="mt-1 text-xs text-amber-900/90">
                This will create the order, then simulate a short payment delay and mark the order paid.
              </div>
            </div>
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={simulateDecline}
                onChange={(e) => setSimulateDecline(e.target.checked)}
                className="rounded border-slate-300"
              />
              Simulate declined card
            </label>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onStartCheckout}
                disabled={loading || paying}
                className="btn-primary"
              >
                {loading ? <Spinner label="Creating order..." /> : orderId ? "Recreate order" : "Place order"}
              </button>
              <button
                type="button"
                onClick={onPay}
                disabled={!orderId || loading || paying}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paying ? "Processing payment..." : "Pay with demo card"}
              </button>
            </div>
          </div>
        </div>

        <div className="sticky top-6 space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Items</span>
                <span>{items.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : money(shipping)}</span>
              </div>
              <div className="border-t pt-3 text-base font-semibold text-slate-900 flex items-center justify-between">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
            </div>
          </div>

          {orderId ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-950 shadow-sm">
              <div className="font-semibold">Order ready</div>
              <div className="mt-1">
                Order <span className="font-mono">#{orderId}</span> is waiting for demo payment.
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border bg-slate-50 p-5 text-sm text-slate-700 shadow-sm">
              Tap <span className="font-semibold">Place order</span> to create the order, then complete demo payment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}