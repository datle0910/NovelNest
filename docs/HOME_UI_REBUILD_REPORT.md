# HOME_UI_REBUILD_REPORT

## 1. Lý do giao diện cũ lỗi
- Layout của HomePage chứa một thẻ div xám `bg-gray-800 h-96` cố định làm hero mà không hề có content, dẫn đến khoảng trống xám rất lớn trên cùng màn hình.
- StoryCard không có container tỷ lệ, không check null ảnh, gây ra lỗi layout và text bị sát vào mép. Text tiêu đề không dùng `line-clamp` dẫn đến tràn nội dung.
- Thiếu các thành phần container (như `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`) làm nội dung bị nới tràn màn hình.
- Các API khi bị lỗi kết nối từ Spring Boot (hoặc load quá lâu) rơi vào catch block nhưng không tắt loading state đúng cách, làm skeleton xám hiển thị mãi mãi.
- Search input ở Header bị lỗi placeholder chồng chéo do padding và position class sai.

## 2. Các file đã sửa
- `src/index.css`: Cập nhật CSS variables (tông sáng `bg-slate-50`), sửa lỗi css phá layout.
- `src/layouts/MainLayout.tsx`: Tái cấu trúc, bọc nội dung trong thẻ `main` với các class container chuẩn.
- `src/components/Header.tsx`: Cập nhật toàn bộ Header.
- `src/pages/HomePage.tsx`: Viết lại 100% logic và layout hiển thị.

## 3. Component đã viết lại từ đầu
1. **Header.tsx**: Chiều cao 64px, dính sticky top, border mảnh. Logo "NovelNest" đi kèm icon tím nổi bật. Thêm search bar ở giữa tròn trịa, input không bị lỗi đè chữ. Có dropdown profile và mobile menu.
2. **HomePage.tsx**: 
   - Thay khối xám trống bằng Hero Section có gradient tím (violet/indigo) lộng lẫy, có dòng chữ *"Khám phá thế giới truyện chữ tại NovelNest"*, nút *"Khám phá truyện"*, *"Xem truyện mới"*, và sidebar nhỏ hiển thị con số thống kê.
   - Bổ sung 3 Card Lợi Ích: Đọc truyện dễ dàng, Lưu lịch sử, Theo dõi.
   - Thể loại hiển thị theo định dạng Badge/Chip.
   - Grid truyện mới cập nhật gọn gàng 5-6 cột.
3. **StoryCard.tsx**: Khóa cứng kích thước bìa truyện là `aspect-[3/4]`, bo góc tròn. Khi hover có hiệu ứng nâng thẻ lên và thả bóng nhẹ nhàng (`hover:-translate-y-1 hover:shadow-md`). Nếu truyện không có bìa, hiển thị layout placeholder với chữ cái đầu gọn gàng. Gắn badge ONGOING, COMPLETED cực nét ở góc trái trên.
4. **EmptyState.tsx / ErrorMessage.tsx / LoadingSkeleton.tsx**: Viết thêm để bẫy mọi trường hợp dữ liệu hỏng / không tải được.

## 4. Cách đã sửa lỗi skeleton/loading
- Ở các page và component (nhất là `HomePage`), logic fetch data được đặt trong hàm `async/await` và block `try...catch...finally`.
- Tại phần `finally { setLoading(false); }` được đưa vào để ép `loading` phải đóng bất kể API trả về data chuẩn, mảng rỗng, hay Network Error 500. 
- Mảng dữ liệu được map an toàn bằng: `setStories(res.data?.content || []);` tránh lỗi undefined.

## 5. Kết quả build
- Lệnh: `npm run build`
- Trạng thái: **PASS** (Thời gian build thành công: ~372ms).

## 6. Cách test lại trang chủ
1. Khởi động Frontend: `npm run dev`
2. Truy cập `http://localhost:5173`.
3. Kiểm tra Header: Xác nhận logo tên "NovelNest", thanh Search nằm ở giữa, giao diện sáng sủa.
4. Kiểm tra Hero Banner: Thay cho khối xám là khu vực gradient có text và nút thật.
5. Kiểm tra danh sách: Nếu không bật backend, giao diện sẽ show `ErrorMessage` (Lỗi kết nối máy chủ). Không có lỗi treo skeleton xảy ra.
6. Khi bật backend Java, lưới truyện (`StoryCard`) sẽ tải lên với tỷ lệ khung hình cực chuẩn và hiệu ứng bóng đổ đẹp.
