package com.example.storyservice.rating;

import com.example.storyservice.exception.BadRequestException;
import com.example.storyservice.exception.ResourceNotFoundException;
import com.example.storyservice.rating.dto.RatingRequest;
import com.example.storyservice.rating.dto.RatingSummaryResponse;
import com.example.storyservice.story.Story;
import com.example.storyservice.story.StoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final StoryRepository storyRepository;

    @Transactional
    public void submitRating(Long userId, Long storyId, RatingRequest request) {
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        Optional<Rating> ratingOpt = ratingRepository.findByUserIdAndStoryId(userId, storyId);
        if (ratingOpt.isPresent()) {
            Rating rating = ratingOpt.get();
            rating.setRating(request.getRating());
            ratingRepository.save(rating);
        } else {
            Rating rating = Rating.builder()
                    .userId(userId)
                    .storyId(storyId)
                    .rating(request.getRating())
                    .build();
            ratingRepository.save(rating);
        }

        updateStoryRatingMetrics(story);
    }

    @Transactional
    public void deleteMyRating(Long userId, Long storyId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        ratingRepository.deleteByUserIdAndStoryId(userId, storyId);

        updateStoryRatingMetrics(story);
    }

    public RatingSummaryResponse getRatingSummary(Long storyId, Long userId) {
        if (!storyRepository.existsById(storyId)) {
            throw new ResourceNotFoundException("Story not found");
        }

        Double avg = ratingRepository.getAverageRatingByStoryId(storyId);
        Long count = ratingRepository.countByStoryId(storyId);

        Integer myRating = null;
        if (userId != null) {
            Optional<Rating> ratingOpt = ratingRepository.findByUserIdAndStoryId(userId, storyId);
            if (ratingOpt.isPresent()) {
                myRating = ratingOpt.get().getRating();
            }
        }

        return RatingSummaryResponse.builder()
                .storyId(storyId)
                .averageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0)
                .ratingCount(count != null ? count : 0L)
                .myRating(myRating)
                .build();
    }

    private void updateStoryRatingMetrics(Story story) {
        Double avg = ratingRepository.getAverageRatingByStoryId(story.getId());
        Long count = ratingRepository.countByStoryId(story.getId());

        story.setRatingAvg(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        story.setRatingCount(count != null ? count : 0L);
        storyRepository.save(story);
    }
}
