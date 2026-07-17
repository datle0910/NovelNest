package com.example.novelnest.chapter.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapterRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Chapter number is required")
    @Min(value = 1, message = "Chapter number must be greater than 0")
    private Integer chapterNumber;

    @NotBlank(message = "Content is required")
    private String content;
}
