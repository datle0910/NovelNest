package com.example.storyservice.crawler.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrawledChapterDto {
    private String title;
    private Integer chapterNumber;
    private String content;
    private String sourceUrl;
}
