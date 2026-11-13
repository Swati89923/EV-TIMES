package com.swati.evtimebackend.feed;

import com.rometools.rome.feed.synd.SyndContent;
import com.rometools.rome.feed.synd.SyndEnclosure;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import com.swati.evtimebackend.entity.News;
import com.swati.evtimebackend.repository.NewsRepository;
import org.jdom2.Element;
import org.jsoup.Jsoup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Imports headlines from public RSS/Atom feeds. Only the headline, a short
 * summary, the image URL and a link to the original story are stored.
 */
@Service
public class FeedImportService {

    private static final Logger log = LoggerFactory.getLogger(FeedImportService.class);
    private static final int MAX_FEED_BYTES = 4 * 1024 * 1024;
    private static final int MAX_AGE_DAYS = 45;
    private static final int RETENTION_DAYS = 90;

    private final NewsRepository newsRepository;
    private final List<FeedSource> sources;
    private final int maxPerFeed;
    private final HttpClient http = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .connectTimeout(Duration.ofSeconds(8))
            .build();

    public record FeedSource(String name, String url) {
    }

    public FeedImportService(
            NewsRepository newsRepository,
            @Value("${app.feeds.sources:}") String sources,
            @Value("${app.feeds.max-per-feed:40}") int maxPerFeed) {
        this.newsRepository = newsRepository;
        this.maxPerFeed = maxPerFeed;
        this.sources = parseSources(sources);
    }

    static List<FeedSource> parseSources(String raw) {
        List<FeedSource> list = new ArrayList<>();
        for (String part : raw.split(",")) {
            String[] kv = part.trim().split("\\|", 2);
            if (kv.length == 2 && kv[1].trim().startsWith("https://")) {
                list.add(new FeedSource(kv[0].trim(), kv[1].trim()));
            }
        }
        return list;
    }

    /** Fetches every configured feed. One failing feed never stops the others. */
    public int importAll() {
        int total = 0;
        for (FeedSource source : sources) {
            try {
                total += importFromXml(source.name(), fetch(source.url()));
            } catch (Exception e) {
                log.warn("Feed '{}' failed: {}", source.name(), e.toString());
            }
        }
        try {
            newsRepository.deleteOldImported(Instant.now().minus(RETENTION_DAYS, ChronoUnit.DAYS));
        } catch (Exception e) {
            log.warn("Cleanup of old imported stories failed: {}", e.toString());
        }
        log.info("Feed import finished: {} new stories", total);
        return total;
    }

