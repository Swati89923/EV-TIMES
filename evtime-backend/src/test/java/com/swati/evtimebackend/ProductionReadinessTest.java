package com.swati.evtimebackend;

import com.swati.evtimebackend.entity.News;
import com.swati.evtimebackend.repository.NewsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProductionReadinessTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NewsRepository newsRepository;

    private Long ownId;
    private Long importedId;

    @BeforeEach
    void seed() {
        News own = new News();
        own.setTitle("Own story <script>alert(1)</script> & more");
        own.setDescription("Desc with \"quotes\" and <b>tags</b>");
        own.setCategory("Technology");
        own.setImageUrl("https://img.example.com/a.jpg");
        ownId = newsRepository.save(own).getId();

        News imported = new News();
        imported.setTitle("Imported seoimported story");
        imported.setDescription("Summary");
        imported.setCategory("Market");
        imported.setExternalId("seo-" + System.nanoTime());
        imported.setSourceName("Wire");
        imported.setSourceUrl("https://wire.example.com/x");
        importedId = newsRepository.save(imported).getId();
    }

    @Test
    void sitemapListsOwnArticlesButNotImportedSummaries() throws Exception {
        String xml = mockMvc.perform(get("/sitemap.xml"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", containsString("max-age")))
                .andReturn().getResponse().getContentAsString();

        org.junit.jupiter.api.Assertions.assertTrue(xml.contains("https://evtimes.example/news/" + ownId));
        org.junit.jupiter.api.Assertions.assertFalse(xml.contains("/news/" + importedId + "<"));
        org.junit.jupiter.api.Assertions.assertTrue(xml.contains("https://evtimes.example/category/Batteries"));
    }

    @Test
    void rssFeedEscapesContentAndLinksToTheSite() throws Exception {
        mockMvc.perform(get("/rss.xml"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<rss version=\"2.0\">")))
                .andExpect(content().string(containsString("&lt;script&gt;")))
                .andExpect(content().string(not(containsString("<script>"))))
                .andExpect(content().string(containsString("https://evtimes.example/news/" + ownId)));
    }

    @Test
    void sharePageHasEscapedOpenGraphTagsAndRedirectsPeopleToTheArticle() throws Exception {
        mockMvc.perform(get("/share/news/" + ownId))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("property=\"og:title\"")))
                .andExpect(content().string(containsString("og:image\" content=\"https://img.example.com/a.jpg")))
                .andExpect(content().string(containsString("url=https://evtimes.example/news/" + ownId)))
                .andExpect(content().string(not(containsString("<script>"))))
                .andExpect(content().string(containsString("&quot;quotes&quot;")));

        mockMvc.perform(get("/share/news/999999")).andExpect(status().isNotFound());
    }

    @Test
    void listEndpointsAreCacheableAndSecurityHeadersArePresent() throws Exception {
        mockMvc.perform(get("/api/news"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", containsString("public")))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"));

        // single article reads are never cached so view counts stay correct
        mockMvc.perform(get("/api/news/" + ownId))
                .andExpect(header().string("Cache-Control", not(containsString("public"))));
    }
}
