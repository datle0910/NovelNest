package com.example.novelnest.crawler;

import com.example.novelnest.crawler.dto.CrawlRequest;
import com.example.novelnest.crawler.dto.CrawledChapterDto;
import com.example.novelnest.crawler.dto.CrawledStoryDto;
import com.example.novelnest.story.StoryStatus;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URL;
import java.time.Duration;

import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class LacaTruyenCrawler implements NovelSourceCrawler {

    private final RobotsTxtService robotsTxtService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    @Override
    public String getSourceName() {
        return "LACATRUYEN";
    }

    @Override
    public String getBaseUrl() {
        return "https://lacatruyen.buzz";
    }

    @Override
    public boolean checkPermission(String path) {
        return robotsTxtService.canFetch(getBaseUrl(), path, USER_AGENT);
    }

    /**
     * Extract __NEXT_DATA__ JSON from a LacaTruyen HTML page.
     */
    private JsonNode extractNextData(Document doc) {
        try {
            Element scriptEl = doc.selectFirst("script#__NEXT_DATA__");
            if (scriptEl != null) {
                return objectMapper.readTree(scriptEl.data());
            }
        } catch (Exception e) {
            log.error("Failed to parse __NEXT_DATA__: {}", e.getMessage());
        }
        return null;
    }

    @Override
    public List<CrawledStoryDto> fetchStoryList(CrawlRequest request) {
        // LacaTruyen doesn't support batch listing via crawl
        return new ArrayList<>();
    }

    @Override
    public CrawledStoryDto fetchStoryDetail(String storyUrl) {
        try {
            Document doc = Jsoup.connect(storyUrl)
                    .userAgent(USER_AGENT)
                    .timeout(30000)
                    .get();

            JsonNode nextData = extractNextData(doc);
            if (nextData == null) {
                log.error("No __NEXT_DATA__ found on page: {}", storyUrl);
                return null;
            }

            JsonNode pageProps = nextData.path("props").path("pageProps");
            if (!pageProps.path("storyExists").asBoolean(false)) {
                log.error("Story does not exist at: {}", storyUrl);
                return null;
            }

            JsonNode story = pageProps.path("story");

            String title = story.path("title").asText("Không rõ");
            String slug = story.path("slug").asText(title.toLowerCase().replaceAll("[^a-z0-9]+", "-"));
            String description = story.path("detail").asText(story.path("description").asText(""));
            
            // Build cover image URL
            String image = story.path("image").asText("");
            String coverImage = "";
            if (!image.isEmpty()) {
                if (image.startsWith("http")) {
                    coverImage = image;
                } else {
                    coverImage = "https://cms.metruyen.com/storage/uploads/" + image;
                }
            }

            // Author: try pen_name_user, then name_user, then author field
            String author = story.path("pen_name_user").asText("");
            if (author.isEmpty()) author = story.path("name_user").asText("");
            if (author.isEmpty()) author = story.path("author").asText("Đang cập nhật");
            if (author.isEmpty() || "null".equals(author)) author = "Đang cập nhật";

            // Categories
            List<String> categories = new ArrayList<>();
            String categoryName = story.path("name_category").asText("");
            if (!categoryName.isEmpty()) {
                categories.add(categoryName);
            }
            // Also check categories array from pageProps
            JsonNode categoriesNode = pageProps.path("categories");
            if (categoriesNode.isArray()) {
                for (JsonNode cat : categoriesNode) {
                    String catName = cat.path("name").asText("");
                    if (!catName.isEmpty() && !categories.contains(catName)) {
                        categories.add(catName);
                    }
                }
            }
            if (categories.isEmpty()) categories.add("Khác");

            return CrawledStoryDto.builder()
                    .title(title)
                    .slug(slug)
                    .description(description)
                    .coverImage(coverImage)
                    .authorName(author)
                    .status(StoryStatus.ONGOING)
                    .categories(categories)
                    .sourceName(getSourceName())
                    .sourceUrl(storyUrl)
                    .licenseName("All rights reserved")
                    .attribution("Nguồn: Lacatruyen")
                    .build();
        } catch (Exception e) {
            log.error("Failed to fetch story details from {}: {}", storyUrl, e.getMessage());
            return null;
        }
    }

    public List<CrawledChapterDto> fetchChapterList(String storyUrl, int chaptersLimit, java.util.function.BiConsumer<Integer, Integer> progressCallback) {
        List<CrawledChapterDto> chapters = new ArrayList<>();
        try {
            Document doc = Jsoup.connect(storyUrl)
                    .userAgent(USER_AGENT)
                    .timeout(30000)
                    .get();

            JsonNode nextData = extractNextData(doc);
            if (nextData == null) return chapters;

            JsonNode pageProps = nextData.path("props").path("pageProps");
            
            // Fetch total chapters from API for progress reporting
            int totalChapters = 0;
            try {
                JsonNode storyNode = pageProps.path("story");
                int storyId = storyNode.path("id").asInt(0);
                if (storyId > 0) {
                    Document apiDoc = Jsoup.connect(getBaseUrl() + "/api/stories/" + storyId + "/chapters?limit=1")
                            .ignoreContentType(true)
                            .userAgent(USER_AGENT)
                            .get();
                    JsonNode apiResponse = objectMapper.readTree(apiDoc.body().text());
                    totalChapters = apiResponse.path("pagination").path("total").asInt(0);
                }
            } catch (Exception e) {
                log.warn("Could not fetch total chapters for progress: {}", e.getMessage());
            }
            if (chaptersLimit > 0 && (totalChapters == 0 || chaptersLimit < totalChapters)) {
                totalChapters = chaptersLimit;
            }
            
            // Start sequential crawling from firstChapter
            JsonNode firstChapterArray = pageProps.path("firstChapter");
            if (firstChapterArray.isMissingNode() || firstChapterArray.isEmpty()) {
                log.warn("firstChapter not found for {}", storyUrl);
                return chapters;
            }

            String currentSlug = firstChapterArray.get(0).path("slug").asText();
            int count = 0;

            log.info("Starting sequential crawl for chapters from {}", storyUrl);
            
            // Initialize Selenium Chrome for the crawling session if available
            WebDriver driver = createHeadlessChrome();
            if (driver == null) {
                log.info("SELENIUM_URL not set. Using Fast Mode (JSON parsing) for chapter crawling.");
            }
            
            try {
                while (currentSlug != null && !currentSlug.isEmpty() && (chaptersLimit <= 0 || count < chaptersLimit)) {
                    String chapUrl = getBaseUrl() + "/chapter/" + currentSlug;
                    String title = "";
                    String contentHtml = "";
                    String nextSlug = "";
                    
                    if (driver != null) {
                        driver.get(chapUrl);
                        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
                        wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(".chapter-c")));
                        Thread.sleep(2000);
                        
                        try {
                            WebElement titleEl = driver.findElement(By.cssSelector(".chapter-title"));
                            title = titleEl.getText().trim();
                        } catch (Exception e) {
                            title = "Chương " + (count + 1);
                        }
                        
                        WebElement contentEl = driver.findElement(By.cssSelector(".chapter-c"));
                        contentHtml = contentEl.getAttribute("innerHTML");
                        
                        try {
                            WebElement nextDataEl = driver.findElement(By.id("__NEXT_DATA__"));
                            String nextDataJson = nextDataEl.getAttribute("innerHTML");
                            JsonNode chapNextData = objectMapper.readTree(nextDataJson);
                            JsonNode right = chapNextData.path("props").path("pageProps").path("chapterRight");
                            if (!right.isMissingNode() && !right.isNull() && !right.path("slug").asText("").isEmpty()) {
                                nextSlug = right.path("slug").asText("");
                            }
                        } catch (Exception e) {
                            log.warn("Could not extract next chapter slug");
                        }
                    } else {
                        // Fast Mode: Use Jsoup to extract NEXT_DATA
                        Document chapDoc = Jsoup.connect(chapUrl).userAgent(USER_AGENT).get();
                        JsonNode chapNextData = extractNextData(chapDoc);
                        if (chapNextData != null) {
                            JsonNode chapPageProps = chapNextData.path("props").path("pageProps");
                            
                            // Extract title from previewHtml if possible
                            contentHtml = chapPageProps.path("previewHtml").asText("");
                            if (contentHtml.startsWith("<p>Chương")) {
                                int endTitle = contentHtml.indexOf("</p>");
                                if (endTitle > 0) {
                                    title = contentHtml.substring(3, endTitle);
                                }
                            }
                            
                            JsonNode right = chapPageProps.path("chapterRight");
                            if (!right.isMissingNode() && !right.isNull() && !right.path("slug").asText("").isEmpty()) {
                                nextSlug = right.path("slug").asText("");
                            }
                        }
                    }

                    if (title.isEmpty()) {
                        title = "Chương " + (count + 1);
                    }

                    CrawledChapterDto dto = new CrawledChapterDto();
                    dto.setSourceUrl(chapUrl);
                    dto.setChapterNumber(count + 1);
                    dto.setTitle(title);
                    dto.setContent(cleanContent(contentHtml));
                    
                    chapters.add(dto);
                    count++;
                    
                    log.info("Fetched chapter: {} (Total: {})", title, count);
                    if (progressCallback != null) {
                        progressCallback.accept(count, totalChapters > 0 ? totalChapters : count);
                    }

                    if (nextSlug.isEmpty()) {
                        break;
                    }
                    currentSlug = nextSlug;
                    
                    Thread.sleep(50);
                }
            } finally {
                if (driver != null) {
                    driver.quit();
                }
            }
            
        } catch (Exception e) {
            log.error("Failed to fetch chapter list from {}: {}", storyUrl, e.getMessage());
        }
        return chapters;
    }

    @Override
    public List<CrawledChapterDto> fetchChapterList(String storyUrl) {
        return fetchChapterList(storyUrl, 0, null);
    }
    
    public List<CrawledChapterDto> fetchChapterList(String storyUrl, int chaptersLimit) {
        return fetchChapterList(storyUrl, chaptersLimit, null);
    }

    private String cleanContent(String content) {
        if (content.contains("&lt;") && content.contains("&gt;")) {
            content = org.jsoup.parser.Parser.unescapeEntities(content, true);
        }
        Document parsedDoc = Jsoup.parseBodyFragment(content);
        parsedDoc.select("*").forEach(el -> {
            if (el.hasAttr("style") && el.attr("style").replaceAll("\\s+", "").contains("display:none")) {
                el.remove();
            } else if (el.tagName().equals("span") && el.text().trim().isEmpty() && el.children().isEmpty()) {
                el.remove();
            }
        });
        content = parsedDoc.body().html();
        content = content.replaceAll("[\u200B-\u200D\uFEFF]", "");
        content = content.replaceAll("(?i)(<br\\s*/?>\\s*){2,}", "<br><br>");
        content = content.replaceAll("(?i)<p>\\s*</p>", "");
        return content;
    }

    @Override
    public CrawledChapterDto fetchChapterContent(String chapterUrl) {
        WebDriver driver = createHeadlessChrome();
        if (driver == null) {
            try {
                Document chapDoc = Jsoup.connect(chapterUrl).userAgent(USER_AGENT).get();
                JsonNode chapNextData = extractNextData(chapDoc);
                String title = "Chapter";
                String contentHtml = "";
                if (chapNextData != null) {
                    JsonNode pageProps = chapNextData.path("props").path("pageProps");
                    contentHtml = pageProps.path("previewHtml").asText("");
                    if (contentHtml.startsWith("<p>Chương")) {
                        int endTitle = contentHtml.indexOf("</p>");
                        if (endTitle > 0) {
                            title = contentHtml.substring(3, endTitle);
                        }
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
        
        try {
            driver.get(chapterUrl);
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
            wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(".chapter-c")));
            // Extra wait for WASM decryption
            Thread.sleep(2000);
            
            String title;
            try {
                title = driver.findElement(By.cssSelector(".chapter-title")).getText().trim();
            } catch (Exception e) {
                title = "Chapter";
            }
            String contentHtml = driver.findElement(By.cssSelector(".chapter-c")).getAttribute("innerHTML");

            return CrawledChapterDto.builder()
                    .title(title.isEmpty() ? "Chapter" : title)
                    .content(cleanContent(contentHtml))
                    .sourceUrl(chapterUrl)
                    .build();

        } catch (Exception e) {
            log.error("Failed to fetch chapter content from {}: {}", chapterUrl, e.getMessage());
            return null;
        } finally {
            driver.quit();
        }
    }

    private WebDriver createHeadlessChrome() {
        try {
            String seleniumUrl = System.getenv("SELENIUM_URL");
            if (seleniumUrl != null && !seleniumUrl.isEmpty()) {
                ChromeOptions options = new ChromeOptions();
                options.addArguments("--headless=new");
                options.addArguments("--no-sandbox");
                options.addArguments("--disable-dev-shm-usage");
                options.addArguments("--disable-gpu");
                options.addArguments("--disable-extensions");
                options.addArguments("--remote-allow-origins=*");
                options.addArguments("--user-agent=" + USER_AGENT);
                
                log.info("Connecting to remote Selenium at: {}", seleniumUrl);
                return new RemoteWebDriver(new URL(seleniumUrl), options);
            }
        } catch (Exception e) {
            log.error("Failed to connect to remote Selenium: {}", e.getMessage());
        }
        return null;
    }
}
