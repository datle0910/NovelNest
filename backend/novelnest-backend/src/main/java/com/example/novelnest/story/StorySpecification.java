package com.example.novelnest.story;

import com.example.novelnest.category.Category;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Dynamic JPA Specification for tri-state category filtering.
 * 
 * Include (Must Have): Story must contain ALL categories in includeIds.
 *   Uses one EXISTS correlated subquery per category ID.
 * 
 * Exclude (Must Not Have): Story must NOT contain ANY category in excludeIds.
 *   Uses a single NOT EXISTS correlated subquery with IN(...).
 * 
 * Mapping: Story.categories (ManyToMany) -> join table "story_categories"
 *          with columns story_id, category_id.
 *          JPA navigates via root.join("categories").get("id").
 */
public class StorySpecification {

    /**
     * Build a Specification that applies:
     * - keyword search on title (optional)
     * - include ALL of the given category IDs
     * - exclude ANY of the given category IDs
     * - status filter (optional)
     * - only displayed stories (display = true)
     * 
     * Input sanitization:
     * - null or empty lists are treated as "no filter".
     * - if the same category ID appears in both include and exclude,
     *   exclude wins (that ID is removed from includeIds).
     */
    public static Specification<Story> advancedFilter(
            String keyword,
            List<Long> includeCategoryIds,
            List<Long> excludeCategoryIds,
            String status) {

        // Sanitize: deduplicate and resolve conflicts (exclude wins)
        Set<Long> excludeSet = (excludeCategoryIds != null)
                ? new HashSet<>(excludeCategoryIds) : new HashSet<>();
        List<Long> safeInclude = (includeCategoryIds != null)
                ? includeCategoryIds.stream()
                    .distinct()
                    .filter(id -> id != null && !excludeSet.contains(id))
                    .collect(Collectors.toList())
                : List.of();
        List<Long> safeExclude = excludeSet.stream()
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only show displayed stories
            predicates.add(cb.isTrue(root.get("display")));

            // Keyword filter on title
            if (keyword != null && !keyword.isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("title")),
                        "%" + keyword.strip().toLowerCase() + "%"
                ));
            }

            // Status filter
            if (status != null && !status.isBlank()) {
                try {
                    StoryStatus storyStatus = StoryStatus.valueOf(status);
                    predicates.add(cb.equal(root.get("status"), storyStatus));
                } catch (IllegalArgumentException ignored) {
                    // Invalid status value, skip filter
                }
            }

            // INCLUDE: Story must have ALL specified categories
            // One EXISTS subquery per category ensures AND-ALL semantics.
            if (!safeInclude.isEmpty()) {
                for (Long categoryId : safeInclude) {
                    Subquery<Long> includeSubquery = query.subquery(Long.class);
                    Root<Story> subRoot = includeSubquery.correlate(root);
                    Join<Story, Category> subJoin = subRoot.join("categories");
                    includeSubquery.select(cb.literal(1L))
                            .where(cb.equal(subJoin.get("id"), categoryId));
                    predicates.add(cb.exists(includeSubquery));
                }
            }

            // EXCLUDE: Story must NOT have ANY of the specified categories
            // Single NOT EXISTS with IN(...) ensures OR-ANY exclusion.
            if (!safeExclude.isEmpty()) {
                Subquery<Long> excludeSubquery = query.subquery(Long.class);
                Root<Story> subRoot = excludeSubquery.correlate(root);
                Join<Story, Category> subJoin = subRoot.join("categories");
                excludeSubquery.select(cb.literal(1L))
                        .where(subJoin.get("id").in(safeExclude));
                predicates.add(cb.not(cb.exists(excludeSubquery)));
            }

            // Ensure distinct results (many-to-many join can duplicate rows)
            query.distinct(true);

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
