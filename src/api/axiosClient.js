import axios from 'axios';

/**
 * B1. axios instance dùng chung cho toàn bộ ứng dụng.
 * Đổi server chỉ cần sửa file .env (VITE_API_URL).
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 8000,
  headers: { 'Content-Type': 'application/json' },
  // Mảng trong params được gửi dạng `_expand=brand&_expand=category`
  // (mặc định axios gửi `_expand[]=brand...` – json-server 0.17 không hiểu).
  paramsSerializer: { indexes: null },
});

/* ----------------------------------------------------------------
 * B2. Request interceptor: gắn token, ghi thời điểm bắt đầu, log
 * -------------------------------------------------------------- */
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.metadata = { start: performance.now() };

  if (import.meta.env.DEV) {
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`, config.params ?? '');
  }
  return config;
});

const getDuration = (config) =>
  config?.metadata ? Math.round(performance.now() - config.metadata.start) : 0;

/* ----------------------------------------------------------------
 * B3 + B4. Response interceptor
 * -------------------------------------------------------------- */
const STATUS_MESSAGES = {
  400: 'Dữ liệu gửi lên không hợp lệ',
  401: 'Phiên đăng nhập đã hết hạn',
  403: 'Bạn không có quyền thực hiện thao tác này',
  404: 'Không tìm thấy dữ liệu',
};

axiosClient.interceptors.response.use(
  // B3. Thành công: trả về NGUYÊN response (trang danh sách cần đọc header x-total-count)
  (response) => {
    response.duration = getDuration(response.config);
    if (import.meta.env.DEV) {
      console.log(
        `[API] ${response.status} ${response.config.method.toUpperCase()} ${response.config.url} – ${response.duration}ms`
      );
    }
    return response;
  },

  // B4. Lỗi: chuẩn hóa thành { status, message } tiếng Việt
  (error) => {
    // Lỗi hủy request phải giữ NGUYÊN để component nhận ra bằng isCancel()
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status ?? null;
    let message;

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      message = 'Yêu cầu quá thời gian, vui lòng thử lại';
    } else if (!error.response) {
      message = 'Không kết nối được máy chủ. Kiểm tra json-server đã chạy chưa?';
    } else if (status >= 500) {
      message = 'Máy chủ đang gặp sự cố';
    } else {
      message = STATUS_MESSAGES[status] ?? `Có lỗi xảy ra (mã ${status})`;
    }

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // AuthContext (#8) lắng nghe sự kiện này để cập nhật giao diện
      window.dispatchEvent(new Event('auth:logout'));
    }

    if (import.meta.env.DEV) {
      console.warn(`[API] Lỗi ${status ?? ''} ${error.config?.url ?? ''} – ${message}`);
    }

    return Promise.reject({ status, message });
  }
);

/** Export lại để component không phải import axios trực tiếp (TECH-01) */
export const isCancel = axios.isCancel;

/** Lấy câu thông báo từ một lỗi bất kỳ */
export const getErrorMessage = (err) => err?.message || 'Có lỗi xảy ra, vui lòng thử lại';

export default axiosClient;
