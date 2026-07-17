package com.example.novelnest.comment;

import com.example.novelnest.chapter.ChapterRepository;
import com.example.novelnest.common.PageResponse;
import com.example.novelnest.comment.dto.CommentRequest;
import com.example.novelnest.comment.dto.CommentResponse;
import com.example.novelnest.exception.BadRequestException;
import com.example.novelnest.exception.ResourceNotFoundException;
import com.example.novelnest.security.SecurityUtils;
import com.example.novelnest.story.StoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;

    @Transactional
    public CommentResponse createComment(Long userId, String email, CommentRequest request) {
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new BadRequestException("Content cannot be empty");
        }
        if (!storyRepository.existsById(request.getStoryId())) {
            throw new ResourceNotFoundException("Story not found");
        }
        if (request.getChapterId() != null && !chapterRepository.existsById(request.getChapterId())) {
            throw new ResourceNotFoundException("Chapter not found");
        }

        // Use part before @ in email as username
        String username = email != null ? email.split("@")[0] : "User" + userId;

        Comment comment = Comment.builder()
                .userId(userId)
                .username(username)
                .storyId(request.getStoryId())
                .chapterId(request.getChapterId())
                .content(request.getContent())
                .build();

        comment = commentRepository.save(comment);
        return mapToResponse(comment);
    }

    @Transactional
    public CommentResponse updateComment(Long commentId, Long userId, CommentRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getUserId().equals(userId) && !isAdmin()) {
            throw new BadRequestException("You do not have permission to edit this comment");
        }

        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new BadRequestException("Content cannot be empty");
        }

        comment.setContent(request.getContent());
        comment = commentRepository.save(comment);
        return mapToResponse(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getUserId().equals(userId) && !isAdmin()) {
            throw new BadRequestException("You do not have permission to delete this comment");
        }

        commentRepository.delete(comment);
    }

    public PageResponse<CommentResponse> getStoryComments(Long storyId, int page, int size) {
        Page<Comment> commentPage = commentRepository.findByStoryIdAndChapterIdIsNull(
                storyId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return mapToPageResponse(commentPage);
    }

    public PageResponse<CommentResponse> getChapterComments(Long chapterId, int page, int size) {
        Page<Comment> commentPage = commentRepository.findByChapterId(
                chapterId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return mapToPageResponse(commentPage);
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private CommentResponse mapToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .userId(comment.getUserId())
                .username(comment.getUsername())
                .storyId(comment.getStoryId())
                .chapterId(comment.getChapterId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    private PageResponse<CommentResponse> mapToPageResponse(Page<Comment> page) {
        List<CommentResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.<CommentResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
