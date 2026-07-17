package com.example.novelnest.chapter;

import com.example.novelnest.chapter.dto.ChapterDetailResponse;
import com.example.novelnest.chapter.dto.ChapterListResponse;
import com.example.novelnest.chapter.dto.ChapterRequest;
import com.example.novelnest.exception.BadRequestException;
import com.example.novelnest.exception.ResourceNotFoundException;
import com.example.novelnest.story.Story;
import com.example.novelnest.story.StoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChapterService {

    private final ChapterRepository chapterRepository;
    private final StoryRepository storyRepository;

    public List<ChapterListResponse> getChaptersByStorySlug(String storySlug) {
        Story story = storyRepository.findBySlug(storySlug)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        return chapterRepository.findByStoryIdOrderByChapterNumberAsc(story.getId()).stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChapterDetailResponse getChapterDetail(String storySlug, Integer chapterNumber) {
        Story story = storyRepository.findBySlug(storySlug)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        Chapter chapter = chapterRepository.findByStoryIdAndChapterNumber(story.getId(), chapterNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));

        // Increment view count
        chapterRepository.incrementViewCount(chapter.getId());

        // Get previous and next chapter numbers
        Integer previousChapterNumber = chapterRepository
                .findPreviousChapterNumber(story.getId(), chapterNumber)
                .orElse(null);
        Integer nextChapterNumber = chapterRepository
                .findNextChapterNumber(story.getId(), chapterNumber)
                .orElse(null);

        return ChapterDetailResponse.builder()
                .storyId(story.getId())
                .storyTitle(story.getTitle())
                .storySlug(story.getSlug())
                .chapterId(chapter.getId())
                .chapterTitle(chapter.getTitle())
                .chapterNumber(chapter.getChapterNumber())
                .content(chapter.getContent())
                .previousChapterNumber(previousChapterNumber)
                .nextChapterNumber(nextChapterNumber)
                .build();
    }

    @Transactional
    public ChapterListResponse createChapter(Long storyId, ChapterRequest request) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found with id: " + storyId));

        if (chapterRepository.existsByStoryIdAndChapterNumber(storyId, request.getChapterNumber())) {
            throw new BadRequestException("Chapter number already exists in this story");
        }

        Chapter chapter = Chapter.builder()
                .story(story)
                .title(request.getTitle())
                .chapterNumber(request.getChapterNumber())
                .content(request.getContent())
                .viewCount(0L)
                .build();

        Chapter saved = chapterRepository.save(chapter);
        log.info("Chapter created: {} for story: {}", saved.getTitle(), story.getTitle());
        return mapToListResponse(saved);
    }

    @Transactional
    public ChapterListResponse updateChapter(Long id, ChapterRequest request) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + id));

        // Check if chapter number conflicts with another chapter in the same story
        if (!chapter.getChapterNumber().equals(request.getChapterNumber())) {
            if (chapterRepository.existsByStoryIdAndChapterNumber(chapter.getStory().getId(), request.getChapterNumber())) {
                throw new BadRequestException("Chapter number already exists in this story");
            }
        }

        chapter.setTitle(request.getTitle());
        chapter.setChapterNumber(request.getChapterNumber());
        chapter.setContent(request.getContent());

        Chapter saved = chapterRepository.save(chapter);
        log.info("Chapter updated: {}", saved.getTitle());
        return mapToListResponse(saved);
    }

    @Transactional
    public void deleteChapter(Long id) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + id));

        chapterRepository.delete(chapter);
        log.info("Chapter deleted: {}", chapter.getTitle());
    }

    private ChapterListResponse mapToListResponse(Chapter chapter) {
        return ChapterListResponse.builder()
                .id(chapter.getId())
                .title(chapter.getTitle())
                .chapterNumber(chapter.getChapterNumber())
                .viewCount(chapter.getViewCount())
                .createdAt(chapter.getCreatedAt())
                .updatedAt(chapter.getUpdatedAt())
                .build();
    }
}
