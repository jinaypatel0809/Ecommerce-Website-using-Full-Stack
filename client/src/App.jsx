import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home/Home";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound/NotFound";
import AuthPage from "./pages/Auth/AuthPage";
import AuthLayout from "./layouts/AuthLayout";
import Dashboard from "./pages/Admin/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Search from "./pages/Search/Search";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Cart from "./pages/Cart/Cart";
import Mobiles from "./pages/Mobiles/Mobiles";
import Headphones from "./pages/Headphones/Headphones";
import Neckband from "./pages/Neckband/Neckband";
import Profile from "./pages/Profile/Profile";
import MyOrders from "./pages/Orders/MyOrders";

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="user/signin" element={<AuthPage role="user" mode="signin" />} />
        <Route path="user/signup" element={<AuthPage role="user" mode="signup" />} />
        <Route path="admin/signin" element={<AuthPage role="admin" mode="signin" />} />
        <Route path="admin/signup" element={<AuthPage role="admin" mode="signup" />} />
      </Route>
      <Route path="admin/dashboard" element={<ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>} />
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Navigate to="/user/signin" replace />} />
        <Route path="register" element={<Navigate to="/user/signup" replace />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="cart" element={<ProtectedRoute role="user"><Cart /></ProtectedRoute>} />
        <Route path="wishlist" element={<PlaceholderPage title="Wishlist" />} />
        <Route path="checkout" element={<PlaceholderPage title="Checkout" />} />
        <Route path="orders" element={<ProtectedRoute role="user"><MyOrders /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute role="user"><Profile /></ProtectedRoute>} />
        <Route path="search" element={<Search />} />
        <Route path="mobiles" element={<Mobiles />} />
        <Route path="headphones" element={<Headphones />} />
        <Route path="neckband" element={<Neckband />} />
        <Route path="seller" element={<PlaceholderPage title="Become a Seller" />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
