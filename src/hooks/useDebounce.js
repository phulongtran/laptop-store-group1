import { useEffect, useState } from 'react';

/**
 * H2. Trả về `value` sau khi người dùng ngừng thay đổi `delay` ms.
 * Mỗi lần value đổi: clearTimeout bộ đếm cũ, đặt bộ đếm mới.
 */
export default function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
