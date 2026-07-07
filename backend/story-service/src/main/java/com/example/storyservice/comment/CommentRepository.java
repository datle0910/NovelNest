package com.example.storyservice.comment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByStoryIdAndChapterIdIsNull(Long storyId, Pageable pageable);
    Page<Comment> findByChapterId(Long chapterId, Pageable pageable);
}
