package com.example.storyservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Creates performance indexes on startup for tables managed by Hibernate ddl-auto.
 * Uses CREATE INDEX IF NOT EXISTS semantics (MySQL 8+ compatible via exception handling).
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(100) // Run after Hibernate has created/updated tables
public class DatabaseIndexInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        createIndexIfNotExists(
                "idx_story_categories_story_id",
                "story_categories",
                "story_id"
        );
        createIndexIfNotExists(
                "idx_story_categories_category_id",
                "story_categories",
                "category_id"
        );
        createIndexIfNotExists(
                "idx_story_categories_composite",
                "story_categories",
                "story_id, category_id"
        );
        createIndexIfNotExists(
                "idx_stories_display",
                "stories",
                "display"
        );
    }

    private void createIndexIfNotExists(String indexName, String tableName, String columns) {
        try {
            jdbcTemplate.execute(
                    String.format("CREATE INDEX %s ON %s (%s)", indexName, tableName, columns)
            );
            log.info("Created index: {} on {}", indexName, tableName);
        } catch (Exception e) {
            // Index already exists or table doesn't exist yet — both are safe to ignore
            log.debug("Index {} already exists or could not be created: {}", indexName, e.getMessage());
        }
    }
}
