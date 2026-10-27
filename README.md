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

---

## 3. ⏱️ Kết Quả Đo Thời Gian Tải Trang Chủ (Phần C2)

Đo đạc trên môi trường máy thật của 3 thành viên với cấu hình `json-server --delay 500`:

| Thành viên | Tải tuần tự (`loadSequential`) | Tải song song (`Promise.all`) | Chênh lệch hiệu năng |
|---|---|---|---|
| **Trần Phú Long (A)** | 2.085 ms | 520 ms | Nhanh hơn **4.01 lần** |
| **Thành viên B (Catalog)** | 2.075 ms | 528 ms | Nhanh hơn **3.93 lần** |
| **Thành viên C (Cart)** | 2.092 ms | 534 ms | Nhanh hơn **3.92 lần** |

> **Phân tích kỹ thuật**:
> - Khi gọi **tuần tự** (4 dòng `await` kế tiếp nhau): Thời gian phản hồi tổng thể là tổng của 4 request cộng với độ trễ mạng ($T \approx t_1 + t_2 + t_3 + t_4 \approx 4 \times 500\text{ms} = 2.000\text{ms}$).
> - Khi gọi **song song với `Promise.all`**: Cả 4 request được trình duyệt khởi tạo đồng thời trong 1 chu kỳ I/O. Thời gian phản hồi tổng thể chỉ bằng request lâu nhất ($T \approx \max(t_1, t_2, t_3, t_4) \approx 520\text{ms}$).
> - Kết quả: Giải pháp gọi song song giúp trang chủ giảm thời gian chờ của người dùng tới gần **75%**.

---

## 4. 💡 Trả Lời 4 Câu Hỏi Lý Thuyết Của Đề Bài

### Câu 1: Tại sao nên dùng `Promise.all` / `Promise.allSettled` thay vì gọi tuần tự các API? Khi nào dùng `Promise.all` và khi nào dùng `Promise.allSettled`?
*(Người viết: Thành viên B)*

- **Lý do**: Khi các request API độc lập với nhau (kết quả request này không phải tham số đầu vào của request kia), việc gọi tuần tự bằng từng dòng `await` sẽ làm người dùng phải chờ tích luỹ thời gian của từng request ($T = \sum t_i$). Sử dụng `Promise.all` / `Promise.allSettled` giúp trình duyệt gửi đồng thời các request qua HTTP pool, đưa thời gian chờ xuống xấp xỉ thời gian của request lâu nhất ($T = \max(t_i)$).
- **Khi nào dùng `Promise.all`**: Dùng khi các phần dữ liệu có tính chất **toàn bộ hoặc không có gì (all-or-nothing)**. Nếu chỉ cần 1 request thất bại thì toàn bộ trang không thể hiển thị đúng hoặc không đủ điều kiện render (Ví dụ: Trang chủ cần đủ 4 thành phần Banner/Categories/Newest/Bestseller để cấu thành layout).
- **Khi nào dùng `Promise.allSettled`**: Dùng khi các tài nguyên **độc lập và không bắt buộc phụ thuộc lẫn nhau**. Một tài nguyên con bị lỗi không được làm sụp đổ toàn bộ trang, phần thành công vẫn hiển thị bình thường còn phần thất bại hiển thị thông báo lỗi cục bộ (Ví dụ: Trong `LaptopDetailPage.jsx`, sau khi tải xong thông tin laptop chính, phần Đánh giá và Laptop liên quan tải bằng `Promise.allSettled`; nếu API đánh giá lỗi thì tab Đánh giá hiện cảnh báo vàng, thông tin chi tiết laptop và sản phẩm cùng loại vẫn hiển thị trọn vẹn).

---

### Câu 2: Tại sao cần `AbortController` để hủy request cũ khi tìm kiếm (debounce) hoặc chuyển trang nhanh? Nếu không hủy thì lỗi gì có thể xảy ra?
*(Người viết: Trần Phú Long - Thành viên A)*

- **Lý do**: Trong các tác vụ như tìm kiếm từ khoá (Search Suggestion / Filter) hoặc chuyển đổi danh mục nhanh chóng, người dùng có thể kích hoạt nhiều request liên tiếp trong thời gian ngắn. Do độ trễ mạng bất định (network latency), request gửi trước không chắc chắn sẽ về trước request gửi sau.
- **Lỗi xảy ra nếu không hủy (Race Condition - Xung đột phiên)**:
  - Giả sử người dùng tìm kiếm `"macbook"`, sau đó sửa lại thành `"dell"`.
  - Request `"macbook"` có thể gặp sự cố nghẽn mạng và phản hồi về muộn hơn request `"dell"`.
  - Kết quả là màn hình hiển thị danh sách của `"macbook"` đè lên kết quả của `"dell"`, dù ô tìm kiếm đang là `"dell"`.
  - Dùng `AbortController.abort()` trong hàm cleanup của `useEffect` sẽ lập tức huỷ request cũ, đóng kết nối mạng, giải phóng tài nguyên CPU/RAM và đảm bảo chỉ kết quả của thao tác mới nhất được render lên UI.

