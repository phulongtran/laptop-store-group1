# Báo cáo kiểm thử – LaptopStore v1.0.0

- Nhánh: `release/1.0.0` · Commit: `v1.0.0` · Ngày: 28/10/2026
- Môi trường: Chrome 130+, Windows 11 / macOS, `npm run reset-db && npm start`
- Tester: A (Trần Phú Long), C (Member C)

| # | Thao tác | Kết quả mong đợi | Tester | Kết quả | Bug |
|---|---|---|---|---|---|
| 1 | Vào `/` | Skeleton → khối Bán chạy, Mới về, nút hãng; Badge DEV tuần tự > song song | C | ✅ Pass | |
| 2 | Bấm nút hãng "Asus" | `/laptops?brandId=3`, chỉ laptop Asus | C | ✅ Pass | |
| 3 | RAM ≥ 16, giá tăng dần, trang 2 | URL đủ tham số, kết quả đúng; F5 giữ nguyên | C | ✅ Pass | |
| 4 | Slow 3G, bấm nhanh 4 hãng | 3 request (canceled), đúng hãng cuối, không Alert lỗi | A | ✅ Pass | |
| 5 | Gõ "rog" ô tìm kiếm Navbar | Sau 400ms dropdown gợi ý, 1 request | A | ✅ Pass | |
| 6 | Chi tiết, bấm 3 laptop liên quan liên tiếp | Breadcrumb/ảnh/thông số đổi đúng; request cũ hủy | A | ✅ Pass | |
| 7 | Chưa đăng nhập bấm "Thêm vào giỏ" | `/login`; đăng nhập xong quay lại trang chi tiết | C | ✅ Pass | |
| 8 | Thêm 2 laptop, tăng số lượng, F5 | Badge và trang giỏ giữ nguyên | C | ✅ Pass | |
| 9 | Tăng số lượng vượt tồn kho | Nút + disable / Toast "Chỉ còn x sản phẩm" | C | ✅ Pass | |
| 10 | Đặt hàng (SĐT 10 số bắt đầu 0) | `/orders` + Toast mã đơn; db: đơn mới, stock giảm, giỏ rỗng | C | ✅ Pass | |
| 11 | Hủy đơn vừa đặt | `cancelled`, stock cộng lại | C | ✅ Pass | |
| 12 | Customer gõ `/admin` | Về `/` + Toast không có quyền | A | ✅ Pass | |
| 13 | Admin thêm laptop giá sale ≥ giá gốc | Form báo lỗi, không gửi request | A | ✅ Pass | |
| 14 | Admin thêm laptop hợp lệ | `/admin/laptops` + Toast "Đã lưu ..."; có ở trang khách | A | ✅ Pass | |
| 15 | Admin sửa nhanh tồn kho | PATCH chỉ chứa `{ stock }` | A | ✅ Pass | |
| 16 | Admin xoá hàng loạt 3 laptop | 3 DELETE song song, Toast "Đã xóa 3/3 laptop" | A | ✅ Pass | |
| 17 | Tắt json-server, xoá 1 sản phẩm trong giỏ | Dòng biến mất rồi khôi phục + Toast lỗi | C | ✅ Pass | |
| 18 | Tắt json-server, F5 danh sách | ErrorAlert "Không kết nối được máy chủ..." + Thử lại; bật lại → có dữ liệu | A | ✅ Pass | |
| 19 | Vào `/abc`, `/laptops/9999` | 404 / "Không tìm thấy dữ liệu" | C | ✅ Pass | |

## Checklist tự đánh giá (đề)

- [x] Không còn `.then()`; không có `useEffect(async ...)` (hook pre-push xác nhận)
- [x] Chỉ `src/api` import axios; không có URL cứng trong component
- [x] Interceptor gắn token, đo thời gian, chuẩn hoá lỗi tiếng Việt, giữ nguyên lỗi hủy
- [x] `Promise.all` ở trang chủ và kiểm tra tồn kho; `Promise.allSettled` ở chi tiết, trừ kho, xoá hàng loạt
- [x] Mọi GET trong `useEffect` có AbortController + cleanup
- [x] Skeleton, Spinner, Alert + Thử lại, EmptyState, Modal, Toast; responsive 375px
- [x] Route lồng nhau, ProtectedRoute theo vai trò, quay lại trang cũ, bộ lọc trên URL, trang 404
- [x] Giỏ hàng, đơn hàng, đánh giá, CRUD laptop lưu thật trong `db.json`
- [x] `useAxios`, `useDebounce`, xoá hàng loạt, optimistic update đúng kịch bản

## Lỗi phát hiện và xử lý

Toàn bộ 19 kịch bản kiểm thử đã được chạy và xác nhận đạt yêu cầu. Các lỗi phát sinh trong quá trình ghép code đã được sửa và kiểm tra lại thành công trước khi đóng issue.
