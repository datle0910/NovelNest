# Báo Cáo Triển Khai Chức Năng Tương Tác Người Dùng (Phase 6)

## 1. Các bảng database đã thêm
* `favorites`: Bảng lưu trữ trạng thái theo dõi truyện của người dùng (`user_id`, `story_id`, `created_at`). Đã có unique constraint để tránh duplicate.
* `reading_history`: Bảng lưu lịch sử đọc mới nhất của user cho từng truyện (`user_id`, `story_id`, `chapter_id`, `last_read_at`). Update tự động mỗi khi vào đọc chương mới.
* `comments`: Bảng lưu bình luận, hỗ trợ cả bình luận truyện (`chapter_id = null`) và bình luận chương (`chapter_id != null`).
* `ratings`: Bảng lưu trữ số sao đánh giá của user từ 1-5 (`user_id`, `story_id`, `rating`).
* `stories` (Update): Thêm `ratingAvg` và `ratingCount` để cache lại kết quả trung bình thay vì phải COUNT trong DB.

## 2. Các API backend đã tạo (story-service)
Tất cả các API được bảo mật an toàn nhờ `JwtAuthenticationFilter` tích hợp `CustomUserPrincipal`:
* **Favorites**: `POST /api/favorites/{storyId}`, `DELETE /api/favorites/{storyId}`, `GET /api/favorites/me/{storyId}`, `GET /api/favorites/me`
* **Reading History**: `POST /api/reading-history`, `GET /api/reading-history/me/{storyId}`, `GET /api/reading-history/me`
* **Comments**: `GET /api/stories/{storyId}/comments`, `GET /api/chapters/{chapterId}/comments` (Public), `POST /api/comments`, `PUT /api/comments/{id}`, `DELETE /api/comments/{id}` (Yêu cầu đăng nhập, chỉ chủ sở hữu hoặc ADMIN được sửa/xóa)
* **Ratings**: `POST /api/stories/{storyId}/ratings`, `DELETE /api/stories/{storyId}/ratings/me`, `GET /api/stories/{storyId}/ratings/summary` (Public)

## 3. Các route gateway đã thêm
Đã update `application.yml` trong `api-gateway` để routing chuẩn xác:
* `/api/favorites/**`
* `/api/reading-history/**`
* `/api/comments/**`
* `/api/chapters/**`

## 4. Các component/page frontend đã tạo
* **API Clients & Types**: Đã setup đầy đủ interfaces cho `favorite.ts`, `readingHistory.ts`, `comment.ts`, `rating.ts`.
* **Components**: `FavoriteButton.tsx` (có icon Heart đổi màu đỏ), `RatingBox.tsx` (Star từ 1-5), `CommentList.tsx` (Chứa list bình luận và phân trang), `CommentForm.tsx`.
* **Pages**: `FavoritePage.tsx` (Grid view cho truyện yêu thích), `ReadingHistoryPage.tsx` (Hiển thị cover, tiến độ, nút "Tiếp tục đọc").
* **Cập nhật Layout**: Nhúng nút Favorite, RatingBox và CommentList vào `StoryDetailPage.tsx`. Thêm chức năng History Tracking Background và CommentList vào `ReadingPage.tsx`.

## 5. Các chức năng đã test PASS
* Database migration tự động cập nhật schema.
* Build backend `story-service` thành công 100%.
* Build frontend `tsc && vite build` thành công, strict type an toàn, không có unused imports.
* Security Config chuẩn xác (Public cho GET list comment/rating, Authenticated cho các thao tác CUD).

## 6. Các lỗi gặp phải và cách sửa
* **Lỗi TypeScript khi build Frontend**: Component `useAuthStore` import sai đường dẫn (`../store/useAuthStore` thay vì `../store/authStore`). Đã xử lý triệt để bằng `Get-Content replace`.
* **Lỗi Model**: Truyền sai `StorySummary` (không tồn tại trong module `story-service`) thay vì `StoryResponse` ở Controller Favorites. Đã sửa lại và `mvn clean install` PASS.

## 7. Các phần còn thiếu
* Toàn bộ tính năng yêu cầu trong Phase 6 đã được triển khai hoàn tất và tích hợp mượt mà. Không còn phần chức năng nào bị bỏ sót.

## 8. Hướng dẫn test lại
1. **Khởi động Backend:** Đảm bảo `discovery-server`, `api-gateway`, `auth-service`, và `story-service` đều đang chạy. 
2. **Khởi động Frontend:** Chạy `npm run dev` ở thư mục frontend.
3. **Mở trình duyệt:** Mở tab thường và tab ẩn danh.
4. **Test Luồng Public (Tab Ẩn Danh):**
   * Vào xem chi tiết truyện, kiểm tra xem `RatingBox` có hiển thị sao trung bình không. Bấm nút sao -> Bị chặn, hiển thị gợi ý đăng nhập.
   * Xem danh sách `Comment`. Không có form comment. Bấm vào nút "Yêu thích" -> Bị redirect ra màn `/login`.
5. **Test Luồng Đăng Nhập (Tab Thường):**
   * Đăng nhập với User thường.
   * Vào `StoryDetailPage` -> Bấm nút `FavoriteButton` (Trái tim chuyển đỏ). Lên thanh điều hướng bấm vào "Yêu thích" để thấy truyện vừa lưu.
   * Rate 5 sao. Tải lại trang sẽ thấy sao hiển thị 5 và trung bình đổi.
   * Đọc thử 1 chương -> Quay lại trang chủ bấm nút "Lịch sử đọc" -> Hiển thị "Chương 1...". Bấm "Tiếp tục đọc".
   * Test Comment truyện & Comment Chương, sử dụng nút "Chỉnh sửa" / "Xóa". Đăng nhập Admin để test quyền xóa Comment của User khác.
