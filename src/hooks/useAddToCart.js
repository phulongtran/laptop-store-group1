import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { getErrorMessage } from '../api/axiosClient';

/**
 * Nút "Thêm vào giỏ" dùng chung (LaptopCard, trang chi tiết).
 * Chưa đăng nhập → chuyển /login, đăng nhập xong quay lại trang hiện tại (kịch bản 7).
 */
export default function useAddToCart() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [adding, setAdding] = useState(false);

  const add = async (laptop, quantity = 1) => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setAdding(true);
    try {
      await addToCart(laptop, quantity);
      showToast(`Đã thêm "${laptop.name}" vào giỏ hàng`);
    } catch (err) {
      showToast(getErrorMessage(err), 'danger'); // ví dụ "... chỉ còn 3 sản phẩm"
    } finally {
      setAdding(false);
    }
  };

  return { add, adding };
}
