/** Trạng thái đơn hàng: nhãn + màu Badge */
export const ORDER_STATUS = {
  pending: { label: 'Chờ xác nhận', variant: 'warning' },
  confirmed: { label: 'Đã xác nhận', variant: 'info' },
  shipping: { label: 'Đang giao', variant: 'primary' },
  done: { label: 'Hoàn thành', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'secondary' },
};

/** BR-06: chỉ cho đổi trạng thái theo một chiều */
export const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'shipping',
  shipping: 'done',
};

export const getStatus = (status) => ORDER_STATUS[status] ?? { label: status, variant: 'secondary' };
