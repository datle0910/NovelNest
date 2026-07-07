---
title: NovelNest
emoji: 📖
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# NovelNest - Nền tảng Đọc Truyện Trực Tuyến 📖

Dự án NovelNest phiên bản chạy Microservices trên Hugging Face Spaces.

## Cấu trúc Hệ thống chạy gộp trong 1 Container:
1. **Frontend (React)**: Phục vụ tĩnh qua Nginx ở cổng `7860` (được Hugging Face ánh xạ ra ngoài).
2. **API Gateway (Spring Cloud Gateway)**: Chạy ở cổng `8080` (được Nginx chuyển tiếp các yêu cầu bắt đầu bằng `/api/` hoặc `/ws/`).
3. **Discovery Server (Eureka)**: Chạy ngầm ở cổng `8761`.
4. **Microservices (Auth, Story, Media)**: Lần lượt chạy ở các cổng `8081`, `8082`, `8083`.
5. **Database (MySQL)**: Kết nối cơ sở dữ liệu MySQL chạy trên Aiven Cloud.
