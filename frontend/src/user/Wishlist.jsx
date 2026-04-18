import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import Spinner from "../components/Spinner.jsx";
import BookCard from "../components/BookCard.jsx";
import { listWishlist, removeFromWishlist } from "../services/wishlistService.js";

export default function Wishlist() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [books, setBooks] = useState([]);
  const [busyId, setBusyId] = useState(null);

  function getBookId(book) {
    return Number(book?.id ?? book?.bookId ?? 0) || null;
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await listWishlist();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load wishlist.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onRemove(bookId) {
    setBusyId(bookId);
    setError("");
    try {
      await removeFromWishlist(bookId);
      setBooks((prev) => prev.filter((b) => getBookId(b) !== bookId));
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Could not remove from wishlist.";
      setError(msg);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading wishlist..." />
      </div>
    );
  }

  return (
    <div>
      <div className="section-surface mb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">❤️ Wishlist</h1>
            <p className="mt-1 text-sm font-medium text-slate-700">Books you saved to buy later.</p>
            {books.length > 0 ? (
              <div className="mt-2 text-sm font-semibold text-slate-800">
                {books.length} saved book{books.length === 1 ? "" : "s"}
              </div>
            ) : null}
          </div>
          <Link
            className="btn-primary inline-flex items-center justify-center px-4 py-2 text-sm font-semibold"
            to="/dashboard"
          >
            Back to books
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mt-4">
          <Alert type="error" title="Error">
            {error}
          </Alert>
        </div>
      ) : null}

      {!books.length ? (
        <p className="mt-8 text-sm text-slate-600">Your wishlist is empty. Browse books and tap “Save to wishlist”.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((b, idx) => (
            <div key={getBookId(b) ?? idx} className="relative">
              <BookCard book={b} to={getBookId(b) ? `/product/${getBookId(b)}` : undefined} />
              <button
                type="button"
                disabled={busyId === getBookId(b)}
                className="mt-2 w-full rounded-lg bg-white px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-50 disabled:opacity-50"
                onClick={() => getBookId(b) && onRemove(getBookId(b))}
              >
                {busyId === getBookId(b) ? "Removing…" : "Remove from wishlist"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
