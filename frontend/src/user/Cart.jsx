import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import Spinner from "../components/Spinner.jsx";
import { getCart, updateCartItem, removeFromCart, clearCart } from "../services/cartService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { sanitizeImageUrl } from "../utils/imageUrl.js";

function money(n) {
  if (n == null) return "-";
  const v = typeof n === "number" ? n : Number(n);
  if (Number.isNaN(v)) return String(n);
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v);
}

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function normalizeCart(raw) {
    const c = raw?.data ?? raw ?? null;
    if (!c) return null;
    const items = Array.isArray(c.items)
      ? c.items
      : Array.isArray(c.cartItems)
      ? c.cartItems
      : [];
    return { ...c, items };
  }

  async function loadCart() {
    setLoading(true);
    setError("");
    try {
      const data = await getCart();
      setCart(normalizeCart(data));
    } catch (err) {
      setError(err?.message || "Failed to load cart.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/cart" } } });
      return;
    }
    loadCart();
  }, [isAuthenticated, navigate]);

  async function onUpdateQuantity(itemId, quantity) {
    if (quantity < 1 || quantity > 999) return;
    setUpdating(itemId);
    setError("");
    try {
      const data = await updateCartItem(itemId, quantity);
      setCart(normalizeCart(data));
      setSuccess("Cart updated.");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err?.message || "Failed to update cart.");
    } finally {
      setUpdating(null);
    }
  }

  async function onRemoveItem(itemId) {
    setError("");
    try {
      const data = await removeFromCart(itemId);
      setCart(normalizeCart(data));
      setSuccess("Item removed from cart.");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err?.message || "Failed to remove item.");
    }
  }

  async function onClearCart() {
    if (!confirm("Clear all items from cart?")) return;
    setError("");
    try {
      await clearCart();
      setCart(null);
      setSuccess("Cart cleared.");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err?.message || "Failed to clear cart.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner label="Loading cart..." />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-blue-50/50 to-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>
          <p className="text-sm text-slate-600">Review and manage your items before checkout.</p>
          {cart?.items?.length > 0 ? (
            <div className="mt-1 text-xs font-medium text-slate-500">
              {cart.items.length} item{cart.items.length === 1 ? "" : "s"} in cart
            </div>
          ) : null}
        </div>
        {cart?.items?.length > 0 && (
          <button
            onClick={onClearCart}
            className="inline-flex items-center justify-center rounded-lg bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-200"
          >
            Clear cart
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4">
          <Alert type="error" title="Error">
            {error}
          </Alert>
        </div>
      )}

      {success && (
        <div className="mt-4">
          <Alert type="success" title="Success">
            {success}
          </Alert>
        </div>
      )}

      {!cart?.items || cart.items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
          <div className="font-semibold text-amber-900">Your cart is empty</div>
          <p className="mt-2 text-sm text-amber-800">Add products to your cart to get started.</p>
          <Link
            to="/dashboard"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow">
                <div className="flex gap-4">
                  {sanitizeImageUrl(item.book?.imageUrl) && (
                    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <img
                        src={sanitizeImageUrl(item.book?.imageUrl)}
                        alt={item.book?.title ?? "Product"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link to={`/product/${item.book?.id}`} className="font-semibold text-slate-900 hover:underline">
                      {item.book?.title ?? "Product"}
                    </Link>
                    <div className="text-sm text-slate-600">{item.book?.authors ?? "Unknown brand"}</div>
                    <div className="mt-1 text-sm font-medium text-slate-900">{money(item.book?.price)}</div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <button
                          disabled={updating === item.id || item.quantity <= 1}
                          onClick={() => onUpdateQuantity(Number(item.id), item.quantity - 1)}
                          className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-800 hover:bg-slate-200 disabled:opacity-50"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={item.quantity}
                          onChange={(e) => onUpdateQuantity(Number(item.id), Number(e.target.value))}
                          disabled={updating === item.id}
                          className="w-12 rounded border border-slate-300 bg-white px-2 py-1 text-center text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
                        />
                        <button
                          disabled={updating === item.id || item.quantity >= 999}
                          onClick={() => onUpdateQuantity(Number(item.id), item.quantity + 1)}
                          className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-800 hover:bg-slate-200 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {item.book?.stock != null
                          ? item.book.stock > 0
                            ? `${item.book.stock} in stock`
                            : "Out of stock"
                          : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-900">{money(item.book?.price * item.quantity)}</div>
                      <button
                        onClick={() => onRemoveItem(Number(item.id))}
                        className="mt-1 text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-600">Subtotal</div>
            <div className="text-2xl font-bold text-slate-900">{money(cart.totalPrice)}</div>
            <div className="mt-1 text-xs text-slate-500">Shipping and taxes calculated at checkout</div>

            <button
              onClick={() =>
                navigate("/checkout", {
                  state: {
                    items: (cart.items ?? []).map((item) => ({
                      bookId: Number(item?.book?.id),
                      quantity: Number(item?.quantity) || 1,
                      title: item?.book?.title,
                      authors: item?.book?.authors,
                      price: item?.book?.price,
                      imageUrl: item?.book?.imageUrl,
                    })),
                  },
                })
              }
              disabled={!cart.items || cart.items.length === 0}
              className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Proceed to checkout
            </button>

            <Link
              to="/dashboard"
              className="mt-2 block w-full rounded-lg border bg-white px-4 py-2 text-center text-sm font-medium ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
