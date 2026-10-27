import axiosClient from './axiosClient';

const catalogApi = {
  async getBrands(signal) {
    const res = await axiosClient.get('/brands', { signal });
    return res.data;
  },

  async getCategories(signal) {
    const res = await axiosClient.get('/categories', { signal });
    return res.data;
  },
};

export default catalogApi;
