import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import BookCard from "../components/BookCard.jsx";
import Spinner from "../components/Spinner.jsx";
import Alert from "../components/Alert.jsx";
import { listBooks, searchBooks, fetchGenres } from "../services/bookService.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function CategoryBrowse() {
  const { isAuthenticated, role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("genre") || "");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [activeSearch, setActiveSearch] = useState(searchParams.get("search") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [refreshTick, setRefreshTick] = useState(0);

  const canViewDetails = isAuthenticated && role === "ROLE_USER";

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const categoriesPromise = fetchGenres();

        let productsData;
        if (activeSearch) {
          const result = await searchBooks(activeSearch);
          const allResults = result?.data ?? result ?? [];
          const filteredResults = Array.isArray(allResults)
            ? allResults
            : Array.isArray(allResults?.content)
            ? allResults.content
            : [];
          productsData = {
            content: selectedCategory
              ? filteredResults.filter((item) => item?.genre === selectedCategory)
              : filteredResults,
          };
        } else {
          productsData = await listBooks({
            page: 0,
            size: 48,
            genre: selectedCategory || undefined,
            sortBy,
            direction: sortDirection,
          });
        }

        const categoriesData = await categoriesPromise;
        setProducts(productsData?.content ?? []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        setError(err?.message || "Failed to load products.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [selectedCategory, sortBy, sortDirection, activeSearch, refreshTick]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTick((n) => n + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleCategorySelect = (category) => {
    const nextCategory = category === selectedCategory ? "" : category;
    setSelectedCategory(nextCategory);
    const params = {};
    if (nextCategory) params.genre = nextCategory;
    if (activeSearch) params.search = activeSearch;
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    setActiveSearch(trimmed);
    const params = {};
    if (selectedCategory) params.genre = selectedCategory;
    if (trimmed) params.search = trimmed;
    setSearchParams(params);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setActiveSearch("");
    const params = {};
    if (selectedCategory) params.genre = selectedCategory;
    setSearchParams(params);
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
  };

  const handleDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  return (
    <div className="app-shell-bg min-h-full flex flex-col">
      <Navbar variant="public" />

      <main className="flex-1">
        {/* Page Header */}
        <div className="container-page pt-8">
          <div className="section-surface mb-6">
            <h1 className="mb-2 text-4xl font-bold text-slate-900">🔍 Browse by Category</h1>
            <p className="text-lg text-slate-700">
              {activeSearch
                ? `Search results for “${activeSearch}”`
                : selectedCategory
                ? `Showing products in ${selectedCategory}`
                : "Explore our complete catalog of products"}
            </p>
          </div>
        </div>

        <div className="container-page py-2">
          <form onSubmit={handleSearchSubmit} className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="browse-search">
              Search products
            </label>
            <input
              id="browse-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by title, author, or keyword..."
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleClearSearch}
                className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </form>
          {error && (
            <div className="mb-6">
              <Alert type="error" title="Error">
                {error}
              </Alert>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Categories */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg border p-6 sticky top-20">
                <h3 className="text-lg font-bold mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategorySelect("")}
                    className={`w-full text-left px-4 py-2 rounded transition-colors ${
                      !selectedCategory
                        ? "bg-slate-900 text-white font-medium"
                        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={`w-full text-left px-4 py-2 rounded transition-colors ${
                        selectedCategory === cat
                          ? "bg-slate-900 text-white font-medium"
                          : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Sorting */}
                <hr className="my-6" />
                <h3 className="text-lg font-bold mb-4">Sort</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={handleSort}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="title">Title (A-Z)</option>
                      <option value="price">Price</option>
                      <option value="stock">Availability</option>
                    </select>
                  </div>
                  <button
                    onClick={handleDirection}
                    className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-900 transition-colors"
                  >
                    {sortDirection === "asc" ? "↑ Ascending" : "↓ Descending"}
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Content - Products */}
            <div className="flex-1">
              {loading ? (
                <div className="flex justify-center py-16">
                  <Spinner label="Loading products..." />
                </div>
              ) : (
                <>
                  {/* Results Count */}
                  <div className="mb-6 flex items-center justify-between">
                    <p className="text-slate-600">
                      Showing <span className="font-bold">{products.length}</span> product
                      {products.length !== 1 ? "s" : ""}
                    </p>
                    {selectedCategory && (
                      <button
                        onClick={() => handleCategorySelect("")}
                        className="text-sm text-slate-500 hover:text-slate-900 underline"
                      >
                        Clear filter
                      </button>
                    )}
                  </div>

                  {/* Products Grid */}
                  {products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {products.map((product, idx) => (
                        <BookCard
                          key={product?.id ?? idx}
                          book={product}
                          to={product?.id ? `/product/${product.id}` : undefined}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                      <p className="text-slate-600 mb-4">
                        Product not available.
                      </p>
                      {selectedCategory && (
                        <button
                          onClick={() => handleCategorySelect("")}
                          className="text-slate-900 font-medium hover:underline"
                        >
                          View all products
                        </button>
                      )}
                    </div>
                  )}

                  {/* Sign In Prompt for Non-Authenticated Users */}
                  {!isAuthenticated && (
                    <div className="mt-12 rounded-lg border-2 border-slate-200 bg-slate-50 p-8 text-center">
                      <h3 className="text-lg font-bold mb-2">View Product Details</h3>
                      <p className="text-slate-600 mb-4">
                        Sign in to view detailed product information, reviews, and add items to your cart.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Link
                          to="/login"
                          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          className="inline-flex items-center justify-center rounded-lg border-2 border-slate-900 px-6 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                          Create Account
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t bg-slate-900 text-slate-200 py-8">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">About Us</h4>
              <p className="text-sm text-slate-400">
                Your trusted marketplace for quality products at great prices.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-slate-400 hover:text-white">Home</Link></li>
                <li><Link to="/browse" className="text-slate-400 hover:text-white">Browse</Link></li>
                {isAuthenticated && (
                  <>
                    <li><Link to="/dashboard" className="text-slate-400 hover:text-white">Shop</Link></li>
                    <li><Link to="/cart" className="text-slate-400 hover:text-white">Cart</Link></li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <p className="text-sm text-slate-400">
                📧 support@bookstore.com<br />
                📞 1-800-BOOKS-24<br />
                🌐 www.bookstore.com
              </p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-6 text-center text-sm text-slate-400">
            <p>&copy; 2026 BookStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
