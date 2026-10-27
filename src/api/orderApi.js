import axiosClient from './axiosClient';

const orderApi = {
  /** Đơn của 1 user, mới nhất trước */
  async getByUser(userId, signal) {
    const res = await axiosClient.get('/orders', {
      params: { userId, _sort: 'createdAt', _order: 'desc' },
      signal,
    });
    return res.data;
  },

  /** Admin: tất cả đơn hàng, có thể lọc theo status */
  async getAll(params = {}, signal) {
    const res = await axiosClient.get('/orders', {
      params: { _sort: 'createdAt', _order: 'desc', ...params },
      signal,
    });
    return res.data;
  },

  async create(order) {
    const res = await axiosClient.post('/orders', order);
    return res.data;
  },

  /** PATCH – chỉ đổi trạng thái */
  async updateStatus(id, status) {
    const res = await axiosClient.patch(`/orders/${id}`, { status });
    return res.data;
  },
};

export default orderApi;
