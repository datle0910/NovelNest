package com.example.storyservice.chapter;

import com.example.storyservice.chapter.dto.ChapterListResponse;
import com.example.storyservice.chapter.dto.ChapterRequest;
import com.example.storyservice.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class ChapterAdminController {

    private final ChapterService chapterService;

    @PostMapping("/stories/{storyId}/chapters")
    public ResponseEntity<ApiResponse<ChapterListResponse>> createChapter(
            @PathVariable Long storyId,
            @Valid @RequestBody ChapterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Create chapter successfully", chapterService.createChapter(storyId, request)));
    }

    @PutMapping("/chapters/{id}")
    public ResponseEntity<ApiResponse<ChapterListResponse>> updateChapter(
            @PathVariable Long id,
            @Valid @RequestBody ChapterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Update chapter successfully", chapterService.updateChapter(id, request)));
    }

    @DeleteMapping("/chapters/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteChapter(@PathVariable Long id) {
        chapterService.deleteChapter(id);
        return ResponseEntity.ok(ApiResponse.success("Delete chapter successfully", null));
    }
}
