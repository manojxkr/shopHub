import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import Navbar from "../components/Navbar.jsx";
import Spinner from "../components/Spinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await register(form);
      setSuccess("Registered successfully. Please login.");
      setTimeout(() => navigate("/login", { replace: true }), 800);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell-bg min-h-full">
      <Navbar variant="public" />
      <div className="container-page py-10">
        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-2">
          <section className="fade-in-up rounded-lg border border-blue-700 bg-blue-600 p-5 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-100">Get started</p>
            <h1 className="panel-title mt-2 text-3xl font-bold text-white">Looks like you're new here!</h1>
            <p className="mt-2 text-sm text-blue-100">
              Join as a shopper or admin and access role-specific workflows instantly.
            </p>
            <div className="mt-6 grid gap-3">
              <div className="rounded bg-blue-500/70 px-3 py-2 text-sm text-blue-50">Personalized dashboard after sign-in</div>
              <div className="rounded bg-blue-500/70 px-3 py-2 text-sm text-blue-50">Secure auth with role-based access</div>
              <div className="rounded bg-blue-500/70 px-3 py-2 text-sm text-blue-50">Quick path to wishlist, cart, and orders</div>
            </div>
          </section>

          <section className="section-surface fade-in-up">
            <h2 className="panel-title text-2xl font-bold text-slate-900">Register</h2>
            <p className="mt-1 text-sm font-medium text-slate-700">Create an account (USER or ADMIN).</p>

            {error ? <div className="mt-4"><Alert type="error" title="Register error">{error}</Alert></div> : null}
            {success ? <div className="mt-4"><Alert type="success" title="Success">{success}</Alert></div> : null}

            <form onSubmit={onSubmit} className="mt-4 space-y-3 text-slate-900">
              <div>
                <label className="text-sm font-semibold text-slate-900">Name</label>
                <input
                  className="input-modern mt-1 w-full"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900">Email</label>
                <input
                  type="email"
                  className="input-modern mt-1 w-full"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  autoComplete="new-password"
                  required
                />
                <p className="mt-1 text-xs font-medium text-slate-700">
                  Use at least 8 chars with uppercase, lowercase, number, and symbol.
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900">Role</label>
                <select
                  className="input-modern mt-1 w-full"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <button
                disabled={loading}
                className="btn-primary w-full px-3 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {loading ? <Spinner label="Creating account..." /> : "Create account"}
              </button>

              <div className="text-sm text-slate-700">
                Already have an account?{" "}
                <Link className="font-semibold text-blue-700 hover:underline" to="/login">
                  Login
                </Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

