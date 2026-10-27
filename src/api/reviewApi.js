import axiosClient from './axiosClient';

const reviewApi = {
  /** Đánh giá của 1 laptop, mới nhất trước */
  async getByLaptop(laptopId, signal) {
    const res = await axiosClient.get('/reviews', {
      params: { laptopId, _sort: 'createdAt', _order: 'desc' },
      signal,
    });
    return res.data;
  },

  /** BR-07: kiểm tra user đã đánh giá laptop này chưa */
  async findByUser(laptopId, userId) {
    const res = await axiosClient.get('/reviews', {
      params: { laptopId, userId },
    });
    return res.data[0] ?? null;
  },

  async create(data) {
    const res = await axiosClient.post('/reviews', data);
    return res.data;
  },
};

export default reviewApi;
