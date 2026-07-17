package com.example.novelnest.websocket;

import com.example.novelnest.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketConfigurer {

    private final AdminReportWebSocketHandler adminReportWebSocketHandler;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(adminReportWebSocketHandler, "/ws/admin-reports")
                .addInterceptors(new HandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
                        // Extract token from query parameter: ?token=<jwt>
                        List<String> tokens = UriComponentsBuilder.fromUri(request.getURI())
                                .build().getQueryParams().get("token");

                        if (tokens == null || tokens.isEmpty()) {
                            log.warn("WebSocket handshake rejected: no token provided");
                            return false;
                        }

                        String token = tokens.get(0);
                        if (!jwtTokenProvider.validateToken(token)) {
                            log.warn("WebSocket handshake rejected: invalid token");
                            return false;
                        }

                        String role = jwtTokenProvider.getRoleFromToken(token);
                        if (!"ADMIN".equals(role)) {
                            log.warn("WebSocket handshake rejected: not an admin");
                            return false;
                        }

                        log.info("WebSocket handshake accepted for admin user");
                        return true;
                    }

                    @Override
                    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                               WebSocketHandler wsHandler, Exception exception) {}
                })
                .setAllowedOriginPatterns("*"); // CORS for WebSocket
    }
}
