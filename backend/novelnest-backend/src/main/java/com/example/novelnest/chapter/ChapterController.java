package com.example.novelnest.chapter;

import com.example.novelnest.chapter.dto.ChapterDetailResponse;
import com.example.novelnest.chapter.dto.ChapterListResponse;
import com.example.novelnest.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories/{storySlug}/chapters")
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChapterListResponse>>> getChaptersByStorySlug(@PathVariable String storySlug) {
        return ResponseEntity.ok(ApiResponse.success("Get chapters successfully", chapterService.getChaptersByStorySlug(storySlug)));
    }

    @GetMapping("/{chapterNumber}")
    public ResponseEntity<ApiResponse<ChapterDetailResponse>> getChapterDetail(
            @PathVariable String storySlug,
            @PathVariable Integer chapterNumber) {
        return ResponseEntity.ok(ApiResponse.success("Get chapter detail successfully", chapterService.getChapterDetail(storySlug, chapterNumber)));
    }
}
