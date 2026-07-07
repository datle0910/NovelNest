package com.example.storyservice.crawler;

import com.example.storyservice.crawler.dto.CrawlRequest;
import com.example.storyservice.crawler.dto.CrawledChapterDto;
import com.example.storyservice.crawler.dto.CrawledStoryDto;
import com.example.storyservice.story.StoryStatus;
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
public class TruyenComCrawler implements NovelSourceCrawler {

    private final RobotsTxtService robotsTxtService;

    @Override
    public String getSourceName() {
        return "TRUYENCOM";
    }

    @Override
    public String getBaseUrl() {
        return "https://truyencom.com";
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
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(10000)
                    .get();

            Elements storyElements = doc.select(".list-truyen .row"); // Hypothetical selector
            int count = 0;
            for (Element element : storyElements) {
                if (count >= request.getMaxStories()) break;

                Element titleElement = element.select(".truyen-title a").first();
                if (titleElement != null) {
                    String storyUrl = titleElement.attr("abs:href");
                    
                    // Fetch details
                    Thread.sleep(2000); // Respectful delay
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
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(30000)
                    .get();

            String title = doc.select("h1.title").text();
            String author = doc.select(".info a[itemprop=author]").text();
            if (author.isEmpty()) author = "Đang cập nhật";

            String description = doc.select(".desc-text").html();
            String coverImage = doc.select(".book img").attr("src");

            List<String> categories = new ArrayList<>();
            for (Element a : doc.select(".info a[itemprop=genre]")) {
                categories.add(a.text());
            }
            if (categories.isEmpty()) categories.add("Khác");

            return CrawledStoryDto.builder()
                    .title(title)
                    .slug(com.example.storyservice.common.SlugUtils.toSlug(title))
                    .description(description)
                    .coverImage(coverImage)
                    .authorName(author)
                    .status(StoryStatus.ONGOING)
                    .categories(categories)
                    .sourceName(getSourceName())
                    .sourceUrl(storyUrl)
                    .licenseName("Creative Commons Attribution 4.0")
                    .attribution("Nguồn: TruyenCom")
                    .build();
        } catch (Exception e) {
            log.error("Failed to fetch story details from {}: {}", storyUrl, e.getMessage());
            return null;
        }
    }

    @Override
    public List<CrawledChapterDto> fetchChapterList(String storyUrl) {
        return fetchChapterList(storyUrl, 0, null);
    }
    
    public List<CrawledChapterDto> fetchChapterList(String storyUrl, int chaptersLimit, java.util.function.BiConsumer<Integer, Integer> progressCallback) {
        List<CrawledChapterDto> chapters = new ArrayList<>();
        try {
            Document doc = Jsoup.connect(storyUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(30000)
                    .get();

            Elements chapterElements = doc.select("ul.list-chapter li a");
            int total = chapterElements.size();
            int chapterNum = 1;
            for (Element a : chapterElements) {
                if (chaptersLimit > 0 && chapterNum > chaptersLimit) break;
                
                CrawledChapterDto dto = new CrawledChapterDto();
                dto.setTitle(a.text());
                dto.setSourceUrl(a.attr("abs:href"));
                dto.setChapterNumber(chapterNum);
                chapters.add(dto);
                
                if (progressCallback != null) {
                    progressCallback.accept(chapterNum, chaptersLimit > 0 ? Math.min(chaptersLimit, total) : total);
                }
                chapterNum++;
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
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(30000)
                    .get();

            String title = doc.select("a.chapter-title").text();
            String content = doc.select(".chapter-c").html();

            return CrawledChapterDto.builder()
                    .title(title.isEmpty() ? "Chapter" : title)
                    .content(content)
                    .sourceUrl(chapterUrl)
                    .build();
        } catch (Exception e) {
            log.error("Failed to fetch chapter content from {}: {}", chapterUrl, e.getMessage());
            return null;
        }
    }
}
