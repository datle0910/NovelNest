package com.example.storyservice.crawler.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "import_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_name", nullable = false)
    private String sourceName;

    @Column(name = "source_url")
    private String sourceUrl;

    @Column(name = "import_type", nullable = false)
    private String importType;

    @Column(nullable = false)
    private String status;

    @Column(name = "total_found")
    @Builder.Default
    private Integer totalFound = 0;

    @Column(name = "total_imported")
    @Builder.Default
    private Integer totalImported = 0;

    @Column(name = "total_skipped")
    @Builder.Default
    private Integer totalSkipped = 0;

    @Column(name = "total_failed")
    @Builder.Default
    private Integer totalFailed = 0;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;
}
