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
public class MetruyenchuVnCrawler implements NovelSourceCrawler {

    private final RobotsTxtService robotsTxtService;

    @Override
    public String getSourceName() {
        return "METRUYENCHUVN";
    }

    @Override
    public String getBaseUrl() {
        return "https://metruyenchuvn.com";
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

            Elements storyElements = doc.select(".list-truyen .row, .item a.cover"); // Flexible selector
            int count = 0;
            for (Element element : storyElements) {
                if (count >= request.getMaxStories()) break;

                String storyUrl = element.attr("abs:href");
                if (storyUrl.isEmpty()) {
                    Element a = element.select("a").first();
                    if (a != null) storyUrl = a.attr("abs:href");
                }

                if (storyUrl != null && !storyUrl.isEmpty()) {
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

            String title = doc.select("h1.title").text().trim();
            if (title.isEmpty()) title = doc.select(".title h1").text().trim();
            if (title.isEmpty()) title = doc.select("h1[itemprop=name]").text().trim();
            
            String author = doc.select("a[itemprop=author]").text().trim();
            if (author.isEmpty()) author = "Đang cập nhật";

            String description = doc.select(".desc").html();
            String coverImage = doc.select("img[itemprop=image]").attr("abs:src");
            if (coverImage.isEmpty()) coverImage = doc.select(".book-info-pic img").attr("abs:src");

            List<String> categories = new ArrayList<>();
            for (Element a : doc.select(".li--genres a")) {
                categories.add(a.text());
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
            Document doc = Jsoup.connect(storyUrl)
                    .userAgent("Mozilla/5.0")
                    .timeout(15000)
                    .get();

            Elements chapterLinks = doc.select("#chapter ul li a, .chapter ul li a");
            
            // Extract total pages and storyId
            int totalPages = 1;
            String storyId = null;
            Elements pagingLinks = doc.select(".paging a[onclick^=page]");
            for (Element pLink : pagingLinks) {
                String onclick = pLink.attr("onclick");
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("page\\((\\d+)\\s*,\\s*(\\d+)\\)").matcher(onclick);
                if (m.find()) {
                    storyId = m.group(1);
                    int pageNum = Integer.parseInt(m.group(2));
                    if (pageNum > totalPages) {
                        totalPages = pageNum;
                    }
                }
            }

            // Extract chapters from all pages
            List<Element> allLinks = new ArrayList<>(chapterLinks);
            
            if (storyId != null && totalPages > 1) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                for (int p = 2; p <= totalPages; p++) {
                    try {
                        String ajaxUrl = getBaseUrl() + "/get/listchap/" + storyId + "?page=" + p;
                        String jsonResponse = Jsoup.connect(ajaxUrl)
                                .userAgent("Mozilla/5.0")
                                .ignoreContentType(true)
                                .execute()
                                .body();
                                
                        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(jsonResponse);
                        if (rootNode.has("data")) {
                            String htmlData = rootNode.get("data").asText();
                            Document pageDoc = Jsoup.parseBodyFragment(htmlData);
                            // Only select 'li a' to avoid picking up pagination links (<div class="paging"><a>)
                            allLinks.addAll(pageDoc.select("li a"));
                        }
                    } catch (Exception e) {
                        log.warn("Failed to fetch page {} for story {}: {}", p, storyId, e.getMessage());
                    }
                }
            }

            int limit = (chaptersLimit > 0) ? chaptersLimit : allLinks.size();
            int totalChapters = Math.min(limit, allLinks.size());
            
            log.info("Found {} chapters for {}, limit: {}", allLinks.size(), storyUrl, limit);

            for (int i = 0; i < totalChapters; i++) {
                Element link = allLinks.get(i);
                String title = link.text();
                String chapUrl = link.attr("abs:href");
                if (chapUrl.isEmpty()) {
                    String href = link.attr("href");
                    chapUrl = href.startsWith("http") ? href : getBaseUrl() + href;
                }

                CrawledChapterDto dto = new CrawledChapterDto();
                dto.setTitle(title.isEmpty() ? "Chương " + (i + 1) : title);
                dto.setSourceUrl(chapUrl);
                dto.setChapterNumber(i + 1);
                
                Thread.sleep(100); // Polite delay
                CrawledChapterDto contentDto = fetchChapterContent(chapUrl);
                if (contentDto != null) {
                    dto.setContent(contentDto.getContent());
                }

                chapters.add(dto);
                
                if (progressCallback != null) {
                    progressCallback.accept(i + 1, totalChapters);
                }
            }

        } catch (Exception e) {
            log.error("Failed to fetch chapter list from {}: {}", storyUrl, e.getMessage());
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

            String title = doc.select(".chapter-title .current-chapter").text().trim();
            if (title.isEmpty()) title = "Chapter";
            
            Element contentEl = doc.select("div.truyen").first();
            String contentHtml = contentEl != null ? contentEl.html() : "";

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
        doc.select("script, style, iframe, .ads, .qc, a").remove();
        return doc.body().html();
    }
}
