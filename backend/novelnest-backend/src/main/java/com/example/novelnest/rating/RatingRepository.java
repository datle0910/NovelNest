package com.example.novelnest.rating;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByUserIdAndStoryId(Long userId, Long storyId);
    void deleteByUserIdAndStoryId(Long userId, Long storyId);

    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.storyId = :storyId")
    Double getAverageRatingByStoryId(Long storyId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.storyId = :storyId")
    Long countByStoryId(Long storyId);
}
