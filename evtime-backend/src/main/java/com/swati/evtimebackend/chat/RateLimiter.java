package com.swati.evtimebackend.chat;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

/** Small in-memory sliding-window limiter, one window per client key (IP). */
public class RateLimiter {

    private final int maxRequests;
    private final long windowMillis;
    private final ConcurrentHashMap<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    public RateLimiter(int maxRequests, long windowSeconds) {
        this.maxRequests = maxRequests;
        this.windowMillis = windowSeconds * 1000;
    }

    public boolean tryAcquire(String key) {
        long now = System.currentTimeMillis();
        if (hits.size() > 10_000) {
            hits.entrySet().removeIf(e -> {
                synchronized (e.getValue()) {
                    return e.getValue().isEmpty() || now - e.getValue().peekLast() > windowMillis;
                }
            });
        }
        Deque<Long> window = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (window) {
            while (!window.isEmpty() && now - window.peekFirst() > windowMillis) {
                window.pollFirst();
            }
            if (window.size() >= maxRequests) {
                return false;
            }
            window.addLast(now);
            return true;
        }
    }
}
