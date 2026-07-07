package com.example.storyservice.crawler;

import com.example.storyservice.crawler.dto.CrawlRequest;
import com.example.storyservice.crawler.dto.CrawledChapterDto;
import com.example.storyservice.crawler.dto.CrawledStoryDto;

import java.util.List;

public interface NovelSourceCrawler {
    String getSourceName();
    String getBaseUrl();
    boolean checkPermission(String path);
    
    List<CrawledStoryDto> fetchStoryList(CrawlRequest request);
    CrawledStoryDto fetchStoryDetail(String storyUrl);
    List<CrawledChapterDto> fetchChapterList(String storyUrl);
    
    default List<CrawledChapterDto> fetchChapterList(String storyUrl, int chaptersLimit, java.util.function.BiConsumer<Integer, Integer> progressCallback) {
        return fetchChapterList(storyUrl);
    }
    
    CrawledChapterDto fetchChapterContent(String chapterUrl);
}
