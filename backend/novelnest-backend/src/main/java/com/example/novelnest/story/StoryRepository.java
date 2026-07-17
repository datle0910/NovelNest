package com.example.novelnest.story;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoryRepository extends JpaRepository<Story, Long>, JpaSpecificationExecutor<Story> {

    Optional<Story> findBySlug(String slug);
    Optional<Story> findBySlugAndDisplayTrue(String slug);

    boolean existsBySlug(String slug);

    Page<Story> findByDisplayTrue(Pageable pageable);

    @Query("SELECT s FROM Story s WHERE LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Story> searchByTitle(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT s FROM Story s WHERE LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) AND s.display = true")
    Page<Story> searchByTitleAndDisplayTrue(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT s FROM Story s JOIN s.categories c WHERE c.slug = :categorySlug")
    Page<Story> findByCategorySlug(@Param("categorySlug") String categorySlug, Pageable pageable);

    @Query("SELECT s FROM Story s JOIN s.categories c WHERE c.slug = :categorySlug AND s.display = true")
    Page<Story> findByCategorySlugAndDisplayTrue(@Param("categorySlug") String categorySlug, Pageable pageable);

    boolean existsByAuthorId(Long authorId);

    @Query("SELECT COUNT(s) > 0 FROM Story s JOIN s.categories c WHERE c.id = :categoryId")
    boolean existsByCategoryId(@Param("categoryId") Long categoryId);

    @Modifying
    @Query("UPDATE Story s SET s.viewCount = s.viewCount + 1, s.viewCountWeek = s.viewCountWeek + 1, s.viewCountMonth = s.viewCountMonth + 1 WHERE s.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Story s SET s.viewCountWeek = 0")
    void resetViewCountWeek();

    @Modifying
    @Query("UPDATE Story s SET s.viewCountMonth = 0")
    void resetViewCountMonth();
}
