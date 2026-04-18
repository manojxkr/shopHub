import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import Spinner from "../components/Spinner.jsx";
import RatingStars from "../components/RatingStars.jsx";
import ProductReviews from "../components/ProductReviews.jsx";
import { getBook } from "../services/bookService.js";
import { getProductReviewStats } from "../services/reviewService.js";
import { addToCart } from "../services/cartService.js";
import { addToWishlist, removeFromWishlist, wishlistContains } from "../services/wishlistService.js";
import { sanitizeImageUrl } from "../utils/imageUrl.js";

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

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [book, setBook] = useState(null);
  const [qty, setQty] = useState(1);
  const [cartQty, setCartQty] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [reviewStats, setReviewStats] = useState(null);

  const maxQty = useMemo(() => {
    const stock = book?.stock;
    if (stock == null) return 99;
    const n = typeof stock === "number" ? stock : Number(stock);
    return Number.isFinite(n) ? Math.max(0, n) : 99;
  }, [book]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const b = await getBook(id);
        if (cancelled) return;
        setBook(b && typeof b === "object" ? b : null);
        if (b?.id) {
          try {
            const [w, stats] = await Promise.all([
              wishlistContains(b.id),
              getProductReviewStats(b.id),
            ]);
            if (!cancelled) {
              setInWishlist(w);
              setReviewStats(stats || {});
            }
          } catch {
            if (!cancelled) {
              setInWishlist(false);
              setReviewStats({});
            }
          }
        }
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || "Failed to load product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function onAddToCart() {
    if (cartQty < 1 || cartQty > 999) return;
    setAddingToCart(true);
    setError("");
    try {
      await addToCart(Number(id), Number(cartQty));
      setSuccess(`Added ${cartQty} item(s) to cart!`);
      setCartQty(1);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(apiErr(err));
    } finally {
      setAddingToCart(false);
    }
  }

  async function toggleWishlist() {
    if (!id) return;
    setWishBusy(true);
    setError("");
    try {
      if (inWishlist) {
        await removeFromWishlist(Number(id));
        setInWishlist(false);
      } else {
        await addToWishlist(Number(id));
        setInWishlist(true);
      }
    } catch (err) {
      setError(apiErr(err));
    } finally {
      setWishBusy(false);
    }
  }

  function onCheckout() {
    navigate("/checkout", {
      state: {
        items: [
          {
            bookId: Number(id),
            quantity: Number(qty),
            title: book?.title,
            authors: book?.authors,
            price: book?.price,
            imageUrl: book?.imageUrl,
          },
        ],
      },
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner label="Loading product..." />
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="space-y-4">
        <Alert type="error" title="Error">
          {error}
        </Alert>
        <Link className="text-sm font-medium text-slate-900 hover:underline" to="/dashboard">
          ← Back to products
        </Link>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="space-y-4">
        <Alert type="error" title="Not found">
          Product not found.
        </Alert>
        <Link className="text-sm font-medium text-slate-900 hover:underline" to="/dashboard">
          ← Back to products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Link className="text-sm font-medium text-slate-900 hover:underline" to="/dashboard">
          ← Back
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {sanitizeImageUrl(book?.imageUrl) ? <img src={sanitizeImageUrl(book?.imageUrl)} alt={book?.title ?? "Product"} className="h-full w-full object-cover" /> : null}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold">{book?.title}</h1>
              <div className="text-sm text-slate-600">{book?.authors}</div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {book?.genre ? <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Category: {book.genre}</span> : null}
                {book?.isbn ? <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">SKU: {book.isbn}</span> : null}
                {book?.stock != null ? <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Stock: {book.stock}</span> : null}
              </div>
            </div>
          </div>

          {book?.description ? (
            <div className="mt-5">
              <div className="text-sm font-semibold">Description</div>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{book.description}</div>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-600">Price</div>
          <div className="text-2xl font-bold">{money(book?.price)}</div>

          {reviewStats && (
            <div className="mt-3">
              <RatingStars
                rating={reviewStats.averageRating}
                count={reviewStats.reviewCount}
                size="sm"
              />
            </div>
          )}

          {success ? (
            <div className="mt-4">
              <Alert type="success" title="Success">
                {success}
              </Alert>
            </div>
          ) : null}
          {error ? (
            <div className="mt-4">
              <Alert type="error" title="Error">
                {error}
              </Alert>
            </div>
          ) : null}

          <div className="mt-4 space-y-2">
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                type="number"
                min={1}
                max={999}
                value={cartQty}
                onChange={(e) => setCartQty(e.target.value)}
                disabled={addingToCart}
              />
            </div>
            <button
              disabled={addingToCart || maxQty === 0}
              className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              onClick={onAddToCart}
              type="button"
            >
              {addingToCart ? (
                <Spinner label="Adding..." />
              ) : maxQty === 0 ? (
                "Out of stock"
              ) : (
                "🛒 Add to Cart"
              )}
            </button>
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="text-sm font-semibold mb-2">Or place direct order:</div>
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                type="number"
                min={1}
                max={maxQty || 99}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                disabled={false}
              />
            </div>

            <button
              disabled={maxQty === 0}
              className="mt-2 w-full rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
              onClick={onCheckout}
              type="button"
            >
              {maxQty === 0 ? "Out of stock" : "Checkout directly"}
            </button>
          </div>

          <button
            type="button"
            disabled={wishBusy}
            className="mt-3 w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-red-200 hover:bg-red-50 disabled:opacity-60"
            onClick={toggleWishlist}
          >
            {wishBusy ? "Updating…" : inWishlist ? "💔 Remove from wishlist" : "🤍 Save to wishlist"}
          </button>
        </div>
      </div>

      {book && <ProductReviews productId={book.id} />}
    </div>
  );
}
