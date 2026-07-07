package com.example.storyservice.config;

import com.example.storyservice.author.Author;
import com.example.storyservice.author.AuthorRepository;
import com.example.storyservice.category.Category;
import com.example.storyservice.category.CategoryRepository;
import com.example.storyservice.chapter.Chapter;
import com.example.storyservice.chapter.ChapterRepository;
import com.example.storyservice.common.SlugUtils;
import com.example.storyservice.story.Story;
import com.example.storyservice.story.StoryRepository;
import com.example.storyservice.story.StoryStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

//@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;
    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0 && authorRepository.count() == 0 && storyRepository.count() == 0) {
            log.info("Initializing dummy data for story-service...");

            // Create Categories
            Category tienHiep = createCategory("Tiên hiệp", "Truyện tiên hiệp");
            Category huyenHuyen = createCategory("Huyền huyễn", "Truyện huyền huyễn");
            Category doThi = createCategory("Đô thị", "Truyện đô thị");
            Category kiemHiep = createCategory("Kiếm hiệp", "Truyện kiếm hiệp");
            Category ngonTinh = createCategory("Ngôn tình", "Truyện ngôn tình");

            // Create Authors
            Author thienTam = createAuthor("Thiên Tằm Thổ Đậu", "Tác giả Đấu Phá Thương Khung");
            Author nhiCan = createAuthor("Nhĩ Căn", "Tác giả Tiên Nghịch");
            Author macHuong = createAuthor("Mặc Hương Đồng Khứu", "Tác giả Ma Đạo Tổ Sư");

            // Create Stories
            Story dauPha = createStory(
                    "Đấu Phá Thương Khung",
                    "Nơi đây là thuộc về thế giới của đấu khí, không có ma pháp hoa tiếu mị ảnh, chỉ có đấu khí phồn diễn đến đỉnh cao!",
                    "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=400&q=80",
                    thienTam,
                    Set.of(tienHiep, huyenHuyen)
            );

            Story tienNghich = createStory(
                    "Tiên Nghịch",
                    "Thất tình lục dục, phàm nhân có thì tiên nhân cũng có...",
                    "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80",
                    nhiCan,
                    Set.of(tienHiep)
            );

            Story maDao = createStory(
                    "Ma Đạo Tổ Sư",
                    "Sống lại một đời...",
                    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
                    macHuong,
                    Set.of(tienHiep, ngonTinh)
            );

            // Create Chapters
            createChapter(dauPha, "Chương 1: Vẫn Lạc Thiên Tài", 1, "Nội dung chương 1 Đấu Phá Thương Khung...");
            createChapter(dauPha, "Chương 2: Đấu Khí Đại Lục", 2, "Nội dung chương 2 Đấu Phá Thương Khung...");
            createChapter(dauPha, "Chương 3: Khách Quý", 3, "Nội dung chương 3 Đấu Phá Thương Khung...");

            createChapter(tienNghich, "Chương 1: Ly hương", 1, "Nội dung chương 1 Tiên Nghịch...");
            createChapter(tienNghich, "Chương 2: Trắc tiên căn", 2, "Nội dung chương 2 Tiên Nghịch...");
            createChapter(tienNghich, "Chương 3: Nhập môn", 3, "Nội dung chương 3 Tiên Nghịch...");

            createChapter(maDao, "Chương 1: Trọng sinh", 1, "Nội dung chương 1 Ma Đạo...");
            createChapter(maDao, "Chương 2: Bát Quái", 2, "Nội dung chương 2 Ma Đạo...");
            createChapter(maDao, "Chương 3: Kiêu ngạo", 3, "Nội dung chương 3 Ma Đạo...");

            log.info("Dummy data initialized successfully.");
        } else {
            log.info("Database already contains data. Skipping initialization.");
        }
    }

    private Category createCategory(String name, String description) {
        Category category = Category.builder()
                .name(name)
                .slug(SlugUtils.toSlug(name))
                .description(description)
                .build();
        return categoryRepository.save(category);
    }

    private Author createAuthor(String name, String description) {
        Author author = Author.builder()
                .name(name)
                .slug(SlugUtils.toSlug(name))
                .description(description)
                .build();
        return authorRepository.save(author);
    }

    private Story createStory(String title, String description, String coverImage, Author author, Set<Category> categories) {
        Story story = Story.builder()
                .title(title)
                .slug(SlugUtils.toSlug(title))
                .description(description)
                .coverImage(coverImage)
                .author(author)
                .categories(new HashSet<>(categories))
                .status(StoryStatus.ONGOING)
                .viewCount(0L)
                .build();
        return storyRepository.save(story);
    }

    private Chapter createChapter(Story story, String title, int chapterNumber, String content) {
        Chapter chapter = Chapter.builder()
                .story(story)
                .title(title)
                .chapterNumber(chapterNumber)
                .content(content)
                .viewCount(0L)
                .build();
        return chapterRepository.save(chapter);
    }
}
