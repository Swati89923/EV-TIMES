package com.swati.evtimebackend;

import com.swati.evtimebackend.feed.FeedImportService;
import com.swati.evtimebackend.repository.NewsRepository;
import com.swati.evtimebackend.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

import static org.hamcrest.Matchers.hasItem;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class FeedImportTest {

    @Autowired
    private FeedImportService importService;

    @Autowired
    private NewsRepository newsRepository;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    private static String rfc822(Instant t) {
        return DateTimeFormatter.RFC_1123_DATE_TIME.format(t.atOffset(ZoneOffset.UTC));
    }

    private static byte[] feed(String marker) {
        String recent = rfc822(Instant.now().minusSeconds(600));
        String old = rfc822(Instant.now().minusSeconds(60L * 60 * 24 * 400));
        String xml = """
                <?xml version="1.0" encoding="UTF-8"?>
                <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/"
                     xmlns:content="http://purl.org/rss/1.0/modules/content/">
                  <channel>
                    <title>Test feed</title>
                    <item>
                      <title>New solid-state battery plant opens %1$s</title>
                      <link>https://example.com/%1$s/battery</link>
                      <pubDate>%2$s</pubDate>
                      <description><![CDATA[<p>The <b>factory</b> will build cells.</p>]]></description>
                      <media:content url="https://img.example.com/%1$s/a.jpg" medium="image"/>
                    </item>
                    <item>
                      <title>Fast chargers arrive on highways %1$s</title>
                      <link>https://example.com/%1$s/charging</link>
                      <pubDate>%2$s</pubDate>
                      <content:encoded><![CDATA[<p>Text <img src="https://img.example.com/%1$s/b.png"> more</p>]]></content:encoded>
                    </item>
                    <item>
                      <title>Insecure link should be skipped %1$s</title>
                      <link>http://example.com/%1$s/insecure</link>
                      <pubDate>%2$s</pubDate>
                    </item>
                    <item>
                      <title>Very old story should be skipped %1$s</title>
                      <link>https://example.com/%1$s/old</link>
                      <pubDate>%3$s</pubDate>
                    </item>
                  </channel>
                </rss>
                """.formatted(marker, recent, old);
        return xml.getBytes(StandardCharsets.UTF_8);
    }

    @Test
    void importsStoriesCategorisesAndDeduplicates() throws Exception {
        int first = importService.importFromXml("Example Wire", feed("run1"));
        assertEquals(2, first);

        int second = importService.importFromXml("Example Wire", feed("run1"));
        assertEquals(0, second, "same links must not be imported twice");

        var battery = newsRepository.findAll().stream()
                .filter(n -> n.getTitle().contains("solid-state battery plant opens run1"))
                .findFirst().orElseThrow();
        assertEquals("Batteries", battery.getCategory());
        assertEquals("Example Wire", battery.getSourceName());
        assertEquals("https://example.com/run1/battery", battery.getSourceUrl());
        assertEquals("https://img.example.com/run1/a.jpg", battery.getImageUrl());
        assertEquals("The factory will build cells.", battery.getDescription());
        assertTrue(battery.getExternalId().length() == 64);

        var charger = newsRepository.findAll().stream()
                .filter(n -> n.getTitle().contains("Fast chargers arrive on highways run1"))
                .findFirst().orElseThrow();
        assertEquals("Infrastructure", charger.getCategory());
        assertEquals("https://img.example.com/run1/b.png", charger.getImageUrl());
    }

    @Test
    void latestEndpointReturnsOnlyNewerStoriesAndFlagsExternal() throws Exception {
        importService.importFromXml("Example Wire", feed("run2"));

        mockMvc.perform(get("/api/news/latest").param("since", Instant.now().minusSeconds(3600).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].title", hasItem("New solid-state battery plant opens run2")))
                .andExpect(jsonPath("$[0].external").value(true))
                .andExpect(jsonPath("$[0].sourceName").value("Example Wire"));

        mockMvc.perform(get("/api/news/latest").param("since", Instant.now().plusSeconds(60).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void refreshEndpointIsAdminOnly() throws Exception {
        mockMvc.perform(post("/api/admin/feeds/refresh")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/admin/feeds/refresh")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken("e@example.com", "EDITOR")))
                .andExpect(status().isForbidden());
        // feeds are disabled in the test profile, so an admin gets a clear 409
        mockMvc.perform(post("/api/admin/feeds/refresh")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken("a@example.com", "ADMIN")))
                .andExpect(status().isConflict());
    }
}
