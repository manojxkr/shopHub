import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

export default function AdminLayout() {
  return (
    <div className="app-shell-bg flex min-h-full flex-col">
      <Navbar variant="admin" />
      <main className="container-page flex-1 py-6">
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

