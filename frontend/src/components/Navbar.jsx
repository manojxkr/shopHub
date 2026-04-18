import { Link, NavLink, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar({ variant = "public" }) {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const homeLink = isAuthenticated && role === "ROLE_ADMIN" ? "/admin" : "/";

  const links = useMemo(() => {
    if (!isAuthenticated && variant === "public") {
      return [
        { to: "/shop", label: "Catalog" },
      ];
    }

    if (isAuthenticated && role === "ROLE_USER") {
      return [
        { to: "/dashboard", label: "Shop", end: true },
        { to: "/cart", label: "Cart" },
        { to: "/my-orders", label: "Orders" },
        { to: "/wishlist", label: "Wishlist" },
        { to: "/profile", label: "Profile" },
      ];
    }

    if (variant === "admin" && isAuthenticated && role === "ROLE_ADMIN") {
      return [
        { to: "/admin", label: "Overview", end: true },
        { to: "/admin/products", label: "Products" },
        { to: "/admin/orders", label: "Orders" },
      ];
    }

    return [];
  }, [isAuthenticated, role, variant]);

  const isPublic = !isAuthenticated;

  function submitSearch(e) {
    e.preventDefault();
    const q = searchTerm.trim();
    if (q) navigate(`/shop?q=${encodeURIComponent(q)}`);
    else navigate("/shop");
    setOpen(false);
  }

  return (
    <div className="navbar-glass">
      <div className="container-page py-2">
        <div className="flex items-center justify-between gap-2 lg:gap-4">
          <Link to={homeLink} className="group hidden items-center gap-2 sm:flex" onClick={() => setOpen(false)}>
            <div className="grid h-8 w-8 place-items-center rounded bg-white text-sm font-extrabold text-blue-700">BS</div>
            <div>
              <div className="panel-title text-sm font-bold leading-tight text-white">BookStore BazaarSphere</div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-100">
                {role ? role.replace("ROLE_", "") : "Explorer"}
              </div>
            </div>
          </Link>

          <Link to={homeLink} className="sm:hidden">
            <div className="grid h-8 w-8 place-items-center rounded bg-white text-sm font-extrabold text-blue-700">BS</div>
          </Link>

          <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 items-center gap-2 lg:flex">
            <input
              className="w-full rounded bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm outline-none"
              placeholder="Search for products, brands and more"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="rounded bg-white px-3 py-2 text-xs font-bold text-blue-700">
              Search
            </button>
          </form>

          <div className="hidden items-center gap-1 lg:flex">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-white text-blue-700"
                      : "text-white hover:bg-blue-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {isPublic ? (
              <Link className="rounded bg-white px-4 py-2 text-sm font-semibold text-blue-700" to="/login">
                Login
              </Link>
            ) : (
              <button className="rounded bg-white px-4 py-2 text-sm font-semibold text-blue-700" onClick={() => logout()}>
                Log out
              </button>
            )}
            {isPublic ? <Link className="btn-primary px-3 py-2 text-sm font-semibold" to="/register">Register</Link> : null}
          </div>

          <button
            className="rounded border border-blue-300 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            Menu
          </button>
        </div>

        {open ? (
          <div className="mt-2 space-y-2 rounded border border-blue-200 bg-white p-3 shadow-sm lg:hidden">
            <form onSubmit={submitSearch} className="flex gap-2">
              <input
                className="w-full rounded border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none"
                placeholder="Search for products, brands and more"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-xs font-semibold text-white">
                Go
              </button>
            </form>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-700">Navigation</div>
            <div className="grid gap-1">
              {links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded px-3 py-2 text-sm font-semibold ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 hover:bg-blue-50"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {isPublic ? (
                <>
                  <Link className="mt-1 rounded bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white" to="/login" onClick={() => setOpen(false)}>Login</Link>
                  <Link className="btn-primary mt-1 rounded px-3 py-2 text-center text-sm font-semibold" to="/register" onClick={() => setOpen(false)}>Register</Link>
                </>
              ) : (
                <button className="mt-1 rounded border border-blue-300 px-3 py-2 text-left text-sm font-semibold text-blue-700 hover:bg-blue-50" onClick={() => logout()}>
                  Log out
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

