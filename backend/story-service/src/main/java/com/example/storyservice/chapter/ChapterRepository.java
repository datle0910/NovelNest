package com.example.storyservice.chapter;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {

    List<Chapter> findByStoryIdOrderByChapterNumberAsc(Long storyId);

    Optional<Chapter> findByStoryIdAndChapterNumber(Long storyId, Integer chapterNumber);

    boolean existsByStoryIdAndChapterNumber(Long storyId, Integer chapterNumber);

    int countByStoryId(Long storyId);

    @Modifying
    @Query("UPDATE Chapter c SET c.viewCount = c.viewCount + 1 WHERE c.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Query("SELECT MAX(c.chapterNumber) FROM Chapter c WHERE c.story.id = :storyId AND c.chapterNumber < :currentNumber")
    Optional<Integer> findPreviousChapterNumber(@Param("storyId") Long storyId, @Param("currentNumber") Integer currentNumber);

    @Query("SELECT MIN(c.chapterNumber) FROM Chapter c WHERE c.story.id = :storyId AND c.chapterNumber > :currentNumber")
    Optional<Integer> findNextChapterNumber(@Param("storyId") Long storyId, @Param("currentNumber") Integer currentNumber);

    @Query("SELECT c.chapterNumber FROM Chapter c WHERE c.story.id = :storyId")
    List<Integer> findChapterNumbersByStoryId(@Param("storyId") Long storyId);
}
