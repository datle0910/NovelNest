# Báo Cáo Triển Khai Chức Năng Crawler & Importer (Phase 9)

## 1. Tổng quan & Mục tiêu
Để cung cấp dữ liệu mẫu phong phú cho website đọc truyện chữ NovelNest, chúng tôi đã triển khai một hệ thống crawler/importer an toàn, tuân thủ các quy tắc đạo đức và pháp lý để import dữ liệu từ hai nguồn công khai:
- **TruyenCom (truyencom.com)**: Cho phép tải metadata và tối đa một số chương nội dung mẫu (Creative Commons).
- **LacaTruyen (lacatruyen.life)**: Chỉ cho phép import **Metadata** (không tải nội dung chương do chính sách bảo mật/sở hữu trí tuệ).

---

## 2. Thiết kế Kiến trúc & Các thành phần chính

### A. Database Schema Updates (`story_db`)
Hibernate tự động cập nhật cấu trúc database với chế độ `ddl-auto: update`:
- **`import_sources`**: Lưu cấu hình nguồn crawler (`name`, `baseUrl`, `allowed`, `licenseName`, `contentImportAllowed`, v.v.).
- **`import_logs`**: Nhật ký lưu trữ kết quả chạy crawler (`status`, `totalFound`, `totalImported`, `totalSkipped`, `totalFailed`, `startedAt`, `finishedAt`).
- **`stories`**: Bổ sung `source_name`, `source_url`, `license_name`, `attribution`, `imported`.
- **`chapters`**: Bổ sung `source_url`, `imported`.

### B. Backend Packages & Classes (`story-service`)
Nằm trong package `com.example.storyservice.crawler`:
1. **`ImportMode` (Enum)**: Các chế độ `METADATA_ONLY`, `METADATA_AND_SAMPLE_CHAPTERS`, `FULL_CONTENT_IF_ALLOWED`.
2. **`NovelSourceCrawler` (Interface)**: Định nghĩa các API dùng chung cho crawler (`fetchStoryList`, `fetchStoryDetail`, `fetchChapterList`, `fetchChapterContent`).
3. **`TruyenComCrawler`**: Trình cào dữ liệu từ TruyenCom sử dụng thư viện Jsoup để phân tích HTML.
4. **`LacaTruyenCrawler`**: Trình cào dữ liệu từ LacaTruyen. Enforce rule `METADATA_ONLY` bằng cách luôn trả về `null` ở hàm cào nội dung chương.
5. **`RobotsTxtService`**: Kiểm tra file `robots.txt` của nguồn để đảm bảo crawler tuân thủ yêu cầu của webmaster.
6. **`CrawlerService`**: Lớp xử lý nghiệp vụ chính: quản lý giao dịch, tạo slug, lưu database, check trùng lặp truyện (dựa trên source URL) và thực thi rate limit (delay 1.5s - 3s giữa các HTTP requests).

---

## 3. Các API Endpoints & Cấu hình Gateway

Tất cả các API được bảo vệ bằng Spring Security và chỉ cho phép người dùng có quyền `ADMIN` truy cập:

- **`POST /api/admin/import/preview`**: Lấy danh sách truyện xem trước mà không lưu vào DB.
- **`POST /api/admin/import/stories`**: Bắt đầu tiến trình import truyện theo danh sách hoặc thể loại.
- **`POST /api/admin/import/story-url`**: Import duy nhất 1 truyện cụ thể theo đường dẫn chi tiết.
- **`GET /api/admin/import/logs`**: Xem lịch sử các phiên import dữ liệu.
- **`GET /api/admin/import/logs/{id}`**: Xem chi tiết log cụ thể.

### Định tuyến API Gateway
Thêm cấu hình route trong file `api-gateway/src/main/resources/application.yml` trỏ đến `story-service`:
```yaml
        - id: story-service-admin-import
          uri: lb://story-service
          predicates:
            - Path=/api/admin/import/**
```

---

## 4. Frontend Admin UI (`frontend`)
Chúng tôi đã xây dựng giao diện hoàn chỉnh và tích hợp vào admin dashboard:
- **`src/api/adminImportApi.ts`**: Client API giao tiếp với Gateway qua token JWT.
- **`src/pages/admin/ImportDataPage.tsx`**: Trang cấu hình và quản lý import với các tính năng:
  - Form nhập thông số (Nguồn, Chế độ, URL, Số lượng truyện, Số lượng chương, Dry Run).
  - Nút **Preview** (Xem trước dữ liệu) và **Import** (Bắt đầu import).
  - Tích hợp thông báo trực quan (success/error banners) dựa trên local React state, tối ưu hóa kích thước build và loại bỏ các thư viện phụ thuộc bên ngoài như `react-hot-toast`.
  - Hiển thị bảng nhật ký lịch sử cào dữ liệu động cập nhật thời gian thực.
- **Menu điều hướng**: Thêm mục **Import dữ liệu** vào `AdminSidebar.tsx` và cấu hình route `/admin/import` trong `AppRoutes.tsx`.

---

## 5. Hướng dẫn Test & Chạy Thử
1. **Khởi chạy Hệ thống**: Chạy Eureka Server, API Gateway, Auth Service, Story Service và Frontend.
2. **Đăng nhập**: Đăng nhập tài khoản có quyền `ADMIN`.
3. **Truy cập Trang**: Nhấp chọn **Import dữ liệu** trên menu quản trị (hoặc truy cập trực tiếp `/admin/import`).
4. **Thực hiện Chạy Thử (Dry Run)**:
   - Chọn nguồn `TruyenCom`.
   - Bật checkbox **Chạy thử (Dry Run)**.
   - Nhấp nút **Preview** để xem danh sách truyện sẽ được cào từ nguồn.
   - Nhấp nút **Bắt đầu Import**. Hệ thống sẽ chạy tiến trình giả lập cào dữ liệu và hiển thị kết quả thống kê thành công mà không ghi dữ liệu vào database thực tế.
5. **Kiểm tra Logs**: Kiểm tra bảng **Lịch sử Import** ở phía dưới để thấy các tiến trình đã và đang thực thi.

---

## 6. Cam kết Tuân thủ & Rủi ro Pháp lý
- **Rate Limit**: Service được thiết kế để dừng ngẫu nhiên từ 1.5s - 3s giữa các lượt tải trang nhằm tránh spam DDoS tài nguyên nguồn.
- **Bảo mật**: LacaTruyen tuyệt đối không cho phép cào nội dung chương. Bất kỳ nỗ lực cào nội dung nào từ nguồn này sẽ bị chặn ngay lập tức ở tầng Crawler và trả về lỗi hoặc bỏ qua chương.
- **Tránh trùng lặp**: Hệ thống kiểm tra trùng lặp thông tin truyện bằng trường `sourceUrl` để đảm bảo dữ liệu gọn gàng và không spam db.
