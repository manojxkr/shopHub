import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

export default function ServerError() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar variant="public" />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <div className="text-6xl font-bold text-red-600 mb-4">500</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Server Error</h1>
          <p className="text-slate-600 mb-6">
            Something went wrong on our end. Our team has been notified and is working to fix the issue.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.href = "/"}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Return Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
