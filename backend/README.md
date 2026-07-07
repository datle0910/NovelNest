# NovelNest - Nền tảng Đọc Truyện Trực Tuyến 📖

NovelNest là một nền tảng đọc truyện chữ trực tuyến mạnh mẽ, được thiết kế theo kiến trúc **Microservices**, cho phép mở rộng dễ dàng và hiệu suất cao. Dự án cung cấp cả giao diện người dùng để đọc truyện và giao diện quản trị viên (Admin Dashboard) để quản lý nội dung.

## 🌟 Chức năng nổi bật (Hoàn thành 100%)

### Dành cho Người Dùng (User)
- **Bảo mật**: Đăng ký, Đăng nhập, JWT, Refresh Token tự động, Quên mật khẩu qua OTP.
- **Khám phá**: Xem danh sách truyện, Phân trang, Tìm kiếm, Lọc truyện theo Thể loại.
- **Tương tác**: Đánh giá truyện (1-5 sao), Viết bình luận (trên truyện & chương), Thêm truyện vào Danh sách Yêu thích.
- **Trải nghiệm Đọc**: Theo dõi tự động Lịch sử đọc, Nút "Tiếp tục đọc", Chuyển chương tiện lợi.
- **Cá nhân hóa**: Cập nhật Hồ sơ cá nhân, Tải lên Ảnh Đại diện (Avatar), Đổi Mật khẩu an toàn.

### Dành cho Quản trị viên (Admin)
- **Dashboard**: Giao diện Quản trị riêng biệt (chỉ truy cập bằng tài khoản `ADMIN`).
- **Quản lý Nội dung**: Thêm/Sửa/Xóa Tác giả, Thể loại, Truyện, và Chương.
- **Đa phương tiện**: Tải lên và quản lý Ảnh bìa truyện qua `media-service`.

## 🏗 Kiến trúc Hệ thống

Dự án sử dụng kiến trúc Microservices với các thành phần:

1. **discovery-server (Port 8761)**: Eureka Registry.
2. **api-gateway (Port 8080)**: Cổng giao tiếp API tập trung, xử lý CORS.
3. **auth-service (Port 8081)**: Xác thực, quản lý người dùng, JWT.
4. **story-service (Port 8082)**: Quản lý truyện, thể loại, tương tác (bình luận, đánh giá, lịch sử đọc).
5. **media-service (Port 8083)**: Tải lên và lưu trữ ảnh (Ảnh bìa, Avatar).
6. **Frontend (Port 5173)**: React SPA.
7. **Database (Port 3306)**: MySQL Docker.

## 🚀 Công nghệ Sử dụng

- **Backend**: Java 21, Spring Boot 3.3, Spring Cloud, Spring Security, JWT, Hibernate JPA.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, Axios, React Router v6.
- **Database**: MySQL.

## 📂 Cấu trúc Thư mục

```text
NovelNest/
├── backend/
│   ├── discovery-server/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── story-service/
│   └── media-service/
├── frontend/
├── docker-compose.yml
└── README.md
```

## 🛠 Hướng dẫn Cài đặt & Chạy Dự án

### 1. Khởi chạy Database
Yêu cầu: Docker
```bash
docker compose up -d
```
Docker sẽ chạy MySQL ở cổng `3306`. Dữ liệu sẽ tự động được Spring Boot migrate khi khởi động.

### 2. Khởi chạy Backend Services
Di chuyển vào từng thư mục và chạy lệnh Maven (cần cài đặt Java 21 & Maven). **Bắt buộc chạy theo đúng thứ tự:**

1. **Discovery Server**: `cd backend/discovery-server` -> `mvn spring-boot:run`
2. **API Gateway**: `cd backend/api-gateway` -> `mvn spring-boot:run`
3. **Auth Service**: `cd backend/auth-service` -> `mvn spring-boot:run`
4. **Story Service**: `cd backend/story-service` -> `mvn spring-boot:run`
5. **Media Service**: `cd backend/media-service` -> `mvn spring-boot:run`

*Truy cập [http://localhost:8761](http://localhost:8761) để kiểm tra tất cả các services đã đăng ký thành công lên Eureka.*

### 3. Khởi chạy Frontend
Yêu cầu: Node.js (v18+)
```bash
cd frontend
npm install
npm run dev
```
Giao diện ứng dụng sẽ chạy tại: [http://localhost:5173](http://localhost:5173)

## 🔑 Tài khoản Mặc định

Hệ thống tự động tạo một tài khoản Admin khi chạy lần đầu:
- **Email**: `admin@novelnest.com`
- **Mật khẩu**: `admin123`

## 🧪 Cách Test Nhanh
1. Truy cập `http://localhost:5173`, đăng nhập bằng tài khoản Admin ở trên.
2. Truy cập tab `Admin` trên Header.
3. Tạo Thể loại -> Tạo Tác giả -> Tạo Truyện (Tải ảnh bìa) -> Tạo Chương.
4. Đăng xuất. Tạo tài khoản User mới.
5. Đăng nhập User mới -> Tìm kiếm truyện vừa tạo -> Đọc truyện -> Thêm vào Yêu thích -> Viết bình luận.
6. Chuyển sang trang Hồ sơ cá nhân -> Cập nhật Avatar.

## ⚠️ Lỗi thường gặp & Cách xử lý
- **Lỗi 401 khi gọi API**: JWT Token hết hạn. Hệ thống Frontend đã tự động có interceptors gọi refresh-token. Nếu vẫn bị 401, hãy thử Đăng xuất và đăng nhập lại.
- **Lỗi CORS**: Hãy chắc chắn `api-gateway` đang chạy ở `localhost:8080`. Frontend KHÔNG ĐƯỢC gọi trực tiếp cổng `8081` hay `8082`.
- **Dịch vụ không hiển thị trên Eureka**: Kiểm tra xem `discovery-server` có được chạy ĐẦU TIÊN hay không.

---
**Tác giả**: NovelNest Team | **Phiên bản**: 1.0 (Bản Demo Tốt nghiệp)
