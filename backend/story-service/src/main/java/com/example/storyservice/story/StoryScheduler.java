package com.example.storyservice.story;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class StoryScheduler {

    private final StoryRepository storyRepository;

    /**
     * Resets weekly views at 00:00 every Monday
     */
    @Scheduled(cron = "0 0 0 * * MON")
    @Transactional
    public void resetWeeklyViews() {
        log.info("Starting scheduled task: Resetting weekly view counts");
        storyRepository.resetViewCountWeek();
        log.info("Finished scheduled task: Resetting weekly view counts");
    }

    /**
     * Resets monthly views at 00:00 on the 1st of every month
     */
    @Scheduled(cron = "0 0 0 1 * ?")
    @Transactional
    public void resetMonthlyViews() {
        log.info("Starting scheduled task: Resetting monthly view counts");
        storyRepository.resetViewCountMonth();
        log.info("Finished scheduled task: Resetting monthly view counts");
    }
}
