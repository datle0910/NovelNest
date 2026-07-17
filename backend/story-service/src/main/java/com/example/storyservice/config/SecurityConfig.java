package com.example.storyservice.config;

import com.example.storyservice.security.CustomAccessDeniedHandler;
import com.example.storyservice.security.JwtAuthenticationEntryPoint;
import com.example.storyservice.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Security configuration for story-service.
 * Public GET endpoints for reading stories/categories/authors.
 * Admin endpoints require JWT with ADMIN role.
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
                String[] publicEndpoints = {
                    "/api/stories/health",
                    "/api/stories/**",
                    "/api/categories/**",
                    "/api/authors/**",
                    "/api/chapters/*/comments",
                    "/api/stories/*/comments",
                    "/api/stories/*/ratings/summary",
                    "/ws/**",       // WebSocket handshake (auth done via token query param)
                    "/actuator/**"
                };
                auth.requestMatchers(HttpMethod.GET, publicEndpoints).permitAll()
                .requestMatchers(HttpMethod.POST, "/api/stories/advanced-search").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/chapters/*/reports").permitAll()
                // Admin endpoints - require ADMIN role
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // All other requests need authentication
                .anyRequest().authenticated();
            });

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
