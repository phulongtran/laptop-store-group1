import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import cartApi from '../api/cartApi';
import { getErrorMessage, isCancel } from '../api/axiosClient';
import { getSellingPrice } from '../utils/format';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

/** Bỏ các dòng có laptop đã bị xoá khỏi hệ thống (_expand trả về undefined) */
const validItems = (items) => items.filter((item) => item.laptop);

/**
 * G1. Giỏ hàng lưu thật trong json-server (/cartItems).
 * Mỗi item: { id, userId, laptopId, quantity, laptop }
 */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  // id của user đã tải xong giỏ – tránh 1 lần render "giỏ rỗng" trước khi effect chạy
  const [loadedUserId, setLoadedUserId] = useState(null);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Bản mới nhất của items, dùng trong các hàm async và optimistic update
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Đăng nhập / đăng xuất → tải lại giỏ
  useEffect(() => {
    if (!user) {
      setItems([]);
      return undefined;
    }

    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await cartApi.getByUser(user.id, controller.signal);
        setItems(validItems(data));
      } catch (err) {
        if (isCancel(err)) return;
        setError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadedUserId(user.id);
        }
      }
    };
    load();
    return () => controller.abort();
  }, [user, reloadKey]);

  /** Thêm vào giỏ: đã có → PATCH tăng số lượng; chưa có → POST. BR-02: không vượt stock */
  const addToCart = useCallback(
    async (laptop, quantity = 1) => {
      if (!user) throw { message: 'Vui lòng đăng nhập' };

      const existing = itemsRef.current.find((item) => item.laptopId === laptop.id);
      const newQuantity = (existing?.quantity ?? 0) + quantity;
      if (newQuantity > laptop.stock) {
        throw { message: `"${laptop.name}" chỉ còn ${laptop.stock} sản phẩm` };
      }

      if (existing) {
        const updated = await cartApi.updateQuantity(existing.id, newQuantity);
        setItems((list) =>
          list.map((item) => (item.id === existing.id ? { ...item, quantity: updated.quantity } : item))
        );
      } else {
        const created = await cartApi.add(user.id, laptop.id, quantity);
        // Response POST không có _expand → tự gắn laptop vào
        setItems((list) => [...list, { ...created, laptop }]);
      }
    },
    [user]
  );

  /** Đổi số lượng (PATCH). BR-02 */
  const updateQuantity = useCallback(async (item, quantity) => {
    if (quantity > item.laptop.stock) {
      throw { message: `"${item.laptop.name}" chỉ còn ${item.laptop.stock} sản phẩm` };
    }
    const updated = await cartApi.updateQuantity(item.id, quantity);
    setItems((list) => list.map((i) => (i.id === item.id ? { ...i, quantity: updated.quantity } : i)));
  }, []);

  /** H4. Optimistic update: xoá khỏi giao diện ngay, lỗi thì khôi phục đúng vị trí cũ */
  const removeItem = useCallback(async (item) => {
    const index = itemsRef.current.findIndex((i) => i.id === item.id); // 1. nhớ vị trí (bản sao)
    setItems((list) => list.filter((i) => i.id !== item.id)); // 2. cập nhật giao diện ngay

    try {
      await cartApi.remove(item.id); // 3. gọi API
    } catch (err) {
      // 4. lỗi → khôi phục
      setItems((list) => {
        if (list.some((i) => i.id === item.id)) return list;
        const restored = [...list];
        restored.splice(index < 0 ? restored.length : index, 0, item);
        return restored;
      });
      throw err;
    }
  }, []);

  /** Dùng sau khi đặt hàng: giỏ đã được xoá trên server */
  const clearLocal = useCallback(() => setItems([]), []);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const isLoading = loading || (Boolean(user) && loadedUserId !== user.id);

  const value = useMemo(() => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + getSellingPrice(item.laptop) * item.quantity, 0);
    return {
      items,
      totalQuantity,
      totalPrice,
      loading: isLoading,
      error,
      addToCart,
      updateQuantity,
      removeItem,
      clearLocal,
      reload,
    };
  }, [items, isLoading, error, addToCart, updateQuantity, removeItem, clearLocal, reload]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
