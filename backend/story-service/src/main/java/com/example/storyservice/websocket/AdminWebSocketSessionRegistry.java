package com.example.storyservice.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.concurrent.CopyOnWriteArraySet;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminWebSocketSessionRegistry {

    private final CopyOnWriteArraySet<WebSocketSession> sessions = new CopyOnWriteArraySet<>();
    private final ObjectMapper objectMapper;

    public void add(WebSocketSession session) {
        sessions.add(session);
        log.info("Admin WebSocket connected: {}. Total sessions: {}", session.getId(), sessions.size());
    }

    public void remove(WebSocketSession session) {
        sessions.remove(session);
        log.info("Admin WebSocket disconnected: {}. Total sessions: {}", session.getId(), sessions.size());
    }

    public void broadcast(Object payload) {
        log.info("Attempting to broadcast WebSocket message to {} sessions", sessions.size());
        if (sessions.isEmpty()) {
            log.warn("No active WebSocket sessions to broadcast to");
            return;
        }
        try {
            String json = objectMapper.writeValueAsString(payload);
            log.info("Broadcasting payload: {}", json);
            TextMessage message = new TextMessage(json);
            CopyOnWriteArraySet<WebSocketSession> deadSessions = new CopyOnWriteArraySet<>();
            sessions.forEach(session -> {
                try {
                    if (session.isOpen()) {
                        synchronized (session) {
                            session.sendMessage(message);
                            log.info("Message sent successfully to session {}", session.getId());
                        }
                    } else {
                        log.warn("Session {} is closed, adding to dead sessions", session.getId());
                        deadSessions.add(session);
                    }
                } catch (Exception e) {
                    log.warn("Failed to send to session {}: {}", session.getId(), e.getMessage());
                    deadSessions.add(session);
                }
            });
            sessions.removeAll(deadSessions);
            if (!deadSessions.isEmpty()) {
                log.info("Removed {} dead sessions", deadSessions.size());
            }
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket message", e);
        }
    }
}
