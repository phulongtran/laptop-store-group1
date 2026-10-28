import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage, isCancel } from '../api/axiosClient';

/**
 * H1. Custom hook gom logic loading / data / error / AbortController.
 *
 *   const { data, loading, error, refetch, setData } = useAxios(
 *     (signal) => laptopApi.getById(id, signal),
 *     [id]
 *   );
 *
 * - Mỗi lần deps đổi: hủy request cũ (abort) rồi gọi request mới (D1, D2).
 * - Bỏ qua lỗi hủy: không hiển thị lỗi, không tắt loading (D4).
 * - refetch(): gọi lại (dùng cho nút "Thử lại" của ErrorAlert).
 * - setData: cho phép trang cập nhật dữ liệu cục bộ (thêm review, xoá dòng...).
 */
export default function useAxios(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Luôn dùng phiên bản fetcher mới nhất mà không cần đưa vào deps
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcherRef.current(controller.signal);
        // Request đã bị hủy trong lúc chờ (ví dụ trong Promise.allSettled) → bỏ qua
        if (controller.signal.aborted) return;
        setData(result);
      } catch (err) {
        if (isCancel(err) || controller.signal.aborted) return;
        setError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    run();

    // Cleanup: chạy trước lần effect kế tiếp và khi unmount
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data, loading, error, refetch, setData };
}
