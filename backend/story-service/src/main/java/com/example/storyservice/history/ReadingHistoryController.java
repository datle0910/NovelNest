package com.example.storyservice.history;

import com.example.storyservice.common.ApiResponse;
import com.example.storyservice.common.PageResponse;
import com.example.storyservice.history.dto.ReadingHistoryRequest;
import com.example.storyservice.history.dto.ReadingHistoryResponse;
import com.example.storyservice.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reading-history")
@RequiredArgsConstructor
public class ReadingHistoryController {

    private final ReadingHistoryService readingHistoryService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> saveHistory(@RequestBody ReadingHistoryRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        readingHistoryService.saveHistory(userId, request);
        return ResponseEntity.ok(ApiResponse.success("History saved successfully", null));
    }

    @GetMapping("/me/{storyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReadingHistoryResponse>> getStoryHistory(@PathVariable Long storyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        ReadingHistoryResponse response = readingHistoryService.getStoryHistory(userId, storyId);
        return ResponseEntity.ok(ApiResponse.success("Get reading history successfully", response));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<ReadingHistoryResponse>>> getUserHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        PageResponse<ReadingHistoryResponse> response = readingHistoryService.getUserHistory(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Get reading history successfully", response));
    }
}
