package com.example.storyservice.chapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterDetailResponse {

    private Long storyId;
    private String storyTitle;
    private String storySlug;
    private Long chapterId;
    private String chapterTitle;
    private Integer chapterNumber;
    private String content;
    private Integer previousChapterNumber;
    private Integer nextChapterNumber;
}
