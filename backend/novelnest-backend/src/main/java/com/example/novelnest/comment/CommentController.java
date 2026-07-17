package com.example.novelnest.comment;

import com.example.novelnest.common.ApiResponse;
import com.example.novelnest.common.PageResponse;
import com.example.novelnest.comment.dto.CommentRequest;
import com.example.novelnest.comment.dto.CommentResponse;
import com.example.novelnest.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/stories/{storyId}/comments")
    public ResponseEntity<ApiResponse<PageResponse<CommentResponse>>> getStoryComments(
            @PathVariable Long storyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<CommentResponse> response = commentService.getStoryComments(storyId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Get story comments successfully", response));
    }

    @GetMapping("/chapters/{chapterId}/comments")
    public ResponseEntity<ApiResponse<PageResponse<CommentResponse>>> getChapterComments(
            @PathVariable Long chapterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<CommentResponse> response = commentService.getChapterComments(chapterId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Get chapter comments successfully", response));
    }

    @PostMapping("/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(@RequestBody CommentRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        String email = SecurityUtils.getCurrentUserEmail();
        CommentResponse response = commentService.createComment(userId, email, request);
        return ResponseEntity.ok(ApiResponse.success("Comment created successfully", response));
    }

    @PutMapping("/comments/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable Long id, @RequestBody CommentRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        CommentResponse response = commentService.updateComment(id, userId, request);
        return ResponseEntity.ok(ApiResponse.success("Comment updated successfully", response));
    }

    @DeleteMapping("/comments/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        commentService.deleteComment(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully", null));
    }
}
