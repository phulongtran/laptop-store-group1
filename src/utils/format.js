const priceFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

/** formatPrice(39990000) → "39.990.000 ₫" ; null/undefined → '' */
export const formatPrice = (value) => {
  if (value === null || value === undefined || value === '') return '';
  return priceFormatter.format(Number(value) || 0);
};

/** formatDate('2026-09-10T10:00:00Z') → "10/09/2026" */
export const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/** formatDateTime → "10/09/2026 17:00" */
export const formatDateTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** BR-03: có giảm giá hợp lệ khi 0 < salePrice < price */
export const hasSale = (laptop) =>
  Boolean(laptop?.salePrice) && laptop.salePrice > 0 && laptop.salePrice < laptop.price;

/** BR-03: giá bán thực tế = salePrice nếu có, ngược lại price */
export const getSellingPrice = (laptop) => (hasSale(laptop) ? laptop.salePrice : laptop?.price ?? 0);

/** BR-03: % giảm, làm tròn. 42.990.000 → 39.990.000 = 7 */
export const getDiscountPercent = (laptop) =>
  hasSale(laptop) ? Math.round(((laptop.price - laptop.salePrice) / laptop.price) * 100) : 0;
