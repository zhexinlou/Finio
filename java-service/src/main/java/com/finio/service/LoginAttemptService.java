package com.finio.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final int BLOCK_MINUTES = 15;

    private final ConcurrentHashMap<String, AttemptInfo> attempts = new ConcurrentHashMap<>();

    public void loginFailed(String ip) {
        AttemptInfo info = attempts.computeIfAbsent(ip, k -> new AttemptInfo());
        info.incrementAttempts();
        info.setLastAttempt(LocalDateTime.now());
    }

    public void loginSucceeded(String ip) {
        attempts.remove(ip);
    }

    public boolean isBlocked(String ip) {
        AttemptInfo info = attempts.get(ip);
        if (info == null) return false;

        // Check if block period has passed
        if (info.getAttempts() >= MAX_ATTEMPTS) {
            if (info.getLastAttempt().plusMinutes(BLOCK_MINUTES).isBefore(LocalDateTime.now())) {
                attempts.remove(ip);
                return false;
            }
            return true;
        }
        return false;
    }

    private static class AttemptInfo {
        private int attempts = 0;
        private LocalDateTime lastAttempt = LocalDateTime.now();

        public void incrementAttempts() { this.attempts++; }
        public int getAttempts() { return attempts; }
        public LocalDateTime getLastAttempt() { return lastAttempt; }
        public void setLastAttempt(LocalDateTime lastAttempt) { this.lastAttempt = lastAttempt; }
    }
}
