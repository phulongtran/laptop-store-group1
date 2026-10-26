## Mô tả
<!-- Thay đổi gì và vì sao -->

Closes #

## Loại thay đổi
- [ ] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] chore  - [ ] test

## Cách kiểm thử
1. `npm run reset-db && npm start`
2. Đăng nhập bằng ...
3. ...
Kết quả mong đợi: ...

## Ảnh chụp màn hình
<!-- Bắt buộc với thay đổi giao diện: desktop + mobile 375px; tab Network nếu liên quan request -->

## Checklist
- [ ] Tiêu đề PR theo Conventional Commits
- [ ] Đã rebase/merge develop mới nhất
- [ ] `npm run build` thành công, hook pre-push không báo lỗi
- [ ] Đã tự test các trường hợp chính và trường hợp lỗi (tắt json-server, Slow 3G nếu có gọi API)
- [ ] Component không import axios, không `.then()`, không `alert/confirm` (TECH-01, 02, 05)
- [ ] GET trong `useEffect` có AbortController + cleanup, bỏ qua lỗi hủy (TECH-03)
- [ ] Có loading / error / empty; render danh sách có `key`; Console không lỗi đỏ
- [ ] Không commit `.env`, `db.json` đã bị json-server ghi đè
- [ ] Đã cập nhật README (nếu cần)