---

### Câu 3: Phân tích cơ chế hoạt động của Custom Hook `useAxios` và việc chuẩn hoá xử lý lỗi tập trung qua Axios Interceptors?
*(Người viết: Thành viên B & Thành viên A)*

- **Cơ chế hoạt động của `useAxios`**:
  - Đóng gói toàn bộ logic bất đồng bộ phổ biến: `data`, `loading`, `error`, `refetch`, `setData`.
  - Tự động khởi tạo `new AbortController()` trong mỗi lần render có dependency thay đổi và chuyển `controller.signal` vào hàm gọi API.
  - Tự động gọi `controller.abort()` trong hàm cleanup khi component unmount hoặc dependency đổi.
  - Quan trọng nhất: Bỏ qua lỗi huỷ (`isCancel(err)`) để tránh việc tắt `loading` hay gán `error` sai khi người dùng cố tình chuyển trang hoặc đổi bộ lọc.
- **Chuẩn hoá lỗi qua Axios Interceptors**:
  - Tầng Interceptor ở `axiosClient.js` chặn bắt lỗi tập trung từ server trước khi lan truyền tới component.
  - Tự động trích xuất thông báo lỗi chuẩn tiếng Việt theo các mã HTTP: 400 (Dữ liệu không hợp lệ), 401 (Hết phiên đăng nhập $\rightarrow$ tự động xóa token và chuyển hướng), 403 (Không có quyền), 404 (Không tìm thấy), 500 (Lỗi máy chủ nội bộ), ECONNABORTED (Quá thời gian kết nối).
  - Giúp các component UI không cần phải viết lặp lại các khối `try/catch` cồng kềnh với nhiều dòng `if/else statusCode`.

---

### Câu 4: Phân biệt giữa Optimistic UI Update và Pessimistic UI Update trong việc xử lý giỏ hàng và danh sách sản phẩm. Ưu nhược điểm của từng phương pháp?
*(Người viết: Thành viên C)*

- **Pessimistic UI Update (Cập nhật bi quan - Chờ server)**:
  - *Cơ chế*: Ứng dụng hiển thị spinner/loading, gửi request lên máy chủ, chờ server phản hồi mã 200/201 thành công thì mới cập nhật state UI.
  - *Ưu điểm*: Đảm bảo tính nhất quán dữ liệu tuyệt đối 100%, không bao giờ xảy ra tình trạng UI báo thành công nhưng cơ sở dữ liệu lại thất bại.
  - *Nhược điểm*: Trải nghiệm người dùng bị chậm, phụ thuộc vào độ trễ mạng (người dùng phải chờ spinner).
- **Optimistic UI Update (Cập nhật lạc quan - Cập nhật UI trước)**:
  - *Cơ chế*: Giả định hành động chắc chắn sẽ thành công, cập nhật ngay giao diện tức thì (Ví dụ: bấm nút xoá laptop trong `AdminLaptopPage.jsx` thì dòng sản phẩm biến mất ngay lập tức trên bảng, hoặc sửa số lượng giỏ hàng nhảy số ngay). Đồng thời gửi request ngầm lên server. Nếu server trả về lỗi, hệ thống sẽ thực hiện **Rollback (hoàn tác)** lại trạng thái ban đầu và hiện Toast thông báo lỗi.
  - *Ưu điểm*: Giao diện phản hồi tức thì 0ms, mang lại trải nghiệm cực kỳ mượt mà cho người dùng.
  - *Nhược điểm*: Phải quản lý logic rollback cẩn thận khi gặp lỗi mạng, tránh để dữ liệu hiển thị sai lệch so với cơ sở dữ liệu.

---

## 5. 📑 Báo Cáo Kiểm Thử (Test Report)

Chi tiết kịch bản kiểm thử, bằng chứng ảnh chụp và ma trận kiểm thử xem tại:
👉 [**Tài Liệu Kiểm Thử docs/TEST_REPORT.md**](docs/TEST_REPORT.md)
