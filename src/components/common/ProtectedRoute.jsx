import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * F2 + BR-09. Route bảo vệ.
 *   <ProtectedRoute />                    → chỉ cần đăng nhập
 *   <ProtectedRoute roles={['admin']} />  → cần đúng vai trò
 * Dùng được cả 2 cách: bọc children hoặc làm route cha (render <Outlet />).
 */
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Lưu trang đang muốn vào → LoginPage đưa người dùng quay lại
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    // useFlashMessage ở layout đọc state này và hiện Toast
    return <Navigate to="/" replace state={{ message: 'Bạn không có quyền truy cập', variant: 'danger' }} />;
  }

  return children ?? <Outlet />;
}
