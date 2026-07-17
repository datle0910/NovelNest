package com.example.novelnest.config;

import com.example.novelnest.user.Role;
import com.example.novelnest.user.User;
import com.example.novelnest.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Merged DataInitializer from auth-service and story-service.
 * Creates the default admin account on first startup.
 * Story seed data is disabled by default (was commented out in story-service too).
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByRole(Role.ADMIN)) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@novelnest.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();

            userRepository.save(admin);
            log.info("✅ Default admin account created: admin@novelnest.com");
        } else {
            log.info("Admin account already exists. Skipping initialization.");
        }
    }
}
