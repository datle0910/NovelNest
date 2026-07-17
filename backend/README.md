# NovelNest - Nền tảng Đọc Truyện Trực Tuyến 📖

NovelNest là nền tảng đọc truyện chữ trực tuyến, được xây dựng với kiến trúc **Monolith** (Spring Boot đơn), giúp đơn giản hóa triển khai và phát triển cục bộ.

## 🌟 Chức năng nổi bật

### Dành cho Người Dùng (User)
- **Bảo mật**: Đăng ký, Đăng nhập, JWT, Refresh Token tự động, Quên mật khẩu qua OTP.
- **Khám phá**: Xem danh sách truyện, Phân trang, Tìm kiếm, Lọc truyện theo Thể loại.
- **Tương tác**: Đánh giá truyện (1-5 sao), Viết bình luận, Thêm truyện vào Yêu thích.
- **Trải nghiệm Đọc**: Theo dõi Lịch sử đọc, Nút "Tiếp tục đọc", Chuyển chương tiện lợi.
- **Cá nhân hóa**: Cập nhật Hồ sơ cá nhân, Tải lên Avatar, Đổi Mật khẩu.

### Dành cho Quản trị viên (Admin)
- **Dashboard**: Giao diện Quản trị riêng biệt (chỉ truy cập bằng tài khoản `ADMIN`).
- **Quản lý Nội dung**: Thêm/Sửa/Xóa Tác giả, Thể loại, Truyện, và Chương.
- **Đa phương tiện**: Upload ảnh bìa truyện và avatar.

## 🏗 Kiến trúc Hệ thống

Dự án sử dụng kiến trúc **Monolith** với một Spring Boot application duy nhất:

```
novelnest-backend (Port 8080)
├── auth/         - Xác thực, JWT, quản lý user
├── story/        - Quản lý truyện
├── chapter/      - Quản lý chương
├── comment/      - Bình luận
├── rating/       - Đánh giá
├── favorite/     - Yêu thích
├── history/      - Lịch sử đọc
├── media/        - Upload ảnh
├── author/       - Quản lý tác giả
├── category/     - Thể loại
├── security/     - JWT Filter, Security utils
└── websocket/    - WebSocket cho Admin reports
```

## 🚀 Công nghệ Sử dụng

- **Backend**: Java 21, Spring Boot 3.3, Spring Security, JWT, Hibernate JPA.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, Axios, React Router v6.
- **Database**: MySQL (một database duy nhất: `novelnest_db`).

## 📂 Cấu trúc Thư mục

```text
NovelNest/
├── backend/
│   ├── novelnest-backend/   # ← Monolith chính (dùng cái này)
│   ├── auth-service/        # (Legacy - không dùng nữa)
│   ├── story-service/       # (Legacy - không dùng nữa)
│   ├── media-service/       # (Legacy - không dùng nữa)
│   ├── discovery-server/    # (Legacy - không dùng nữa)
│   └── api-gateway/         # (Legacy - không dùng nữa)
├── frontend/
├── docker-compose.yml
└── README.md
```

## 🛠 Hướng dẫn Cài đặt & Chạy Dự án

### 1. Khởi chạy Database (Docker)

```bash
cd backend
docker compose up mysql -d
```

Docker sẽ chạy MySQL ở cổng `3306` và tự tạo database `novelnest_db`.

### 2. Khởi chạy Backend (Monolith)

```bash
cd backend/novelnest-backend
mvn spring-boot:run
```

Backend sẽ chạy tại `http://localhost:8080`. Spring Boot sẽ tự động tạo/update schema.

### 3. Khởi chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

Giao diện ứng dụng sẽ chạy tại: [http://localhost:5173](http://localhost:5173)

## 🔑 Tài khoản Mặc định

Hệ thống tự động tạo tài khoản Admin khi chạy lần đầu:
- **Email**: `admin@novelnest.com`
- **Mật khẩu**: `admin123`

## 🧪 Cách Test Nhanh
1. Truy cập `http://localhost:5173`, đăng nhập bằng tài khoản Admin.
2. Truy cập tab `Admin` trên Header.
3. Tạo Thể loại → Tạo Tác giả → Tạo Truyện (Tải ảnh bìa) → Tạo Chương.
4. Đăng xuất. Tạo tài khoản User mới.
5. Đăng nhập User → Tìm kiếm truyện → Đọc → Yêu thích → Bình luận.

## ⚠️ Lỗi thường gặp & Cách xử lý
- **Lỗi 401 khi gọi API**: JWT Token hết hạn. Frontend tự động gọi refresh-token. Nếu vẫn lỗi, hãy đăng xuất và đăng nhập lại.
- **Lỗi CORS**: Đảm bảo backend đang chạy tại `localhost:8080`. Frontend **KHÔNG ĐƯỢC** gọi trực tiếp port khác.
- **Database connection failed**: Đảm bảo MySQL đang chạy và database `novelnest_db` tồn tại.

---
**Tác giả**: NovelNest Team | **Phiên bản**: 2.0 (Monolith Architecture)
