# Báo Cáo Admin Dashboard (Phase 5)

## 1. Các page admin đã tạo
* `AdminDashboardPage.tsx`: Trang chủ dashboard thống kê tổng quan (số lượng truyện, thể loại, tác giả).
* `StoryManagementPage.tsx`: Quản lý danh sách truyện.
* `StoryFormPage.tsx`: Form thêm mới hoặc cập nhật truyện (sử dụng chung).
* `ChapterManagementPage.tsx`: Quản lý danh sách chương của một truyện.
* `ChapterFormPage.tsx`: Form thêm mới hoặc cập nhật chương.
* `CategoryManagementPage.tsx`: Quản lý danh sách và form inline để CRUD thể loại.
* `AuthorManagementPage.tsx`: Quản lý danh sách và form inline để CRUD tác giả.
* `ForbiddenPage.tsx`: Trang 403 từ chối quyền truy cập dành cho tài khoản không phải ADMIN.

## 2. Các route admin đã thêm
Tất cả các route này đều được bọc bởi `AdminRoute` và `AdminLayout`:
* `/admin`
* `/admin/stories`
* `/admin/stories/create`
* `/admin/stories/edit/:id`
* `/admin/stories/:storyId/chapters`
* `/admin/stories/:storyId/chapters/create`
* `/admin/chapters/edit/:id`
* `/admin/categories`
* `/admin/authors`

## 3. Các API đã kết nối
Thông qua axiosClient định tuyến qua API Gateway (`http://localhost:8080`), tôi đã kết nối các API sau:
* **Story Admin:** `POST /api/admin/stories`, `PUT /api/admin/stories/{id}`, `DELETE /api/admin/stories/{id}`
* **Chapter Admin:** `POST /api/admin/stories/{storyId}/chapters`, `PUT /api/admin/chapters/{id}`, `DELETE /api/admin/chapters/{id}`
* **Category Admin:** `POST /api/admin/categories`, `PUT /api/admin/categories/{id}`, `DELETE /api/admin/categories/{id}`
* **Author Admin:** `POST /api/admin/authors`, `PUT /api/admin/authors/{id}`, `DELETE /api/admin/authors/{id}`

## 4. Các chức năng đã test PASS
* **Bảo vệ Route:** Người dùng chưa đăng nhập sẽ bị đẩy về `/login`. Đăng nhập Role `USER` bị đẩy về `/403`. Chỉ `ADMIN` được phép hiển thị giao diện.
* **Layout:** Menu bên trái hoạt động tốt, hiển thị trạng thái active, nút đăng xuất, nút về trang chủ.
* **Dashboard:** Lấy số lượng thống kê chuẩn xác qua các public endpoint.
* **Quản lý Thể loại / Tác giả:** Có thể hiển thị form dạng inline/modal để thao tác thêm, sửa nhanh gọn. Sau khi Lưu thì tự reload lại list. Bấm xóa có Confirm popup.
* **Quản lý Truyện:** Thêm và sửa thành công. Form đã thiết kế sử dụng UI input, text area đầy đủ. Ràng buộc các field bắt buộc, có checkbox list để chọn nhiều Categories. 
* **Quản lý Chương:** Sắp xếp danh sách chương theo từng Truyện.

## 5. Các lỗi đã gặp và đã sửa
Không có lỗi phát sinh nghiêm trọng. TypeScript strict-typing đã được duy trì xuyên suốt. Quá trình chạy lệnh `npm run build` thành công 100%.

## 6. Các phần chưa làm được do thiếu API backend
* **Không có API GET theo ID:** Các endpoint Public API cho phép lấy chi tiết truyện/chương sử dụng `slug` và `chapterNumber` thay vì `ID`. 
* **Cách khắc phục tạm ở Frontend:**
  * Tại `StoryFormPage.tsx` (Khi Edit): Gọi list stories rồi `.find()` để map vào form.
  * Tại `ChapterFormPage.tsx` (Khi Edit): Sử dụng state params của Router để truyền qua `storySlug` và `chapterNumber` sang, sau đó dùng hàm getChapter public API.
* **Đề xuất Phase tới:** Bổ sung API Admin `GET /api/admin/stories/{id}` và `GET /api/admin/chapters/{id}` tại Backend để hỗ trợ trang Edit hoạt động chắc chắn hơn khi user F5.

## 7. Hướng dẫn test admin dashboard
1. **Chạy Backend:**
```bash
docker compose up -d
cd backend/discovery-server && mvn spring-boot:run
cd backend/api-gateway && mvn spring-boot:run
cd backend/auth-service && mvn spring-boot:run
cd backend/story-service && mvn spring-boot:run
```
2. **Chạy Frontend:**
```bash
cd frontend && npm run dev
```
3. **Mở trình duyệt:** Vào địa chỉ `http://localhost:5173/admin`
4. **Đăng nhập Admin:**
  * **Email:** admin@novelnest.com
  * **Password:** admin123
5. Kiểm tra các luồng thao tác: Click qua lại các menu, test thêm 1 truyện mới, sửa truyện cũ, thêm chương...
