import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Spinner from "../components/Spinner.jsx";
import Alert from "../components/Alert.jsx";
import BookCard from "../components/BookCard.jsx";
import { listBooks, searchBooks, fetchGenres } from "../services/bookService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

export default function PublicBooks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [books, setBooks] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 8, totalPages: 0 });
  const [keyword, setKeyword] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);

  const canEnterApp = useMemo(
    () => isAuthenticated && (role === "ROLE_USER" || role === "ROLE_ADMIN"),
    [isAuthenticated, role]
  );
  const queryQ = (searchParams.get("q") || "").trim();

  async function runKeywordSearch(term) {
    setLoading(true);
    setError("");
    try {
      const res = await searchBooks(term);
      setBooks(res?.data ?? []);
      setPageInfo((s) => ({ ...s, totalPages: 0, page: 0 }));
    } catch (err) {
      setError(getApiErrorMessage(err, "Search failed."));
    } finally {
      setLoading(false);
    }
  }

  async function loadPage(p = 0) {
    setLoading(true);
    setError("");
    try {
      const data = await listBooks({ page: p, size: pageInfo.size, genre: genre || undefined });
      setBooks(data?.content ?? []);
      setPageInfo((s) => ({
        ...s,
        page: data?.number ?? p,
        totalPages: data?.totalPages ?? 0,
      }));
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load products."));
    } finally {
      setLoading(false);
    }
  }

  async function onSearch(e) {
    e.preventDefault();
    const term = keyword.trim();
    if (!term) {
      setSearchParams({});
      await loadPage(0);
      return;
    }
    setSearchParams({ q: term });
    await runKeywordSearch(term);
  }

  useEffect(() => {
    fetchGenres()
      .then((g) => setGenres(Array.isArray(g) ? g : []))
      .catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    if (queryQ) {
      setKeyword(queryQ);
      runKeywordSearch(queryQ);
      return;
    }
    loadPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genre, queryQ]);

  return (
    <div className="app-shell-bg flex min-h-full flex-col">
      <Navbar variant="public" />
      <main className="container-page flex-1 py-6">
        <div className="section-surface fade-in-up">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Books Store</p>
              <h1 className="panel-title text-2xl font-bold text-slate-900">All Books</h1>
              <p className="text-sm font-medium text-slate-600">Filter, search, and compare offers.</p>
            </div>
            {canEnterApp ? (
              <Link
                to={role === "ROLE_ADMIN" ? "/admin" : "/dashboard"}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Go to {role === "ROLE_ADMIN" ? "Admin" : "Dashboard"}
              </Link>
            ) : null}
          </div>

          <form onSubmit={onSearch} className="mt-5 grid gap-3 lg:grid-cols-[1fr_1.2fr_auto_auto] lg:items-end">
            <label>
              <span className="mb-1 block text-sm font-semibold text-slate-700">Category</span>
              <select
                className="input-modern w-full"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                <option value="">All categories</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1 block text-sm font-semibold text-slate-700">Search</span>
              <input
                className="input-modern w-full"
                placeholder="Search by title, author, ISBN, or category"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </label>

            <button className="h-[42px] self-end rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Search
            </button>
            <button
              type="button"
              className="h-[42px] self-end rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              onClick={() => {
                setKeyword("");
                setGenre("");
                setSearchParams({});
                loadPage(0);
              }}
            >
              Reset
            </button>
          </form>

        </div>

        {error ? (
          <div className="mt-4">
            <Alert type="error" title="Error">
              {error}
            </Alert>
          </div>
        ) : null}

        {loading ? (
          <div className="section-surface mt-6 flex justify-center py-10">
            <Spinner label="Loading products..." />
          </div>
        ) : books?.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books?.map((b, idx) => (
              <BookCard key={b?.id ?? b?.isbn ?? idx} book={b} to={b?.id ? `/product/${b.id}` : undefined} />
            ))}
          </div>
        ) : (
          <div className="section-surface mt-6 text-center text-sm font-semibold text-rose-700">
            No books matched your filters.
          </div>
        )}

        {pageInfo.totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-50"
              disabled={pageInfo.page <= 0}
              onClick={() => loadPage(pageInfo.page - 1)}
              type="button"
            >
              Prev
            </button>
            <div className="text-sm font-medium text-slate-700">
              Page <span className="font-bold text-slate-900">{pageInfo.page + 1}</span> of {pageInfo.totalPages}
            </div>
            <button
              className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-50"
              disabled={pageInfo.page + 1 >= pageInfo.totalPages}
              onClick={() => loadPage(pageInfo.page + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
