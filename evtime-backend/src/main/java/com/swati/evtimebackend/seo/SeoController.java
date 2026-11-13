package com.swati.evtimebackend.seo;

import com.swati.evtimebackend.entity.News;
import com.swati.evtimebackend.exception.ResourceNotFoundException;
import com.swati.evtimebackend.repository.NewsRepository;
import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

/** Sitemap, RSS feed and Open Graph share pages. */
@RestController
@Hidden
public class SeoController {

    private static final List<String> STATIC_PATHS = List.of("/", "/about", "/contact", "/privacy", "/terms");
    private static final List<String> CATEGORIES = List.of(
            "Batteries", "Infrastructure", "Market", "Policy", "Reviews", "Technology");

    private final NewsRepository newsRepository;
    private final String frontendUrl;

    public SeoController(
            NewsRepository newsRepository,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.newsRepository = newsRepository;
        this.frontendUrl = frontendUrl.trim().replaceAll("/+$", "");
    }

    /** Only our own articles are listed: imported stories are summaries that link to the publisher. */
    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemap() {
        StringBuilder xml = new StringBuilder(
                "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        for (String path : STATIC_PATHS) {
            xml.append("  <url><loc>").append(esc(frontendUrl + path)).append("</loc></url>\n");
        }
        for (String c : CATEGORIES) {
            xml.append("  <url><loc>").append(esc(frontendUrl + "/category/" + c)).append("</loc></url>\n");
        }
        for (News n : newsRepository.findOriginalArticles(PageRequest.of(0, 1000))) {
            xml.append("  <url><loc>").append(esc(frontendUrl + "/news/" + n.getId())).append("</loc>");
            Instant last = n.getUpdatedAt() != null ? n.getUpdatedAt() : n.getCreatedAt();
            if (last != null) {
                xml.append("<lastmod>").append(last.toString(), 0, 10).append("</lastmod>");
            }
            xml.append("</url>\n");
        }
        return xml.append("</urlset>\n").toString();
    }

    @GetMapping(value = "/rss.xml", produces = "application/rss+xml")
    public String rss() {
        StringBuilder xml = new StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
                .append("<rss version=\"2.0\"><channel>\n")
                .append("<title>EV Times</title>\n")
                .append("<link>").append(esc(frontendUrl)).append("</link>\n")
                .append("<description>Latest electric vehicle news</description>\n")
                .append("<language>en</language>\n");
        for (News n : newsRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 50))) {
            xml.append("<item>")
                    .append("<title>").append(esc(n.getTitle())).append("</title>")
                    .append("<link>").append(esc(frontendUrl + "/news/" + n.getId())).append("</link>")
                    .append("<guid isPermaLink=\"true\">").append(esc(frontendUrl + "/news/" + n.getId())).append("</guid>")
                    .append("<description>").append(esc(n.getDescription())).append("</description>")
                    .append("<category>").append(esc(n.getCategory())).append("</category>");
            if (n.getCreatedAt() != null) {
                xml.append("<pubDate>")
                        .append(DateTimeFormatter.RFC_1123_DATE_TIME.format(n.getCreatedAt().atOffset(ZoneOffset.UTC)))
                        .append("</pubDate>");
            }
            if (n.getSourceName() != null) {
                xml.append("<source url=\"").append(esc(n.getSourceUrl())).append("\">")
                        .append(esc(n.getSourceName())).append("</source>");
            }
            xml.append("</item>\n");
        }
        return xml.append("</channel></rss>\n").toString();
    }

    /**
     * Link-preview page for social networks: crawlers read the Open Graph tags,
     * people are sent on to the real article page.
     */
    @GetMapping(value = "/share/news/{id}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> share(@PathVariable Long id) {
        News n = newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News not found with id " + id));
        String target = frontendUrl + "/news/" + n.getId();
        String title = attr(n.getTitle());
        String description = attr(n.getDescription());

        StringBuilder html = new StringBuilder("<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">")
                .append("<title>").append(title).append(" | EV Times</title>")
                .append("<meta name=\"description\" content=\"").append(description).append("\">")
                .append("<link rel=\"canonical\" href=\"").append(attr(target)).append("\">")
                .append("<meta property=\"og:type\" content=\"article\">")
                .append("<meta property=\"og:site_name\" content=\"EV Times\">")
                .append("<meta property=\"og:title\" content=\"").append(title).append("\">")
                .append("<meta property=\"og:description\" content=\"").append(description).append("\">")
                .append("<meta property=\"og:url\" content=\"").append(attr(target)).append("\">");
        if (n.getImageUrl() != null) {
            html.append("<meta property=\"og:image\" content=\"").append(attr(n.getImageUrl())).append("\">");
        }
        html.append("<meta name=\"twitter:card\" content=\"summary_large_image\">")
                .append("<meta name=\"twitter:title\" content=\"").append(title).append("\">")
                .append("<meta name=\"twitter:description\" content=\"").append(description).append("\">");
        if (n.getImageUrl() != null) {
            html.append("<meta name=\"twitter:image\" content=\"").append(attr(n.getImageUrl())).append("\">");
        }
        html.append("<meta http-equiv=\"refresh\" content=\"0;url=").append(attr(target)).append("\">")
                .append("</head><body><p><a href=\"").append(attr(target)).append("\">")
                .append(title).append("</a></p></body></html>");

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(10)).cachePublic())
                .contentType(MediaType.TEXT_HTML)
                .body(html.toString());
    }

    private static String esc(String s) {
        return s == null ? "" : HtmlUtils.htmlEscape(s, "UTF-8");
    }

    private static String attr(String s) {
        return esc(s);
    }
}
