package com.example.storyservice.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminReportWebSocketHandler extends TextWebSocketHandler {

    private final AdminWebSocketSessionRegistry registry;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        registry.add(session);
        // Send a welcome ping to confirm connection
        try {
            session.sendMessage(new TextMessage("{\"type\":\"CONNECTED\"}"));
        } catch (Exception e) {
            log.warn("Could not send welcome message", e);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        registry.remove(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // Ping/Pong keepalive from client
        if ("ping".equalsIgnoreCase(message.getPayload())) {
            try {
                session.sendMessage(new TextMessage("{\"type\":\"PONG\"}"));
            } catch (Exception e) {
                log.warn("Could not send pong", e);
            }
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        registry.remove(session);
        log.warn("WebSocket transport error for session {}: {}", session.getId(), exception.getMessage());
    }
}
