/** Ảnh lỗi (link hỏng / không có mạng) → dùng ảnh mặc định trong thư mục public */
export const FALLBACK_IMAGE = '/no-image.svg';

export const handleImageError = (e) => {
  e.currentTarget.onerror = null; // tránh lặp vô hạn nếu ảnh mặc định cũng lỗi
  e.currentTarget.src = FALLBACK_IMAGE;
};
