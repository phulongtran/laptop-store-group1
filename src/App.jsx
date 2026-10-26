import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import LaptopListPage from './pages/LaptopListPage';
import LaptopDetailPage from './pages/LaptopDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderListPage from './pages/OrderListPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminLaptopPage from './pages/admin/AdminLaptopPage';
import AdminLaptopFormPage from './pages/admin/AdminLaptopFormPage';
import AdminOrderPage from './pages/admin/AdminOrderPage';

/** Phần F – bảng route */
export default function App() {
  return (
    <Routes>
      {/* Layout khách hàng */}
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="laptops" element={<LaptopListPage />} />
        <Route path="laptops/:id" element={<LaptopDetailPage />} />
        <Route path="login" element={<LoginPage />} />

        {/* Cần đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrderListPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Layout quản trị – chỉ admin */}
      <Route
        path="admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="laptops" replace />} />
        <Route path="laptops" element={<AdminLaptopPage />} />
        <Route path="laptops/new" element={<AdminLaptopFormPage />} />
        <Route path="laptops/:id/edit" element={<AdminLaptopFormPage />} />
        <Route path="orders" element={<AdminOrderPage />} />
      </Route>
    </Routes>
  );
}
