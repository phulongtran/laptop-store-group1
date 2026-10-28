import axiosClient from './axiosClient';

const cartApi = {
  /** Giỏ hàng của user, kèm thông tin laptop (_expand=laptop) */
  async getByUser(userId, signal) {
    const res = await axiosClient.get('/cartItems', {
      params: { userId, _expand: 'laptop' },
      signal,
    });
    return res.data;
  },

  async add(userId, laptopId, quantity) {
    const res = await axiosClient.post('/cartItems', { userId, laptopId, quantity });
    return res.data;
  },

  /** PATCH – chỉ đổi số lượng */
  async updateQuantity(id, quantity) {
    const res = await axiosClient.patch(`/cartItems/${id}`, { quantity });
    return res.data;
  },

  async remove(id) {
    await axiosClient.delete(`/cartItems/${id}`);
    return id;
  },
};

export default cartApi;
