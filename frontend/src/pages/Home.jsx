import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import BookCard from "../components/BookCard.jsx";
import Spinner from "../components/Spinner.jsx";
import Alert from "../components/Alert.jsx";
import { listBooks, fetchGenres } from "../services/bookService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { sanitizeImageUrl } from "../utils/imageUrl.js";

export default function Home() {
  const { isAuthenticated, role } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let canceled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [productsData, categoriesData] = await Promise.all([
          listBooks({ page: 0, size: 12 }),
          fetchGenres(),
        ]);

        if (canceled) return;
        setFeatured(productsData?.content?.slice(0, 6) ?? []);
        setNewArrivals(productsData?.content?.slice(6, 12) ?? []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        if (canceled) return;
        setError(err?.message || "Failed to load homepage.");
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    load();
    return () => {
      canceled = true;
    };
  }, []);

  const mergedCategories = useMemo(() => {
    const top = ["Fashions", "Books", "Mobiles", "Electronics", "Sports", "Toys", "Kitchen", "Beauty"];
    return Array.from(new Set([...top, ...categories]));
  }, [categories]);

  const goTo = isAuthenticated ? (role === "ROLE_ADMIN" ? "/admin" : "/dashboard") : "/register";
  const banner = featured[0];
  const shopperPicks = useMemo(() => {
    return [...featured, ...newArrivals].filter(Boolean).slice(0, 3);
  }, [featured, newArrivals]);
  const heroPick = shopperPicks[0];
  const sidePicks = shopperPicks.slice(1, 3);

  return (
    <div className="app-shell-bg min-h-full">
      <Navbar variant="public" />

      <main className="container-page space-y-4 pt-4">
        {mergedCategories.length > 0 ? (
          <section className="section-surface px-4 py-4">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {mergedCategories.slice(0, 8).map((cat) => (
                <Link
                  key={cat}
                  to={`/browse?genre=${encodeURIComponent(cat)}`}
                  className="rounded border border-slate-200 px-2 py-3 text-center text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section-surface overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-3">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">Big Book Days</p>
              <h1 className="panel-title mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">Up To 60% Off On Bestsellers</h1>
              <p className="mt-2 max-w-xl text-sm text-blue-50">Grab limited-time deals, quick delivery, and trusted checkout.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link className="rounded bg-white px-4 py-2 text-sm font-bold text-blue-700" to="/shop">
                  Shop now
                </Link>
                <Link className="btn-primary px-4 py-2 text-sm font-bold" to={goTo}>
                  {isAuthenticated ? "Open account" : "Join free"}
                </Link>
              </div>
            </div>
            <div className="flex flex-col justify-center bg-amber-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Deal of the day</p>
              <h2 className="mt-1 text-base font-bold text-slate-900">{banner?.title || "Top Rated Titles"}</h2>
              <p className="mt-1 text-xs text-slate-600">Extra cashback with select payments.</p>
            </div>
          </div>
        </section>

        {error ? (
          <Alert type="error" title="Error">
            {error}
          </Alert>
        ) : null}

        {loading ? (
          <div className="section-surface flex justify-center py-10">
            <Spinner label="Loading homepage..." />
          </div>
        ) : (
          <>
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="panel-title text-xl font-bold text-slate-900">Top Offers</h2>
                <Link className="text-sm font-semibold text-blue-700 hover:underline" to="/shop">
                  Explore all books
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((product, idx) => (
                  <BookCard key={product?.id ?? idx} book={product} to={product?.id ? `/product/${product?.id}` : undefined} />
                ))}
              </div>
            </section>

            <section className="section-surface px-4 py-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded border border-slate-200 bg-blue-50 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-900">Lowest price guarantee</h3>
                  <p className="mt-1 text-xs text-slate-700">Daily refreshed pricing on curated books.</p>
                </div>
                <div className="rounded border border-slate-200 bg-white px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-900">Fast checkout</h3>
                  <p className="mt-1 text-xs text-slate-700">Simple cart, order, and payment flow.</p>
                </div>
                <div className="rounded border border-slate-200 bg-amber-50 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-900">Trusted delivery</h3>
                  <p className="mt-1 text-xs text-slate-700">Track every order from dashboard.</p>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="panel-title text-xl font-bold text-slate-900">Recently Added</h2>
                {isAuthenticated ? (
                  <Link className="text-sm font-semibold text-blue-700 hover:underline" to="/dashboard">
                    Open dashboard
                  </Link>
                ) : null}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {newArrivals.map((product, idx) => (
                  <BookCard key={product?.id ?? idx} book={product} to={product?.id ? `/product/${product?.id}` : undefined} />
                ))}
              </div>
            </section>

            <section className="section-surface px-4 py-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="panel-title text-lg font-bold text-slate-900">Shop With Confidence</h2>
                <Link className="text-sm font-semibold text-blue-700 hover:underline" to="/shop">
                  See all deals
                </Link>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 text-white">
                    <div className="grid gap-0 sm:grid-cols-2">
                      <div className="p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">Trusted Marketplace</p>
                        <h3 className="mt-2 text-xl font-bold">New Arrivals, Bestseller Deals, Easy Checkout</h3>
                        <p className="mt-2 text-sm text-slate-200">
                          Explore curated picks, compare prices, and place orders in a few simple steps.
                        </p>
                        <div className="mt-4 flex gap-2">
                          <span className="rounded bg-white/10 px-2 py-1 text-xs">Updated catalog daily</span>
                          <span className="rounded bg-white/10 px-2 py-1 text-xs">Simple order tracking</span>
                        </div>
                      </div>
                      <div className="h-44 bg-slate-800 sm:h-auto">
                        {sanitizeImageUrl(heroPick?.imageUrl) ? (
                          <img
                            src={sanitizeImageUrl(heroPick?.imageUrl)}
                            alt={heroPick?.title ?? "Featured product"}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-300">Featured pick</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {sidePicks.map((item, idx) => (
                    <Link
                      key={item?.id ?? idx}
                      to={item?.id ? `/product/${item.id}` : "/shop"}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 hover:border-blue-300"
                    >
                      <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-white">
                        {sanitizeImageUrl(item?.imageUrl) ? (
                          <img src={sanitizeImageUrl(item?.imageUrl)} alt={item?.title ?? "Book"} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] font-semibold text-slate-500">No image</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-xs font-semibold text-slate-900">{item?.title ?? "Featured deal"}</p>
                        <p className="mt-1 text-[11px] text-slate-600">Limited-time offer</p>
                      </div>
                    </Link>
                  ))}

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Shopping Highlights</p>
                    <p className="mt-1 text-xs text-slate-700">Discover trending books, featured offers, and fresh additions across categories.</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="mt-8 border-t border-slate-700 bg-[#172337] text-slate-200">
        <div className="container-page py-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">About</h3>
              <ul className="space-y-2 text-sm font-semibold">
                <li><a href="#" className="hover:underline">Contact Us</a></li>
                <li><a href="#" className="hover:underline">About Us</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Press</a></li>
                <li><a href="#" className="hover:underline">Corporate Information</a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Group Companies</h3>
              <ul className="space-y-2 text-sm font-semibold">
                <li><a href="#" className="hover:underline">BookStore Plus</a></li>
                <li><a href="#" className="hover:underline">Cleartrip</a></li>
                <li><a href="#" className="hover:underline">Shopsy</a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Help</h3>
              <ul className="space-y-2 text-sm font-semibold">
                <li><a href="#" className="hover:underline">Payments</a></li>
                <li><a href="#" className="hover:underline">Shipping</a></li>
                <li><a href="#" className="hover:underline">Cancellation &amp; Returns</a></li>
                <li><a href="#" className="hover:underline">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Consumer Policy</h3>
              <ul className="space-y-2 text-sm font-semibold">
                <li><a href="#" className="hover:underline">Cancellation &amp; Returns</a></li>
                <li><a href="#" className="hover:underline">Terms Of Use</a></li>
                <li><a href="#" className="hover:underline">Security</a></li>
                <li><a href="#" className="hover:underline">Privacy</a></li>
                <li><a href="#" className="hover:underline">Sitemap</a></li>
              </ul>
            </div>

            <div className="border-slate-600 lg:border-l lg:pl-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Mail Us</h3>
              <p className="text-sm leading-6 text-slate-200">
                BookStore Internet Private Limited,<br />
                Buildings Alyssa, Begonia &amp;<br />
                Clove Embassy Tech Village,<br />
                Outer Ring Road, Bengaluru,<br />
                Karnataka, India
              </p>
              <div className="mt-4">
                <div className="text-sm text-slate-400">Social:</div>
                <div className="mt-2 flex gap-2 text-xs font-bold">
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-slate-500">f</span>
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-slate-500">x</span>
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-slate-500">yt</span>
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-slate-500">ig</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Registered Office Address</h3>
              <p className="text-sm leading-6 text-slate-200">
                BookStore Internet Private Limited,<br />
                Buildings Alyssa, Begonia &amp;<br />
                Clove Embassy Tech Village,<br />
                Outer Ring Road, Bengaluru,<br />
                Karnataka, India<br />
                CIN: U51109KA2012PTC066107<br />
                Telephone: 044-45614700
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
