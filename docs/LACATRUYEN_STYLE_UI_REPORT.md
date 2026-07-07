# BÁO CÁO TÁI CẤU TRÚC GIAO DIỆN THEO PHONG CÁCH LACATRUYEN

## 1. Phong cách tham khảo từ Lacatruyen

Đã tham khảo các yếu tố phong cách sau:
- **Hero tối màu**: Gradient overlay navy/đen với ảnh nền mờ, featured story bên trái + cover card bên phải.
- **Carousel** với featured story, nút prev/next, indicator dots, counter "01/05".
- **Header trong suốt overlay** trên hero, chuyển sang nền trắng khi scroll.
- **Content area light**: bg-slate-50, card trắng, border nhẹ.
- **Sidebar** phải: top views, categories, CTA.
- **Search bar centered** với bo tròn, icon search.
- **Story card** dạng vertical với aspect ratio 3:4.

Không copy logo, ảnh, text thương hiệu, hay source code của Lacatruyen.

## 2. Các page/component đã thay đổi

### index.css
- Đổi từ dark theme hoàn toàn sang light content bg (slate-50) + dark hero areas.
- Brand color chuyển từ indigo (6366f1) sang rose (#f43f5e).
- Thêm classes: `.card-light`, `.hero-overlay`, `.hero-gradient`, `.glass-dark`, `.glow-brand`.
- Skeleton chuyển sang light variant (slate-200).
- Giữ lại animations cốt lõi.

### Components mới:
- `src/components/HeroCarousel.tsx` — Hero carousel full-width với featured stories từ API.

### Components sửa lại:
- `src/components/Header.tsx` — Fixed overlay, transparent trên hero, white khi scroll. Search bar centered. Categories dropdown. User menu. Mobile hamburger.
- `src/components/StoryCard.tsx` — aspect-[3/4], white bg, border-slate-200, badge góc, hover scale.
- `src/components/Footer.tsx` — Dark bg (slate-900), logo NovelNest, footer links.
- `src/components/LoadingSkeleton.tsx` — Light theme skeleton (bg-slate-200).
- `src/components/Loading.tsx` — Brand spinner màu rose.
- `src/components/ErrorMessage.tsx` — Light theme (bg-red-50, border-red-200).
- `src/components/EmptyState.tsx` — Light theme (bg-white, border-slate-100).
- `src/components/ConfirmModal.tsx` — Light theme, hỗ trợ cả prop cũ và mới.
- `src/components/Pagination.tsx` — Light theme, button trắng.
- `src/components/ChapterList.tsx` — Light theme.
- `src/components/CommentList.tsx` — Light theme, dùng `getStoryComments` + `CommentResponse`.
- `src/components/CommentForm.tsx` — Light theme, dùng `createComment({ storyId, chapterId, content })`.
- `src/components/RatingBox.tsx` — Light theme, dùng `getRatingSummary`, `submitRating`, `deleteMyRating`.
- `src/components/FavoriteButton.tsx` — Light theme, dùng `getFavoriteStatus`, `toggleFavorite`.

### Pages sửa lại:
- `src/pages/HomePage.tsx` — HeroCarousel + Category pills + Story grid (6 cols) + Sidebar (Top views, Categories, CTA).
- `src/pages/StoryListPage.tsx` — Light theme container, 5-column grid.
- `src/pages/SearchPage.tsx` — Light theme, search results grid.
- `src/pages/CategoryPage.tsx` — Light theme, category tabs, story grid.
- `src/pages/StoryDetailPage.tsx` — Light theme, cover + info card, stats, chapters, rating, comments.
- `src/pages/ReadingPage.tsx` — 3 themes (light/sepia/dark), font controls, nav buttons, keyboard nav, comments.
- `src/pages/LoginPage.tsx` — Light form card, gọi đúng API login + store login.
- `src/pages/RegisterPage.tsx` — Light form card, gọi register API + auto login.
- `src/pages/ForgotPasswordPage.tsx` — Light card, đúng API `requestForgotPasswordOtp`.
- `src/pages/VerifyOtpPage.tsx` — Light card, đúng API `verifyForgotPasswordOtp`.
- `src/pages/ResetPasswordPage.tsx` — Light card, đúng API `resetForgotPassword`.
- `src/pages/ChangePasswordPage.tsx` — Light card.
- `src/pages/FavoritePage.tsx` — Light theme, 5-column grid.
- `src/pages/ReadingHistoryPage.tsx` — Light theme, 3-column grid.
- `src/pages/ProfilePage.tsx` — Light theme, avatar upload + info form.
- `src/pages/NotFoundPage.tsx` — Light theme.
- `src/pages/ForbiddenPage.tsx` — Light theme.

### Layout:
- `src/layouts/MainLayout.tsx` — Full-width main (mỗi page tự quản lý container), Header, Footer.

### Không sửa:
- Admin pages (chỉ sửa ConfirmModal để tương thích, không đổi logic).
- API layer (axiosClient, api/*.ts).
- Types.
- Store (authStore).
- Routes (AppRoutes.tsx).

## 3. Cách hero carousel hoạt động

- File: `src/components/HeroCarousel.tsx`
- Props: `stories: StorySummary[]`, `loading?: boolean`
- HomePage gọi `getStories(0, 18)`, lấy 5 truyện đầu làm featured.
- Hero hiển thị full-width, height 620px desktop.
- Background: ảnh coverImage của truyện (nếu có) với overlay dark gradient.
- Left: badge "Đề cử nổi bật", title lớn, author, description (line-clamp-3), nút "Đọc Ngay".
- Right (desktop): ảnh bìa dạng card bo góc, shadow.
- Carousel auto-play 6s, nút prev/next, indicator dots, counter "01/05".
- Loading state: skeleton-dark hero.
- Empty/fallback state: NovelNest branding với button khám phá.

## 4. Cách sửa lỗi skeleton/loading

- Tất cả async component đều có try/catch/finally với `setLoading(false)` trong finally.
- Loading chỉ render skeleton (kích thước đúng với card thật), không render khối xám khổng lồ.
- Data empty → EmptyState component.
- API error → ErrorMessage component.
- Không để skeleton treo vĩnh viễn.
- HomePage: nếu loading và stories rỗng → hero skeleton. Khi data có → hero real.

## 5. Các file đã sửa

Tổng số file: **~30 files** bao gồm:
- 1 index.css (rewrite)
- 1 new component (HeroCarousel)
- 15 components rewritten
- 12 pages rewritten
- 1 layout rewritten

## 6. Kết quả build

```
npm run build
✓ built in 600ms
- dist/index.html                     0.61 kB
- dist/assets/logo                 1,609.61 kB
- dist/assets/index.css              77.60 kB (gzip: 11.93 kB)
- dist/assets/index.js              454.43 kB (gzip: 124.58 kB)
```

**BUILD: PASS**

## 7. Phần còn thiếu / hạn chế

- Admin pages chưa được redesign (giữ nguyên giao diện cũ cho đồng bộ logic).
- Một số API response mapping có thể khác với thực tế (cần test với backend thật).
- Theme toggle trên ReadingPage lưu localStorage nhưng chưa đồng bộ toàn app.
- Chưa có dark mode toggle global.
- Logo file (~1.6MB) hơi lớn, có thể tối ưu.

## 8. Trạng thái tổng thể

- **Trạng thái: PASS**
- Build: PASS
- TypeScript errors: 0
- UI thay đổi rõ rệt: Có (hero carousel, light content bg, professional header, sidebar)
- Admin: Không phá
- Logic API: Giữ nguyên
