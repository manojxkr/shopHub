import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import Spinner from "../components/Spinner.jsx";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, loading, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    if (from) navigate(from, { replace: true });
    else if (role === "ROLE_ADMIN") navigate("/admin", { replace: true });
    else if (role === "ROLE_USER") navigate("/dashboard", { replace: true });
  }, [isAuthenticated, role, from, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const r = await login({ email, password });
      if (r === "ROLE_ADMIN") navigate("/admin", { replace: true });
      else navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed";
      setError(msg);
    }
  }

  return (
    <div className="app-shell-bg min-h-full">
      <Navbar variant="public" />
      <div className="container-page py-10">
        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-2">
          <section className="fade-in-up rounded-lg border border-blue-700 bg-blue-600 p-5 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-100">Welcome back</p>
            <h1 className="panel-title mt-2 text-3xl font-bold text-white">Login</h1>
            <p className="mt-2 text-sm text-blue-100">
              Access your cart, orders, wishlist, and profile from one dashboard.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded bg-blue-500/70 px-3 py-2 text-sm text-blue-50">Unified shopper dashboard experience</div>
              <div className="rounded bg-blue-500/70 px-3 py-2 text-sm text-blue-50">Fast category browsing and product search</div>
              <div className="rounded bg-blue-500/70 px-3 py-2 text-sm text-blue-50">Simple checkout and order tracking</div>
            </div>
          </section>

          <section className="section-surface fade-in-up">
            <h2 className="panel-title text-2xl font-bold text-slate-900">Login</h2>
            <p className="mt-1 text-sm font-medium text-slate-700">Use your email and password to access your account.</p>

            {error ? <div className="mt-4"><Alert type="error" title="Login error">{error}</Alert></div> : null}

            <form onSubmit={onSubmit} className="mt-4 space-y-3 text-slate-900">
              <div>
                <label className="text-sm font-semibold text-slate-900">Email</label>
                <input
                  className="input-modern mt-1 w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900">Password</label>
                <input
                  className="input-modern mt-1 w-full"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                disabled={loading}
                className="btn-primary w-full px-3 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {loading ? <Spinner label="Signing in..." /> : "Sign in"}
              </button>

              <div className="text-sm font-medium text-slate-700">
                No account?{" "}
                <Link className="font-semibold text-teal-800 hover:underline" to="/register">
                  Register
                </Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

