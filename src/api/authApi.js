import axiosClient from './axiosClient';

/**
 * B6. Đăng nhập GIẢ LẬP – json-server không có xác thực thật.
 * Tìm user theo email + password, sau đó tự tạo token giả.
 */
const authApi = {
  async login(email, password) {
    const res = await axiosClient.get('/users', { params: { email, password } });

    if (res.data.length === 0) {
      // Ném lỗi cùng dạng với lỗi đã chuẩn hóa trong interceptor
      throw { status: null, message: 'Sai email hoặc mật khẩu' };
    }

    // Không lưu password xuống localStorage
    // eslint-disable-next-line no-unused-vars
    const { password: _password, ...user } = res.data[0];
    const token = btoa(`${user.id}:${Date.now()}`);
    return { token, user };
  },
};

export default authApi;
