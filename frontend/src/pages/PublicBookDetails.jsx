import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import Spinner from "../components/Spinner.jsx";
import RatingStars from "../components/RatingStars.jsx";
import ProductReviews from "../components/ProductReviews.jsx";
import Navbar from "../components/Navbar.jsx";
import { getBook } from "../services/bookService.js";
import { getProductReviewStats } from "../services/reviewService.js";
import { addToCart } from "../services/cartService.js";
import { addToWishlist, removeFromWishlist, wishlistContains } from "../services/wishlistService.js";
import { useAuth } from "../context/AuthContext.jsx";
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

export default function PublicBookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [book, setBook] = useState(null);
  const [qty, setQty] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [reviewStats, setReviewStats] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);

  const maxQty = useMemo(() => {
    const stock = book?.stock;
    if (stock == null) return 99;
    const n = typeof stock === "number" ? stock : Number(stock);
    return Number.isFinite(n) ? Math.max(0, n) : 99;
  }, [book]);
  const inStock = (Number(book?.stock) || 0) > 0;
  const stockCount = Number(book?.stock) || 0;
  const sellingPrice = Number(book?.price) || 0;
  const mrp = sellingPrice > 0 ? sellingPrice * 1.18 : 0;
  const savings = Math.max(0, mrp - sellingPrice);
  const coverImage = sanitizeImageUrl(book?.imageUrl);
  const coverInitials = (book?.title || "NA")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
  const galleryItems = useMemo(
    () => [
      { key: "cover", kind: "image", label: "Cover view", src: coverImage },
      { key: "format", kind: "tile", label: "Reading format", value: inStock ? "Ready to ship" : "Unavailable" },
      { key: "category", kind: "tile", label: "Category", value: book?.genre || "Popular read" },
      { key: "delivery", kind: "tile", label: "Delivery", value: inStock ? "Ships soon" : "Check back later" },
    ],
    [book?.genre, coverImage, inStock]
  );
  const detailHighlights = [
    `Author: ${book?.authors || "Unknown"}`,
    `Category: ${book?.genre || "General"}`,
    `SKU: ${book?.isbn || "N/A"}`,
    "Format: Physical + Digital support",
    "Returns: 7-day easy return",
    "Delivery: Standard and express available",
  ];
  const deliveryNotes = [
    inStock ? "Usually ships in 1-2 days" : "Currently unavailable for delivery",
    "Tracked delivery with secure packaging",
    "Standard and express options available",
  ];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const b = await getBook(id);
        if (cancelled) return;
        setImageFailed(false);
        setBook(b && typeof b === "object" ? b : null);
        if (b?.id) {
          try {
            const [w, stats] = await Promise.all([
              isAuthenticated ? wishlistContains(b.id) : Promise.resolve(false),
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
        setError(err?.message || "Failed to load book.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated]);

  async function onAddToCart() {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    if (qty < 1 || qty > 999) return;
    setAddingToCart(true);
    setError("");
    try {
      await addToCart(Number(id), Number(qty));
      setSuccess(`Added ${qty} item(s) to cart!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(apiErr(err));
    } finally {
      setAddingToCart(false);
    }
  }

  async function toggleWishlist() {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
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
        <Spinner label="Loading book..." />
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="space-y-4">
        <Alert type="error" title="Error">
          {error}
        </Alert>
        <Link className="text-sm font-medium text-slate-900 hover:underline" to="/shop">
          ← Back to shop
        </Link>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="space-y-4">
        <Alert type="error" title="Not found">
          Book not found.
        </Alert>
        <Link className="text-sm font-medium text-slate-900 hover:underline" to="/shop">
          ← Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Navbar variant="public" />
      <main className="container-page flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-4">
            <Link className="text-sm font-medium text-slate-900 hover:underline" to="/shop">
              ← Back to shop
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_0.95fr] lg:items-start">
            <div className="space-y-6 self-start">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                      <div className="relative aspect-[4/5] w-full">
                        {coverImage && !imageFailed ? (
                          <img
                            src={coverImage}
                            alt={book?.title ?? "Book"}
                            className="h-full w-full object-cover"
                            onError={() => setImageFailed(true)}
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 px-4 text-center">
                            <div className="rounded-2xl bg-white/80 px-4 py-3 text-2xl font-bold tracking-wide text-slate-700 shadow-sm">
                              {coverInitials || "NA"}
                            </div>
                            <div className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                              Book image not available
                            </div>
                          </div>
                        )}
                        <div className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                          {inStock ? "In stock" : "Out of stock"}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {galleryItems.map((item) => (
                        <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          {item.kind === "image" && item.src && !imageFailed ? (
                            <img
                              src={item.src}
                              alt={item.label}
                              className="h-20 w-full rounded-xl object-cover"
                              onError={() => setImageFailed(true)}
                            />
                          ) : (
                            <div className="flex h-20 items-center justify-center rounded-xl bg-white px-3 text-center text-sm font-semibold text-slate-700">
                              {item.value}
                            </div>
                          )}
                          <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Featured book</p>
                    <h1 className="mt-2 text-3xl font-extrabold leading-tight text-slate-900">{book?.title}</h1>
                    <div className="mt-2 text-lg text-slate-600">{book?.authors}</div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      {book?.genre ? <span className="soft-pill bg-slate-100 px-3 py-1 text-slate-700">Category: {book.genre}</span> : null}
                      {book?.isbn ? <span className="soft-pill bg-slate-100 px-3 py-1 text-slate-700">SKU: {book.isbn}</span> : null}
                      <span className={`soft-pill px-3 py-1 ${inStock ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                        {inStock ? "In Stock" : "Unavailable"}
                      </span>
                      <span className="soft-pill bg-blue-100 px-3 py-1 text-blue-800">Fast dispatch</span>
                    </div>

                    <div className="mt-5 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Price</div>
                      <div className="mt-4 flex flex-wrap items-end gap-3">
                        <div className="text-4xl font-black text-slate-900">{money(sellingPrice)}</div>
                        {mrp > sellingPrice ? <div className="pb-1 text-sm text-slate-500 line-through">{money(mrp)}</div> : null}
                        {savings > 0 ? (
                          <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                            Save {money(savings)}
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
                        <div className="font-semibold">Best value today</div>
                        <div className="mt-1 text-xs text-blue-700">Limited-time pricing with quick delivery support.</div>
                      </div>
                      {reviewStats && (reviewStats.averageRating || reviewStats.reviewCount) ? (
                        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                          <RatingStars rating={reviewStats.averageRating || 0} />
                          <span className="text-sm text-slate-600">
                            {reviewStats.averageRating ? `${Number(reviewStats.averageRating).toFixed(1)} average` : "No rating yet"}
                            {reviewStats.reviewCount != null ? ` · ${reviewStats.reviewCount || 0} review${reviewStats.reviewCount === 1 ? "" : "s"}` : ""}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                        <div className="font-semibold text-slate-900">Delivery</div>
                        <div className="mt-1 text-slate-600">{deliveryNotes[0]}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                        <div className="font-semibold text-slate-900">Returns</div>
                        <div className="mt-1 text-slate-600">7-day easy return</div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                        <div className="font-semibold text-slate-900">Support</div>
                        <div className="mt-1 text-slate-600">Tracked shipping and secure packing</div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border bg-white p-4">
                      <h3 className="text-sm font-semibold text-slate-900">Book Description</h3>
                      <div className="mt-2 text-sm leading-6 text-slate-700">{book?.description || "No description available for this book yet."}</div>
                    </div>

                    <div className="mt-4 rounded-2xl border bg-white p-4">
                      <h3 className="text-sm font-semibold text-slate-900">Book Details</h3>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {detailHighlights.map((item, idx) => (
                          <div key={idx} className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 self-start lg:sticky lg:top-6">
              {error ? <Alert type="error" title="Error">{error}</Alert> : null}
              {success ? <Alert type="success" title="Success">{success}</Alert> : null}

              <div className="rounded-3xl border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900">Buy now</h2>
                    <p className="mt-1 text-sm leading-5 text-slate-600">Clear pricing, visible stock, and fast checkout.</p>
                  </div>
                  <div
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      inStock ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {inStock ? "Available" : "Sold out"}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Delivery info</div>
                  <div className="mt-2 space-y-2 text-sm text-slate-700">
                    {deliveryNotes.map((note) => (
                      <div key={note} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max={maxQty}
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, Math.min(maxQty, Number(e.target.value) || 1)))}
                      className="input-modern mt-1"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={onAddToCart}
                      disabled={addingToCart || qty < 1 || qty > maxQty}
                      className="btn-primary w-full justify-center text-sm font-semibold"
                    >
                      {addingToCart ? "Adding..." : "Add to Cart"}
                    </button>
                    <button
                      onClick={onCheckout}
                      disabled={qty < 1 || qty > maxQty}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {`Buy Now • ${money((book?.price || 0) * qty)}`}
                    </button>
                  </div>
                  <button
                    onClick={toggleWishlist}
                    disabled={wishBusy}
                    className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      inWishlist
                        ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {wishBusy ? "Updating..." : inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Quick facts</h2>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    Standard delivery and easy returns are included with the purchase flow.
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    Checkout remains available for authenticated users, with order status updates after payment.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="section-surface mt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Reviews</h2>
                <p className="text-sm text-slate-600">Customer feedback and ratings for this book.</p>
              </div>
            </div>
            <ProductReviews productId={id} />
          </div>
        </div>
      </main>
    </div>
  );
}