package com.example.novelnest.crawler;

import com.example.novelnest.crawler.dto.CrawlRequest;
import com.example.novelnest.crawler.dto.CrawledChapterDto;
import com.example.novelnest.crawler.dto.CrawledStoryDto;
import com.example.novelnest.story.StoryStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MetruyenchuCoCrawler implements NovelSourceCrawler {

    private final RobotsTxtService robotsTxtService;

    @Override
    public String getSourceName() {
        return "METRUYENCHUCO";
    }

    @Override
    public String getBaseUrl() {
        return "https://metruyenchu.co";
    }

    @Override
    public boolean checkPermission(String path) {
        return robotsTxtService.canFetch(getBaseUrl(), path, "NovelNestDemoCrawler/1.0");
    }

    @Override
    public List<CrawledStoryDto> fetchStoryList(CrawlRequest request) {
        List<CrawledStoryDto> stories = new ArrayList<>();
        try {
            String url = request.getCategoryUrl() != null && !request.getCategoryUrl().isEmpty() 
                    ? request.getCategoryUrl() 
                    : getBaseUrl() + "/danh-sach/truyen-moi";
            
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(10000)
                    .get();

            // Find links to stories
            Elements storyElements = doc.select("a[href^='/truyen/']");
            int count = 0;
            List<String> fetchedUrls = new ArrayList<>();

            for (Element element : storyElements) {
                if (count >= request.getMaxStories()) break;

                String href = element.attr("href");
                // Avoid chapter links
                if (href.contains("/chuong-")) continue;

                String storyUrl = getBaseUrl() + href;
                if (!fetchedUrls.contains(storyUrl)) {
                    fetchedUrls.add(storyUrl);
                    
                    Thread.sleep(1000); // Polite delay
                    CrawledStoryDto storyDto = fetchStoryDetail(storyUrl);
                    if (storyDto != null) {
                        stories.add(storyDto);
                        count++;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch story list from {}: {}", getSourceName(), e.getMessage());
        }
        return stories;
    }

    @Override
    public CrawledStoryDto fetchStoryDetail(String storyUrl) {
        try {
            Document doc = Jsoup.connect(storyUrl)
                    .userAgent("Mozilla/5.0")
                    .timeout(15000)
                    .get();

            // Extract from OpenGraph meta tags since it's a Next.js app
            String title = doc.select("meta[property=og:title]").attr("content");
            if (title.isEmpty()) title = doc.select("h1").text().trim();

            String author = doc.select("a[href^='/tac-gia/']").text().trim();
            if (author.isEmpty()) author = "Đang cập nhật";

            String description = doc.select("meta[property=og:description]").attr("content");
            if (description.isEmpty()) {
                Element descEl = doc.select("div.prose, .description, .summary").first();
                if (descEl != null) description = descEl.html();
            }

            String coverImage = doc.select("meta[property=og:image]").attr("content");
            if (coverImage.isEmpty()) coverImage = doc.select("img[alt='" + title + "']").attr("abs:src");

            List<String> categories = new ArrayList<>();
            for (Element a : doc.select("a[href^='/the-loai/']")) {
                categories.add(a.text().trim());
            }
            if (categories.isEmpty()) categories.add("Khác");

            return CrawledStoryDto.builder()
                    .title(title)
                    .slug(com.example.novelnest.common.SlugUtils.toSlug(title))
                    .authorName(author)
                    .description(description)
                    .coverImage(coverImage)
                    .categories(categories)
                    .status(StoryStatus.ONGOING)
                    .sourceUrl(storyUrl)
                    .sourceName(getSourceName())
                    .build();

        } catch (Exception e) {
            log.error("Failed to fetch story detail from {}: {}", storyUrl, e.getMessage());
            return null;
        }
    }

    @Override
    public List<CrawledChapterDto> fetchChapterList(String storyUrl) {
        return fetchChapterList(storyUrl, 0, null);
    }

    @Override
    public List<CrawledChapterDto> fetchChapterList(String storyUrl, int chaptersLimit, java.util.function.BiConsumer<Integer, Integer> progressCallback) {
        List<CrawledChapterDto> chapters = new ArrayList<>();
        try {
            Document storyDoc = Jsoup.connect(storyUrl)
                    .userAgent("Mozilla/5.0")
                    .timeout(15000)
                    .get();
            String html = storyDoc.html();

            // Find first chapter slug using more lenient regex because of JSON escaping
            String firstChapterSlug = "chuong-1";
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("firstChapter[^}]*?(chuong-[a-zA-Z0-9-]+)").matcher(html);
            if (m.find()) {
                firstChapterSlug = m.group(1);
            }
            
            // Also try to find total chapters for progress tracking
            int totalChaptersEstimate = 0;
            java.util.regex.Matcher mTotal = java.util.regex.Pattern.compile("lastChapter.*?(\\d+)").matcher(html);
            if (mTotal.find()) {
                totalChaptersEstimate = Integer.parseInt(mTotal.group(1));
            }

            String currentChapterUrl = storyUrl + "/" + firstChapterSlug;
            int limit = (chaptersLimit > 0) ? chaptersLimit : Integer.MAX_VALUE;
            int totalToFetch = (chaptersLimit > 0) ? Math.min(limit, totalChaptersEstimate > 0 ? totalChaptersEstimate : limit) : totalChaptersEstimate;
            
            log.info("Starting sequential crawl for {}, limit: {}, estimate total: {}", storyUrl, limit, totalChaptersEstimate);

            for (int i = 0; i < limit; i++) {
                CrawledChapterDto dto = new CrawledChapterDto();
                dto.setSourceUrl(currentChapterUrl);
                dto.setChapterNumber(i + 1);
                
                Thread.sleep(500); // Polite delay
                
                Document doc = Jsoup.connect(currentChapterUrl)
                        .userAgent("Mozilla/5.0")
                        .timeout(15000)
                        .get();
                String chapterHtml = doc.html();
                
                String title = doc.select("meta[property=og:title]").attr("content");
                if (title.isEmpty()) title = "Chương " + (i + 1);
                
                // Extract content
                Element contentEl = doc.select("article").first();
                String contentStr = "";
                if (contentEl != null) {
                    Elements paragraphs = contentEl.select("p");
                    if (!paragraphs.isEmpty()) {
                        StringBuilder sb = new StringBuilder();
                        for (Element p : paragraphs) {
                            sb.append("<p>").append(p.html()).append("</p>\n");
                        }
                        contentStr = sb.toString();
                    } else {
                        contentStr = contentEl.html();
                    }
                }
                
                dto.setTitle(title);
                dto.setContent(cleanContent(contentStr));
                chapters.add(dto);
                
                if (progressCallback != null) {
                    progressCallback.accept(i + 1, totalToFetch > 0 ? Math.max(totalToFetch, i + 1) : i + 1);
                }
                
                // Extract nextHref using bounded regex to avoid infinite loop
                String nextHref = null;
                java.util.regex.Matcher nextMatcher = java.util.regex.Pattern.compile("nextHref[^,}]*?(chuong-[a-zA-Z0-9-]+)").matcher(chapterHtml);
                if (nextMatcher.find()) {
                    nextHref = nextMatcher.group(1);
                }
                
                if (nextHref == null || nextHref.isEmpty() || nextHref.equals("null")) {
                    log.info("No next chapter found after {}, stopping crawl.", currentChapterUrl);
                    break;
                }
                
                currentChapterUrl = storyUrl + "/" + nextHref;
            }

        } catch (Exception e) {
            log.error("Failed to fetch chapter list sequentially from {}: {}", storyUrl, e.getMessage());
        }
        return chapters;
    }

    @Override
    public CrawledChapterDto fetchChapterContent(String chapterUrl) {
        try {
            Document doc = Jsoup.connect(chapterUrl)
                    .userAgent("Mozilla/5.0")
                    .timeout(15000)
                    .get();

            String title = doc.select("meta[property=og:title]").attr("content");
            if (title.isEmpty()) title = "Chapter";
            
            // The chapter content is usually in an article tag
            Element contentEl = doc.select("article").first();
            String contentHtml = "";
            if (contentEl != null) {
                // Extract just the p tags inside to avoid menus or buttons
                Elements paragraphs = contentEl.select("p");
                if (!paragraphs.isEmpty()) {
                    StringBuilder sb = new StringBuilder();
                    for (Element p : paragraphs) {
                        sb.append("<p>").append(p.html()).append("</p>\n");
                    }
                    contentHtml = sb.toString();
                } else {
                    contentHtml = contentEl.html();
                }
            }

            return CrawledChapterDto.builder()
                    .title(title)
                    .content(cleanContent(contentHtml))
                    .sourceUrl(chapterUrl)
                    .build();

        } catch (Exception e) {
            log.error("Failed to fetch chapter content from {}: {}", chapterUrl, e.getMessage());
            return null;
        }
    }

    private String cleanContent(String html) {
        if (html == null || html.isEmpty()) return "";
        Document doc = Jsoup.parseBodyFragment(html);
        doc.select("script, style, iframe, button, svg").remove();
        return doc.body().html();
    }
}
