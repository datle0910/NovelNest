package com.example.novelnest.config;

import com.example.novelnest.security.CustomAccessDeniedHandler;
import com.example.novelnest.security.JwtAuthenticationEntryPoint;
import com.example.novelnest.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Unified Security configuration for NovelNest monolith.
 * Merges rules from auth-service, story-service, and media-service.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(customAccessDeniedHandler)
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> {
                // --- Auth endpoints (public) ---
                auth.requestMatchers(
                        "/api/auth/register",
                        "/api/auth/login",
                        "/api/auth/health",
                        "/api/auth/refresh-token",
                        "/api/auth/forgot-password/**"
                ).permitAll();

                // --- Story/Category/Author public GET endpoints ---
                String[] publicGetEndpoints = {
                    "/api/stories/health",
                    "/api/stories/**",
                    "/api/categories/**",
                    "/api/authors/**",
                    "/api/chapters/*/comments",
                    "/api/stories/*/comments",
                    "/api/stories/*/ratings/summary"
                };
                auth.requestMatchers(HttpMethod.GET, publicGetEndpoints).permitAll();
                auth.requestMatchers(HttpMethod.POST, "/api/stories/advanced-search").permitAll();
                auth.requestMatchers(HttpMethod.POST, "/api/chapters/*/reports").permitAll();

                // --- Media public endpoints ---
                auth.requestMatchers(HttpMethod.GET, "/api/media/health", "/media/**").permitAll();

                // --- WebSocket & Actuator ---
                auth.requestMatchers("/ws/**", "/actuator/**").permitAll();

                // --- Admin endpoints require ADMIN role ---
                auth.requestMatchers("/api/admin/**").hasRole("ADMIN");

                // --- All other requests require authentication ---
                auth.anyRequest().authenticated();
            });

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
