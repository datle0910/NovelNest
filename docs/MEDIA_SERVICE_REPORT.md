# Báo Cáo Triển Khai Media Service (Phase 7)

## 1. Service mới đã tạo
- **Tên Service:** `media-service`
- **Port:** `8083`
- **Chức năng chính:** Quản lý upload và phân phối file hình ảnh (covers, avatars).
- Đã được đăng ký thành công với Eureka Server.

## 2. Các API media đã hoàn thành
- **`GET /api/media/health`**: Public endpoint kiểm tra trạng thái hoạt động của service.
- **`POST /api/media/upload/cover`**: API upload ảnh bìa (Yêu cầu JWT Token và role `ADMIN`).
- **`POST /api/media/upload/avatar`**: API upload avatar (Yêu cầu JWT Token, bất kỳ user nào đã đăng nhập).
- **`GET /media/covers/**` & `GET /media/avatars/**`**: Public endpoints để lấy ảnh trả về trình duyệt. File được lưu trong thư mục `uploads/`.

## 3. Route API Gateway đã thêm
- Thêm route trỏ đến `lb://media-service`:
  - `Path=/api/media/**,/media/**`

## 4. Frontend đã cập nhật
- **API Client**: Tạo mới file `frontend/src/api/mediaApi.ts` với hàm `uploadCover(file)` và `uploadAvatar(file)` (tự động mang JWT header qua `axiosClient`).
- **Admin Dashboard**: Cập nhật `StoryFormPage.tsx` để hỗ trợ `<input type="file">`.
  - Hiển thị preview sau khi nhập file hoặc URL.
  - Tự động gọi API upload khi người dùng chọn ảnh, hiển thị dòng trạng thái "Đang tải...".
  - Khi thành công, URL được gán vào textbox "Ảnh bìa (URL)" cũ.
- **Hiển thị Ảnh**: Các trang như `HomePage`, `StoryListPage`, `StoryDetailPage`, `FavoritePage`, `ReadingHistoryPage` đều dùng cơ chế fallback `<BookOpen />` hoặc placeholder đơn giản (bằng thẻ SVG hoặc default props của icon) khi ảnh bị null/không load được.

## 5. Cách test upload ảnh
1. **Khởi chạy hệ thống**: Bật `discovery-server`, `api-gateway`, `auth-service`, `story-service` và `media-service` (`mvn spring-boot:run` hoặc Docker/background task tùy ý).
2. **Khởi chạy Frontend**: `npm run dev`.
3. Đăng nhập với tài khoản Admin.
4. Truy cập **Admin Dashboard** -> Quản lý truyện -> Thêm mới truyện.
5. Click **"Choose File"** (hoặc "Chọn tệp") tại mục Ảnh bìa. 
6. Chọn 1 ảnh có định dạng JPEG, PNG hoặc WEBP, dung lượng < 5MB.
7. Đợi một giây, xem ảnh hiển thị phần Preview.
8. Bấm **Lưu Truyện**. Kiểm tra trên giao diện User xem ảnh đã hiện chưa.

## 6. Kết quả test bảo mật
- **`GET /api/media/health`**: Trả về 200 OK (Public).
- **`POST /api/media/upload/cover` (No Token)**: Bị chặn, trả về `401 Unauthorized`.
- **`POST /api/media/upload/cover` (User Token)**: Bị chặn, trả về `403 Forbidden`.
- **`POST /api/media/upload/cover` (Admin Token)**: Thành công, trả về JSON chứa URL.
- **`GET /media/covers/xxx.jpg`**: Trả về ảnh hợp lệ (Public).

## 7. Lỗi đã gặp và đã sửa
- Không có lỗi nghiêm trọng. Code Spring Security ở service mới được port thành công từ service cũ sang, tương thích 100%.

## 8. Những phần còn thiếu
- **Update Avatar API của User**: Trong `auth-service`, hiện chưa có chức năng cập nhật thông tin User Profile (Profile Endpoint). Tuy API upload Avatar bên `media-service` và `mediaApi.ts` đã hoàn thiện và sẵn sàng (chỉ Authenticated User mới dùng được), Frontend và Backend `auth-service` sẽ cần bổ sung trang `ProfilePage` và API `PUT /api/auth/profile` để gán URL này vào field `avatar` của bảng users trong giai đoạn sau.
