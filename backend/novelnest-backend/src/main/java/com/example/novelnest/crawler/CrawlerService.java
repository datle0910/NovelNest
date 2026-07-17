package com.example.novelnest.crawler;

import com.example.novelnest.author.Author;
import com.example.novelnest.author.AuthorRepository;
import com.example.novelnest.category.Category;
import com.example.novelnest.category.CategoryRepository;
import com.example.novelnest.chapter.Chapter;
import com.example.novelnest.chapter.ChapterRepository;
import com.example.novelnest.crawler.dto.CrawlRequest;
import com.example.novelnest.crawler.dto.CrawledChapterDto;
import com.example.novelnest.crawler.dto.CrawledStoryDto;
import com.example.novelnest.crawler.entity.ImportLog;
import com.example.novelnest.crawler.entity.ImportSource;
import com.example.novelnest.crawler.repository.ImportLogRepository;
import com.example.novelnest.crawler.repository.ImportSourceRepository;
import com.example.novelnest.image.ImageService;
import com.example.novelnest.story.Story;
import com.example.novelnest.story.StoryRepository;
import com.example.novelnest.common.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CrawlerService {

    private final List<NovelSourceCrawler> crawlers;
    private final ImportSourceRepository importSourceRepository;
    private final ImportLogRepository importLogRepository;
    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final ImageService imageService;



    private final java.util.concurrent.ConcurrentHashMap<Long, com.example.novelnest.crawler.dto.CrawlProgress> progressMap = new java.util.concurrent.ConcurrentHashMap<>();

    public com.example.novelnest.crawler.dto.CrawlProgress getProgress(Long logId) {
        return progressMap.get(logId);
    }

    public ImportLog importStoryByUrl(CrawlRequest request) {
        NovelSourceCrawler crawler;
        if (request.getSource() != null && !request.getSource().isEmpty() && !request.getSource().equalsIgnoreCase("AUTO")) {
            crawler = getCrawler(request.getSource());
        } else {
            crawler = detectCrawlerFromUrl(request.getStoryUrl());
        }
        ImportSource sourceConfig = getOrCreateSourceConfig(crawler);

        validateRequest(request, sourceConfig);

        ImportLog importLog = ImportLog.builder()
                .sourceName(crawler.getSourceName())
                .sourceUrl(request.getStoryUrl())
                .importType("STORY_URL")
                .status("IN_PROGRESS")
                .startedAt(LocalDateTime.now())
                .build();

        importLog = importLogRepository.save(importLog);
        
        com.example.novelnest.crawler.dto.CrawlProgress progress = com.example.novelnest.crawler.dto.CrawlProgress.builder()
                .logId(importLog.getId())
                .status("IN_PROGRESS")
                .currentChapter(0)
                .totalChapters(0)
                .message("Đang tải chi tiết truyện...")
                .build();
        progressMap.put(importLog.getId(), progress);

        final Long logId = importLog.getId();
        
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                CrawledStoryDto dto = crawler.fetchStoryDetail(request.getStoryUrl());
                if (dto != null) {
                    ImportLog logToUpdate = importLogRepository.findById(logId).orElseThrow();
                    logToUpdate.setTotalFound(1);
                    progressMap.get(logId).setMessage("Đang quét danh sách chương...");
                    
                    Story existingStory = null;
                    if (request.getTargetStoryId() != null) {
                        existingStory = storyRepository.findById(request.getTargetStoryId()).orElse(null);
                    }
                    if (existingStory == null) {
                        existingStory = storyRepository.findBySlug(dto.getSlug()).orElse(null);
                    }
                    
                    List<Integer> existingChapterNumbers = existingStory != null ? chapterRepository.findChapterNumbersByStoryId(existingStory.getId()) : new ArrayList<>();
                    
                    if (request.getMode() != ImportMode.METADATA_ONLY) {
                        int limit = request.getMaxChaptersPerStory();
                        if (limit == 0) limit = Integer.MAX_VALUE;
                        List<CrawledChapterDto> chapterList = crawler.fetchChapterList(dto.getSourceUrl(), limit, (current, total) -> {
                            com.example.novelnest.crawler.dto.CrawlProgress p = progressMap.get(logId);
                            if (p != null) {
                                p.setCurrentChapter(current);
                                p.setTotalChapters(total);
                                p.setMessage(String.format("Đang duyệt danh sách %d / %d chương...", current, total));
                            }
                        });
                        
                        List<CrawledChapterDto> newChapters = new ArrayList<>();
                        for (CrawledChapterDto chapDto : chapterList) {
                            if (!existingChapterNumbers.contains(chapDto.getChapterNumber())) {
                                newChapters.add(chapDto);
                            }
                        }
                        
                        int chaptersToFetch = (limit <= 0) ? newChapters.size() : Math.min(newChapters.size(), limit);
                        
                        for (int i = 0; i < chaptersToFetch; i++) {
                            CrawledChapterDto chapDto = newChapters.get(i);
                            com.example.novelnest.crawler.dto.CrawlProgress p = progressMap.get(logId);
                            if (p != null) {
                                p.setMessage(String.format("Đang tải nội dung chương mới %d / %d...", i + 1, chaptersToFetch));
                            }
                            if (request.getMode() == ImportMode.FULL_CONTENT_IF_ALLOWED && sourceConfig.getContentImportAllowed()) {
                                if (chapDto.getContent() == null || chapDto.getContent().isEmpty()) {
                                    Thread.sleep(1500);
                                    CrawledChapterDto fullChap = crawler.fetchChapterContent(chapDto.getSourceUrl());
                                    if (fullChap != null && fullChap.getContent() != null && !fullChap.getContent().isEmpty()) {
                                        chapDto.setContent(fullChap.getContent());
                                    }
                                }
                            } else {
                                if (chapDto.getContent() == null || chapDto.getContent().isEmpty()) {
                                    chapDto.setContent("<p>Chương mẫu. Content import restricted by policy.</p>");
                                }
                            }
                            dto.getChapters().add(chapDto);
                        }
                    }

                    progressMap.get(logId).setMessage("Đang lưu truyện vào cơ sở dữ liệu...");
                    if (!request.getDryRun()) {
                        if (existingStory == null && dto.getCoverImage() != null && !dto.getCoverImage().isEmpty()) {
                            progressMap.get(logId).setMessage("Đang tải ảnh bìa lên Cloudinary...");
                            String secureUrl = imageService.uploadImageFromUrl(dto.getCoverImage(), "novelnest/covers");
                            dto.setCoverImage(secureUrl);
                        }
                        int newChapCount = saveStoryAndChapters(dto, existingStory);
                        logToUpdate.setTotalImported(1);
                        if (existingStory != null) {
                            logToUpdate.setMessage("Cập nhật truyện: " + dto.getTitle() + " - Thêm " + newChapCount + " chương mới.");
                        } else {
                            logToUpdate.setMessage("Import truyện mới: " + dto.getTitle() + " với " + newChapCount + " chương.");
                        }
                    } else {
                        logToUpdate.setTotalImported(1);
                        logToUpdate.setMessage("Dry run: " + dto.getTitle() + " (" + dto.getChapters().size() + " chương mới)");
                    }
                    logToUpdate.setStatus("COMPLETED");
                    logToUpdate.setFinishedAt(LocalDateTime.now());
                    importLogRepository.save(logToUpdate);
                    
                    progressMap.get(logId).setStatus("COMPLETED");
                    progressMap.get(logId).setMessage("Đã hoàn tất crawl!");
                } else {
                    ImportLog logToUpdate = importLogRepository.findById(logId).orElseThrow();
                    logToUpdate.setTotalFailed(1);
                    logToUpdate.setStatus("FAILED");
                    logToUpdate.setMessage("Failed to fetch story details.");
                    logToUpdate.setFinishedAt(LocalDateTime.now());
                    importLogRepository.save(logToUpdate);
                    
                    progressMap.get(logId).setStatus("FAILED");
                    progressMap.get(logId).setMessage("Thất bại: Không lấy được chi tiết truyện.");
                }
            } catch (Exception e) {
                log.error("Error during async crawl", e);
                try {
                    ImportLog logToUpdate = importLogRepository.findById(logId).orElseThrow();
                    logToUpdate.setTotalFailed(1);
                    logToUpdate.setStatus("FAILED");
                    logToUpdate.setMessage(e.getMessage());
                    logToUpdate.setFinishedAt(LocalDateTime.now());
                    importLogRepository.save(logToUpdate);
                    
                    if (progressMap.containsKey(logId)) {
                        progressMap.get(logId).setStatus("FAILED");
                        progressMap.get(logId).setMessage("Lỗi: " + e.getMessage());
                    }
                } catch (Exception ex) {
                    log.error("Could not update log status", ex);
                }
            }
        });

        return importLog;
    }

    @Transactional
    protected int saveStoryAndChapters(CrawledStoryDto dto, Story existingStory) {
        Story story;
        if (existingStory != null) {
            story = existingStory;
            story.setUpdatedAt(LocalDateTime.now());
            if (dto.getStatus() != null) {
                story.setStatus(dto.getStatus());
            }
            story = storyRepository.save(story);
        } else {
            Author author = authorRepository.findBySlug(SlugUtils.toSlug(dto.getAuthorName()))
                    .orElseGet(() -> authorRepository.save(Author.builder().name(dto.getAuthorName()).slug(SlugUtils.toSlug(dto.getAuthorName())).build()));

            Set<Category> categories = new HashSet<>();
            for (String catName : dto.getCategories()) {
                Category cat = categoryRepository.findBySlug(SlugUtils.toSlug(catName))
                        .orElseGet(() -> categoryRepository.save(Category.builder().name(catName).slug(SlugUtils.toSlug(catName)).build()));
                categories.add(cat);
            }

            story = Story.builder()
                    .title(Normalizer.normalize(dto.getTitle(), Normalizer.Form.NFC))
                    .slug(dto.getSlug())
                    .description(Normalizer.normalize(dto.getDescription(), Normalizer.Form.NFC))
                    .coverImage(dto.getCoverImage())
                    .author(author)
                    .status(dto.getStatus())
                    .categories(categories)
                    .sourceName(dto.getSourceName())
                    .sourceUrl(dto.getSourceUrl())
                    .licenseName(dto.getLicenseName())
                    .attribution(dto.getAttribution())
                    .imported(true)
                    .build();

            story = storyRepository.save(story);
        }

        int newChaptersCount = 0;
        for (CrawledChapterDto cDto : dto.getChapters()) {
            String rawContent = cDto.getContent() != null ? cDto.getContent() : "<p>Nội dung trống</p>";
            String cleanedContent = cleanChapterContent(Normalizer.normalize(rawContent, Normalizer.Form.NFC));
            
            Chapter chapter = Chapter.builder()
                    .story(story)
                    .title(Normalizer.normalize(cDto.getTitle(), Normalizer.Form.NFC))
                    .chapterNumber(cDto.getChapterNumber())
                    .content(cleanedContent)
                    .sourceUrl(cDto.getSourceUrl())
                    .imported(true)
                    .build();
            chapterRepository.save(chapter);
            newChaptersCount++;
        }

        return newChaptersCount;
    }

    private String cleanChapterContent(String html) {
        if (html == null || html.isEmpty()) return "<p>Nội dung trống</p>";
        
        org.jsoup.nodes.Document doc = org.jsoup.Jsoup.parseBodyFragment(html);
        org.jsoup.select.NodeTraversor.traverse(new org.jsoup.select.NodeVisitor() {
            @Override
            public void head(org.jsoup.nodes.Node node, int depth) {
                if (node instanceof org.jsoup.nodes.TextNode) {
                    org.jsoup.nodes.TextNode textNode = (org.jsoup.nodes.TextNode) node;
                    // Giữ lại: Chữ cái (\p{L}), Số (\p{N}), Dấu cách (\s), Dấu sao (\*),
                    // và các dấu câu cơ bản (.,!?"'-;:()[])
                    String cleaned = textNode.text().replaceAll("[^\\p{L}\\p{N}\\s\\*.,!?\"'\\-;:()\\[\\]]+", "");
                    textNode.text(cleaned);
                }
            }
            @Override
            public void tail(org.jsoup.nodes.Node node, int depth) {}
        }, doc.body());
        
        return doc.body().html();
    }

    private NovelSourceCrawler getCrawler(String source) {
        return crawlers.stream()
                .filter(c -> c.getSourceName().equalsIgnoreCase(source))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported source: " + source));
    }

    private NovelSourceCrawler detectCrawlerFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            throw new IllegalArgumentException("URL cannot be empty");
        }
        return crawlers.stream()
                .filter(c -> url.toLowerCase().contains(c.getBaseUrl().replace("https://", "").replace("http://", "")))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cấu hình Crawler hỗ trợ URL này. Vui lòng kiểm tra lại URL."));
    }

    private ImportSource getOrCreateSourceConfig(NovelSourceCrawler crawler) {
        return importSourceRepository.findByName(crawler.getSourceName())
                .orElseGet(() -> {
                    ImportSource source = ImportSource.builder()
                            .name(crawler.getSourceName())
                            .baseUrl(crawler.getBaseUrl())
                            .contentImportAllowed(true)
                            .build();
                    return importSourceRepository.save(source);
                });
    }

    private void validateRequest(CrawlRequest request, ImportSource config) {
        if (!config.getAllowed()) {
            throw new IllegalArgumentException("Importing from this source is currently disabled.");
        }
        if (request.getMode() == ImportMode.FULL_CONTENT_IF_ALLOWED && !config.getContentImportAllowed()) {
            throw new IllegalArgumentException("Full content import is disabled for this source because permission/license is not verified.");
        }
    }
}
