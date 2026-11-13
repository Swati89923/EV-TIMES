package com.swati.evtimebackend.feed;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicBoolean;

/** Runs the feed import on start-up and then at a fixed interval. */
@Component
@EnableScheduling
@ConditionalOnProperty(name = "app.feeds.enabled", havingValue = "true")
public class FeedScheduler {

    private final FeedImportService importService;
    private final AtomicBoolean running = new AtomicBoolean(false);

    public FeedScheduler(FeedImportService importService) {
        this.importService = importService;
    }

    @Scheduled(
            initialDelayString = "${app.feeds.initial-delay-ms:3000}",
            fixedDelayString = "${app.feeds.interval-ms:600000}")
    public void run() {
        refresh();
    }

    /** @return number of new stories, or -1 when an import is already running */
    public int refresh() {
        if (!running.compareAndSet(false, true)) {
            return -1;
        }
        try {
            return importService.importAll();
        } finally {
            running.set(false);
        }
    }
}
