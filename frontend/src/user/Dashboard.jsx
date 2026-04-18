import { useEffect, useState } from "react";
import Alert from "../components/Alert.jsx";
import BookCard from "../components/BookCard.jsx";
import Spinner from "../components/Spinner.jsx";
import { listBooks, searchBooks, fetchGenres } from "../services/bookService.js";
import { getProfile } from "../services/userService.js";
import { getApiErrorMessage } from "../utils/apiError.js";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [books, setBooks] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [userName, setUserName] = useState("");
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 9, totalPages: 0 });
  const [refreshTick, setRefreshTick] = useState(0);

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
    setLoading(true);
    setError("");
    try {
      const res = await searchBooks(keyword);
      setBooks(res?.data ?? []);
      setPageInfo((s) => ({ ...s, totalPages: 0, page: 0 }));
    } catch (err) {
      setError(getApiErrorMessage(err, "Search failed."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGenres()
      .then((g) => setGenres(Array.isArray(g) ? g : []))
      .catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadProfileName() {
      try {
        const profile = await getProfile();
        if (!cancelled) setUserName(profile?.name ?? "");
      } catch {
        if (!cancelled) setUserName("");
      }
    }
    loadProfileName();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genre, refreshTick]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTick((n) => n + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <div className="section-surface fade-in-up mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">My Account</p>
          <h1 className="panel-title text-2xl font-bold text-slate-900">
            {userName ? `Welcome back, ${userName}!` : "Welcome back!"}
          </h1>
        </div>

        <form onSubmit={onSearch} className="mt-5 grid gap-3 lg:grid-cols-[1fr_1.2fr_auto_auto] lg:items-end">
          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">Genre</span>
            <select
              className="input-modern w-full"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              <option value="">All genres</option>
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
              placeholder="Search by title or author"
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
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books?.map((b, idx) => (
            <BookCard key={b?.id ?? b?.isbn ?? idx} book={b} to={b?.id ? `/product/${b.id}` : undefined} />
          ))}
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

    </div>
  );
}

