package com.example.novelnest.history;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reading_history", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "story_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadingHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "story_id", nullable = false)
    private Long storyId;

    @Column(name = "chapter_id", nullable = false)
    private Long chapterId;

    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;
}
