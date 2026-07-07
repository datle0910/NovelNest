package com.example.storyservice.history;

import com.example.storyservice.chapter.Chapter;
import com.example.storyservice.chapter.ChapterRepository;
import com.example.storyservice.common.PageResponse;
import com.example.storyservice.exception.ResourceNotFoundException;
import com.example.storyservice.history.dto.ReadingHistoryRequest;
import com.example.storyservice.history.dto.ReadingHistoryResponse;
import com.example.storyservice.story.Story;
import com.example.storyservice.story.StoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReadingHistoryService {

    private final ReadingHistoryRepository readingHistoryRepository;
    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;

    @Transactional
    public void saveHistory(Long userId, ReadingHistoryRequest request) {
        if (!storyRepository.existsById(request.getStoryId())) {
            throw new ResourceNotFoundException("Story not found");
        }
        if (!chapterRepository.existsById(request.getChapterId())) {
            throw new ResourceNotFoundException("Chapter not found");
        }

        Optional<ReadingHistory> historyOpt = readingHistoryRepository.findByUserIdAndStoryId(userId, request.getStoryId());
        
        ReadingHistory history;
        if (historyOpt.isPresent()) {
            history = historyOpt.get();
            history.setChapterId(request.getChapterId());
            history.setLastReadAt(LocalDateTime.now());
        } else {
            history = ReadingHistory.builder()
                    .userId(userId)
                    .storyId(request.getStoryId())
                    .chapterId(request.getChapterId())
                    .lastReadAt(LocalDateTime.now())
                    .build();
        }
        readingHistoryRepository.save(history);
    }

    public ReadingHistoryResponse getStoryHistory(Long userId, Long storyId) {
        ReadingHistory history = readingHistoryRepository.findByUserIdAndStoryId(userId, storyId)
                .orElseThrow(() -> new ResourceNotFoundException("No reading history found for this story"));
        
        Story story = storyRepository.findById(storyId).orElse(null);
        Chapter chapter = chapterRepository.findById(history.getChapterId()).orElse(null);

        return ReadingHistoryResponse.builder()
                .id(history.getId())
                .storyId(history.getStoryId())
                .storyTitle(story != null ? story.getTitle() : null)
                .storySlug(story != null ? story.getSlug() : null)
                .coverImage(story != null ? story.getCoverImage() : null)
                .chapterId(history.getChapterId())
                .chapterTitle(chapter != null ? chapter.getTitle() : null)
                .chapterNumber(chapter != null ? chapter.getChapterNumber() : null)
                .lastReadAt(history.getLastReadAt())
                .build();
    }

    public PageResponse<ReadingHistoryResponse> getUserHistory(Long userId, int page, int size) {
        Page<ReadingHistory> historyPage = readingHistoryRepository.findByUserId(
                userId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "lastReadAt")));

        List<ReadingHistoryResponse> responses = historyPage.getContent().stream()
                .map(history -> {
                    Story story = storyRepository.findById(history.getStoryId()).orElse(null);
                    Chapter chapter = chapterRepository.findById(history.getChapterId()).orElse(null);

                    return ReadingHistoryResponse.builder()
                            .id(history.getId())
                            .storyId(history.getStoryId())
                            .storyTitle(story != null ? story.getTitle() : null)
                            .storySlug(story != null ? story.getSlug() : null)
                            .coverImage(story != null ? story.getCoverImage() : null)
                            .chapterId(history.getChapterId())
                            .chapterTitle(chapter != null ? chapter.getTitle() : null)
                            .chapterNumber(chapter != null ? chapter.getChapterNumber() : null)
                            .lastReadAt(history.getLastReadAt())
                            .build();
                })
                .collect(Collectors.toList());

        return PageResponse.<ReadingHistoryResponse>builder()
                .content(responses)
                .page(historyPage.getNumber())
                .size(historyPage.getSize())
                .totalElements(historyPage.getTotalElements())
                .totalPages(historyPage.getTotalPages())
                .last(historyPage.isLast())
                .build();
    }
}