    private byte[] fetch(String url) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(15))
                .header("User-Agent", "EVTimesBot/1.0 (news aggregator)")
                .header("Accept", "application/rss+xml, application/atom+xml, application/xml, text/xml")
                .GET().build();
        HttpResponse<byte[]> response = http.send(request, HttpResponse.BodyHandlers.ofByteArray());
        if (response.statusCode() != 200) {
            throw new IOException("HTTP " + response.statusCode());
        }
        if (response.body().length > MAX_FEED_BYTES) {
            throw new IOException("feed too large");
        }
        return response.body();
    }

    /** Parses a feed document and stores the stories we do not have yet. */
    @Transactional
    public int importFromXml(String sourceName, byte[] xml) throws Exception {
        SyndFeed feed;
        try (XmlReader reader = new XmlReader(new ByteArrayInputStream(xml))) {
            feed = new SyndFeedInput().build(reader);
        }

        Instant now = Instant.now();
        Instant oldest = now.minus(MAX_AGE_DAYS, ChronoUnit.DAYS);
        Map<String, News> candidates = new LinkedHashMap<>();

        int seen = 0;
        for (SyndEntry entry : feed.getEntries()) {
            if (seen++ >= maxPerFeed) break;
            News news = toNews(sourceName, entry, now);
            if (news == null || news.getCreatedAt().isBefore(oldest)) continue;
            candidates.putIfAbsent(news.getExternalId(), news);
        }
        if (candidates.isEmpty()) return 0;

        Set<String> existing = new HashSet<>(
                newsRepository.findExistingExternalIds(candidates.keySet()));
        List<News> fresh = candidates.values().stream()
                .filter(n -> !existing.contains(n.getExternalId()))
                .toList();
        newsRepository.saveAll(fresh);
        return fresh.size();
    }

    private News toNews(String sourceName, SyndEntry entry, Instant now) {
        String link = entry.getLink();
        String title = clean(entry.getTitle());
        if (link == null || !link.startsWith("https://") || link.length() > 1000
                || title == null || title.isBlank()) {
            return null;
        }

        String html = descriptionHtml(entry);
        String summary = clean(html);
        if (summary == null || summary.isBlank()) summary = title;

        Date published = entry.getPublishedDate() != null
                ? entry.getPublishedDate() : entry.getUpdatedDate();
        Instant createdAt = published == null ? now : published.toInstant();
        if (createdAt.isAfter(now)) createdAt = now;

        News n = new News();
        n.setTitle(truncate(title, 200));
        n.setDescription(truncate(summary, 500));
        n.setImageUrl(findImage(entry, html));
        n.setCategory(categorize(title + " " + summary));
        n.setAuthor(truncate(clean(entry.getAuthor()), 100));
        n.setSourceName(truncate(sourceName, 100));
        n.setSourceUrl(link);
        n.setExternalId(sha256(link));
        n.setFeatured(false);
        n.setViews(0L);
        n.setCreatedAt(createdAt);
        return n;
    }

    private static String descriptionHtml(SyndEntry entry) {
        if (entry.getDescription() != null && entry.getDescription().getValue() != null) {
            return entry.getDescription().getValue();
        }
        for (SyndContent c : entry.getContents()) {
            if (c.getValue() != null) return c.getValue();
        }
        return "";
    }

    private static String findImage(SyndEntry entry, String html) {
        for (SyndEnclosure e : entry.getEnclosures()) {
            if (e.getType() != null && e.getType().startsWith("image/") && isHttps(e.getUrl())) {
                return e.getUrl();
            }
        }
        for (Object o : entry.getForeignMarkup()) {
            if (o instanceof Element el
                    && ("content".equals(el.getName()) || "thumbnail".equals(el.getName()))) {
                String url = el.getAttributeValue("url");
                String medium = el.getAttributeValue("medium");
                String type = el.getAttributeValue("type");
                boolean image = "thumbnail".equals(el.getName())
                        || "image".equals(medium)
                        || (type != null && type.startsWith("image/"));
                if (image && isHttps(url)) return url;
            }
        }
        for (SyndContent c : entry.getContents()) {
            String found = firstImage(c.getValue());
            if (found != null) return found;
        }
        return firstImage(html);
    }

    private static String firstImage(String html) {
        if (html == null || html.isBlank()) return null;
        var img = Jsoup.parseBodyFragment(html).selectFirst("img[src]");
        if (img == null) return null;
        String src = img.attr("src");
        return isHttps(src) ? src : null;
    }

    private static boolean isHttps(String url) {
        return url != null && url.startsWith("https://") && url.length() <= 500;
    }

    static String categorize(String text) {
        String t = text.toLowerCase(Locale.ROOT);
        if (containsAny(t, "battery", "batteries", "solid-state", "lithium", "lfp", "cathode", "gigafactory")) {
            return "Batteries";
        }
        if (containsAny(t, "charger", "charging", "supercharger", "charge point", "chargepoint", "grid", "v2g")) {
            return "Infrastructure";
        }
        if (containsAny(t, "subsidy", "subsidies", "tax credit", "policy", "regulation", "tariff", "government",
                "legislation", "emission", "ministry", "incentive", "ban ")) {
            return "Policy";
        }
        if (containsAny(t, "review", "first drive", "test drive", "hands-on", "road test", "tested")) {
            return "Reviews";
        }
        if (containsAny(t, "sales", "market share", "stock", "shares", "earnings", "revenue", "deliveries",
                "price cut", "registrations", "profit", "ipo", "investment")) {
            return "Market";
        }
        return "Technology";
    }

    private static boolean containsAny(String text, String... words) {
        for (String w : words) {
            if (text.contains(w)) return true;
        }
        return false;
    }

    private static String clean(String html) {
        if (html == null) return null;
        String text = Jsoup.parse(html).text().replaceAll("\\s+", " ").trim();
        return text.isEmpty() ? null : text;
    }

    private static String truncate(String s, int max) {
        if (s == null || s.length() <= max) return s;
        String cut = s.substring(0, max - 1);
        int space = cut.lastIndexOf(' ');
        if (space > max / 2) cut = cut.substring(0, space);
        return cut.stripTrailing() + "…";
    }

    private static String sha256(String value) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
