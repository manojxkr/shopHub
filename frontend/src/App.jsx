import { Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

// Lazy load components
const Home = lazy(() => import("./pages/Home.jsx"));
const PublicBooks = lazy(() => import("./pages/PublicBooks.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const Dashboard = lazy(() => import("./user/Dashboard.jsx"));
const PublicBookDetails = lazy(() => import("./pages/PublicBookDetails.jsx"));
const Cart = lazy(() => import("./user/Cart.jsx"));
const Checkout = lazy(() => import("./user/Checkout.jsx"));
const MyOrders = lazy(() => import("./user/MyOrders.jsx"));
const Wishlist = lazy(() => import("./user/Wishlist.jsx"));
const Profile = lazy(() => import("./user/Profile.jsx"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard.jsx"));
const ManageProducts = lazy(() => import("./admin/ManageBooks.jsx"));
const ManageOrders = lazy(() => import("./admin/ManageOrders.jsx"));
const UserLayout = lazy(() => import("./user/UserLayout.jsx"));
const AdminLayout = lazy(() => import("./admin/AdminLayout.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

export default function App() {
  const { isAuthenticated, role, loading } = useAuth();

  return (
    <div className="app-shell-bg flex min-h-full flex-1 flex-col">
      <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-600">Loading...</div>}>
        <Routes>
      <Route
        path="/"
        element={
          loading ? (
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-600">Loading...</div>
          ) : isAuthenticated && role === "ROLE_ADMIN" ? (
            <Navigate to="/admin" replace />
          ) : (
            <Home />
          )
        }
      />
      <Route path="/shop" element={<PublicBooks />} />
      <Route path="/browse" element={<Navigate to="/shop" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/product/:id" element={<PublicBookDetails />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ROLE_USER"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
      </Route>
      <Route
        path="/cart"
        element={
          <ProtectedRoute allowedRoles={["ROLE_USER"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Cart />} />
      </Route>
      <Route
        path="/checkout"
        element={
          <ProtectedRoute allowedRoles={["ROLE_USER"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Checkout />} />
      </Route>
      <Route
        path="/my-orders"
        element={
          <ProtectedRoute allowedRoles={["ROLE_USER"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MyOrders />} />
      </Route>
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute allowedRoles={["ROLE_USER"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Wishlist />} />
      </Route>
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["ROLE_USER"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Profile />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<ManageProducts />} />
        <Route path="books" element={<Navigate to="/admin/products" replace />} />
        <Route path="orders" element={<ManageOrders />} />
      </Route>

      {/* Helpful role-based landing redirect once logged in */}
      <Route
        path="/app"
        element={
          loading ? (
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-600">Loading...</div>
          ) : isAuthenticated ? (
            role === "ROLE_ADMIN" ? (
              <Navigate to="/admin" replace />
            ) : role === "ROLE_USER" ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 Catch-all Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
    </div>
  );
}
