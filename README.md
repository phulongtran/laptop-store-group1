# 💻 LaptopStore
Website bán laptop – Exercise 27 mở rộng (FER202). Xây dựng trên nền tảng React + Vite, react-bootstrap, React Router, axios và json-server.

## 👥 Bảng thành viên nhóm

| Thành viên | Vai trò | GitHub | Phụ trách chính |
|---|---|---|---|
| **Trần Phú Long** | Leader (Thành viên A) | [@phulongtran](https://github.com/phulongtran) | Repo setup, Axios client lõi, Đăng nhập / Phân quyền, Routing & Layouts, Custom Hooks, Quản trị laptop |
| **Thành viên B** | Member (Thành viên B) | [@Manhduh](https://github.com/Manhduh) | Trang chủ (song song), Danh sách laptop, Bộ lọc URL & Mobile, Trang chi tiết, Đánh giá, AppNavbar & Footer |
| **Thành viên C** | Member (Thành viên C) | [@member-c](https://github.com/phulongtran/laptop-store-group1) | Dữ liệu mẫu db.json, CartContext, Giỏ hàng, Đơn hàng của tôi, Quản trị đơn hàng, ToastContext & ConfirmModal |

- **Repository**: [https://github.com/phulongtran/laptop-store-group1](https://github.com/phulongtran/laptop-store-group1)
- **Project Board**: [LaptopStore Board](https://github.com/users/phulongtran/projects)
- **Release**: [v1.0.0](https://github.com/phulongtran/laptop-store-group1/releases)

---

## 1. 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu cầu môi trường
- **Node.js**: Phiên bản 18+ (khuyến nghị Node 20+)
- **NPM**: Phiên bản 9+

### Các bước cài đặt

1. **Clone repository**:
   ```bash
   git clone https://github.com/phulongtran/laptop-store-group1.git
   cd laptop-store-group1
   ```

2. **Cài đặt thư viện (dependencies)**:
   ```bash
   npm install
   ```

3. **Cấu hình môi trường**:
   ```bash
   cp .env.example .env
   # Trên Windows PowerShell:
   Copy-Item .env.example .env
   ```

4. **Khởi chạy ứng dụng**:
   Chạy đồng thời cả Frontend (Vite - cổng 5173) và Mock Backend (json-server - cổng 3001, delay 500ms):
   ```bash
   npm start
   ```

5. **Khôi phục dữ liệu mẫu ban đầu** (khi cần reset lại database sạch):
   ```bash
   npm run reset-db
   ```

### 🔑 Bảng tài khoản demo

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin@laptopstore.vn` | `123456` | Toàn quyền quản trị danh sách laptop, xem/lọc/duyệt đơn hàng của khách |
| **Khách hàng (Customer)** | `khach@laptopstore.vn` | `123456` | Xem catalog, lọc tìm kiếm, thêm giỏ hàng, đặt hàng, quản lý đơn hàng của tôi, viết đánh giá |

---

## 2. 📁 Cấu Trúc Thư Mục & Danh Sách 7 Trang Sử Dụng `useAxios`

```text
laptop-store-group1/
├── public/                 # Static assets (no-image.svg, favicon)
├── scripts/                # Scripts reset db (reset-db.js)
├── src/
│   ├── api/                # Tầng dịch vụ API (axiosClient, laptopApi, catalogApi, reviewApi, authApi)
│   ├── components/
│   │   ├── common/         # Common UI: Loading, ErrorAlert, EmptyState, Price, StarRating, AppPagination, ConfirmModal
│   │   ├── laptop/         # Laptop UI: LaptopCard, LaptopGrid, LaptopFilter, LaptopCardSkeleton, ReviewList, ReviewForm
│   │   └── layout/         # Layout UI: AppNavbar, Footer, MainLayout, AdminLayout, SearchSuggest
│   ├── contexts/           # React Contexts: AuthContext, ToastContext, CartContext
│   ├── hooks/              # Custom Hooks: useAxios, useDebounce, usePageTitle, useAddToCart, useFlashMessage
│   ├── pages/              # Các trang chính của ứng dụng
│   │   ├── admin/          # Trang quản trị: AdminLaptopPage, AdminOrderPage
│   │   ├── HomePage.jsx
│   │   ├── LaptopListPage.jsx
│   │   ├── LaptopDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── OrderListPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── utils/              # Utility functions: format.js, image.js
│   ├── App.jsx             # Cấu hình routes ứng dụng
│   ├── main.jsx            # Entry point bọc Providers
│   └── index.css
├── db.json                 # Mock database json-server
└── package.json
```

### 📋 Danh sách 7 trang chính sử dụng Custom Hook `useAxios`
Tất cả 7 trang đều sử dụng hook `useAxios` để tự động quản lý vòng đời request, trạng thái `loading`, `error`, và hỗ trợ hủy request cũ bằng `AbortController`:

1. **`HomePage.jsx`**: Gọi song song 4 request qua `Promise.all` (8 sản phẩm mới nhất, 4 sản phẩm bán chạy, danh mục brands, categories).
2. **`LaptopListPage.jsx`**: Tải danh sách sản phẩm theo bộ lọc query URL (`brandId`, `categoryId`, khoảng giá, RAM, sắp xếp, tìm kiếm từ khoá, phân trang).
3. **`LaptopDetailPage.jsx`**: Tải chi tiết laptop theo ID (bắt buộc), sau đó gọi song song `reviews` và `related laptops` qua `Promise.allSettled`.
4. **`CartPage.jsx`**: Tải danh sách các mục trong giỏ hàng của người dùng hiện tại, tính toán thành tiền theo BR-03.
5. **`OrderListPage.jsx`**: Hiển thị lịch sử đơn hàng của người dùng (mới nhất trước), hỗ trợ hủy đơn `pending`.
6. **`AdminLaptopPage.jsx`**: Quản trị danh sách laptop, tìm kiếm, sửa nhanh số lượng tồn kho (quick edit stock) và xóa lạc quan (optimistic delete).
7. **`AdminOrderPage.jsx`**: Quản trị toàn bộ đơn hàng khách hàng, lọc theo trạng thái và cập nhật trạng thái đơn một chiều.
