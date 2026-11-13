package com.swati.evtimebackend.feed;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.swati.evtimebackend.exception.ApiException;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/feeds")
@Tag(name = "Feeds")
public class FeedAdminController {

    private final ObjectProvider<FeedScheduler> scheduler;

    public FeedAdminController(ObjectProvider<FeedScheduler> scheduler) {
        this.scheduler = scheduler;
    }

    @Operation(summary = "Import new stories from the configured feeds now (ADMIN)")
    @PostMapping("/refresh")
    public Map<String, Integer> refresh() {
        FeedScheduler s = scheduler.getIfAvailable();
        if (s == null) {
            throw new ApiException(HttpStatus.CONFLICT, "Feed import is disabled");
        }
        int imported = s.refresh();
        if (imported < 0) {
            throw new ApiException(HttpStatus.CONFLICT, "An import is already running");
        }
        return Map.of("imported", imported);
    }
}
