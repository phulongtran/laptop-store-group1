import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

/** 🧩 Bản tạm (#15) – C thay toàn bộ ở #22. Giữ nguyên API: { add(laptop, quantity), adding } */
export default function useAddToCart() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const add = async (laptop) => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    showToast(`Giỏ hàng đang phát triển (#22) – "${laptop.name}"`, 'info');
  };

  return { add, adding: false };
}
