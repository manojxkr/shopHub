import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Navbar variant="public" />
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>
        <div className="text-center max-w-md relative z-10">
          <div className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">404</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Page Not Found</h1>
          <p className="text-slate-700 mb-8 text-lg">
            Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              Return Home
            </Link>
            <Link
              to="/browse"
              className="inline-flex items-center justify-center rounded-lg border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
