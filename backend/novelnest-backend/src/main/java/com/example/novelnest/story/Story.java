package com.example.novelnest.story;

import com.example.novelnest.author.Author;
import com.example.novelnest.category.Category;
import com.example.novelnest.chapter.Chapter;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "stories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Story {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "cover_image")
    private String coverImage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private Author author;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StoryStatus status;

    @Column(name = "view_count")
    @Builder.Default
    private Long viewCount = 0L;

    @Column(name = "view_count_week")
    @Builder.Default
    private Long viewCountWeek = 0L;

    @Column(name = "view_count_month")
    @Builder.Default
    private Long viewCountMonth = 0L;

    @Column(nullable = false)
    @Builder.Default
    private Double ratingAvg = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Long ratingCount = 0L;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "story_categories",
            joinColumns = @JoinColumn(name = "story_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private Set<Category> categories = new HashSet<>();

    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Chapter> chapters = new ArrayList<>();

    @Column(name = "source_name")
    private String sourceName;

    @Column(name = "source_url")
    private String sourceUrl;

    @Column(name = "license_name")
    private String licenseName;

    @Column(columnDefinition = "TEXT")
    private String attribution;

    @Column(nullable = false)
    @Builder.Default
    private Boolean imported = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean display = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
