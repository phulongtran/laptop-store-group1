import { createContext, useContext } from 'react';

/** 🧩 Bản tạm (#14) – C thay toàn bộ ở #22. Giữ nguyên tên các trường. */
const EMPTY_CART = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

const CartContext = createContext(EMPTY_CART);

export function CartProvider({ children }) {
  return <CartContext.Provider value={EMPTY_CART}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
