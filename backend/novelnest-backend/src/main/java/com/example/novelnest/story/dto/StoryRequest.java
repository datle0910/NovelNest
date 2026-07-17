package com.example.novelnest.story.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoryRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String coverImage;

    @NotNull(message = "Author ID is required")
    private Long authorId;

    @NotBlank(message = "Status is required")
    private String status;

    private Boolean display;

    private List<Long> categoryIds;
}
