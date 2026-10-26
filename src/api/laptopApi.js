import axiosClient from './axiosClient';

export const PAGE_SIZE = 8;

/** Giá trị `sort` trên URL → `_sort`, `_order` của json-server (F3) */
export const SORT_OPTIONS = {
  newest: { label: 'Mới nhất', _sort: 'createdAt', _order: 'desc' },
  price_asc: { label: 'Giá tăng dần', _sort: 'price', _order: 'asc' },
  price_desc: { label: 'Giá giảm dần', _sort: 'price', _order: 'desc' },
  bestseller: { label: 'Bán chạy', _sort: 'sold', _order: 'desc' },
};

/**
 * Chuyển bộ lọc trên URL thành params của json-server.
 *   { brandId: '3', priceMin: '20000000', sort: 'price_asc', page: '2' }
 *   → { brandId: '3', price_gte: '20000000', _sort: 'price', _order: 'asc', _page: 2, _limit: 8 }
 */
export function buildLaptopParams(filters, limit = PAGE_SIZE) {
  const { brandId, categoryId, priceMin, priceMax, ramMin, q, sort, page } = filters;
  const sortOption = SORT_OPTIONS[sort] ?? SORT_OPTIONS.newest;

  const params = {
    _sort: sortOption._sort,
    _order: sortOption._order,
    _page: Number(page) || 1,
    _limit: limit,
  };
  if (brandId) params.brandId = brandId;
  if (categoryId) params.categoryId = categoryId;
  if (priceMin) params.price_gte = priceMin;
  if (priceMax) params.price_lte = priceMax;
  if (ramMin) params.ram_gte = ramMin;
  if (q) params.q = q;
  return params;
}

const laptopApi = {
  /** Trả về { items, total } – total đọc từ header x-total-count */
  async getAll(params = {}, signal) {
    const res = await axiosClient.get('/laptops', { params, signal });
    const total = Number(res.headers['x-total-count'] ?? res.data.length);
    return { items: res.data, total, duration: res.duration };
  },

  async getById(id, signal) {
    const res = await axiosClient.get(`/laptops/${id}`, {
      params: { _expand: ['brand', 'category'] },
      signal,
    });
    return res.data;
  },

  /** 4 laptop cùng loại, trừ chính nó */
  async getRelated(laptop, signal) {
    const res = await axiosClient.get('/laptops', {
      params: { categoryId: laptop.categoryId, id_ne: laptop.id, _limit: 4 },
      signal,
    });
    return res.data;
  },

  async create(data) {
    const res = await axiosClient.post('/laptops', data);
    return res.data;
  },

  /** PUT – gửi ĐẦY ĐỦ object */
  async update(id, data) {
    const res = await axiosClient.put(`/laptops/${id}`, data);
    return res.data;
  },

  /** PATCH – chỉ gửi các trường thay đổi */
  async patch(id, data) {
    const res = await axiosClient.patch(`/laptops/${id}`, data);
    return res.data;
  },

  async remove(id) {
    await axiosClient.delete(`/laptops/${id}`);
    return id;
  },
};

export default laptopApi;
