package com.swati.evtimebackend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.swati.evtimebackend.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class NewsApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper mapper;

    private String admin() {
        return "Bearer " + jwtUtil.generateToken("admin@example.com", "ADMIN");
    }

    private long createArticle(String title, String category, boolean featured) throws Exception {
        String body = """
                {"title":"%s","description":"Summary of %s","content":"Para one.\\n\\nPara two.",
                 "category":"%s","author":"Desk","featured":%s}
                """.formatted(title, title, category, featured);
        String json = mockMvc.perform(post("/api/news")
                        .header("Authorization", admin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        JsonNode node = mapper.readTree(json);
        return node.get("id").asLong();
    }

    @Test
    void createdArticleHasTimestampsAndCanBeFetched() throws Exception {
        long id = createArticle("Fetch me headline", "Technology", false);

        mockMvc.perform(get("/api/news/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Fetch me headline"))
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.content", containsString("Para one")));
    }

    @Test
    void readingAnArticleCountsViews() throws Exception {
        long id = createArticle("Counted headline", "Technology", false);

        mockMvc.perform(get("/api/news/" + id)).andExpect(jsonPath("$.views").value(1));
        mockMvc.perform(get("/api/news/" + id)).andExpect(jsonPath("$.views").value(2));
    }

    @Test
    void missingArticleReturns404() throws Exception {
        mockMvc.perform(get("/api/news/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void listFiltersByCategoryAndSearchTerm() throws Exception {
        createArticle("Zebra charger rollout", "Infrastructure", false);
        createArticle("Zebra battery update", "Batteries", false);

        mockMvc.perform(get("/api/news").param("q", "zebra"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));

        mockMvc.perform(get("/api/news").param("q", "zebra").param("category", "batteries"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].category").value("Batteries"));
    }

    @Test
    void searchTreatsWildcardsLiterally() throws Exception {
        createArticle("Plain wildcard test", "Market", false);

        mockMvc.perform(get("/api/news").param("q", "%"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void invalidSortFieldFallsBackAndPageSizeIsCapped() throws Exception {
        mockMvc.perform(get("/api/news")
                        .param("sortBy", "password; drop table news")
                        .param("size", "100000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(50));
    }

    @Test
    void featuredAndCategoriesAndRelatedEndpointsWork() throws Exception {
        long first = createArticle("Related one", "Policy", true);
        createArticle("Related two", "Policy", false);

        mockMvc.perform(get("/api/news/featured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].title", hasItem("Related one")));

        mockMvc.perform(get("/api/news/categories"))
                .andExpect(jsonPath("$", hasItem("Policy")));

        mockMvc.perform(get("/api/news/" + first + "/related"))
                .andExpect(jsonPath("$[*].title", hasItem("Related two")))
                .andExpect(jsonPath("$[*].title", not(hasItem("Related one"))));

        mockMvc.perform(get("/api/news/trending")).andExpect(status().isOk());
    }

    @Test
    void updateIsValidatedAndApplied() throws Exception {
        long id = createArticle("Before edit", "Technology", false);

        mockMvc.perform(put("/api/news/" + id)
                        .header("Authorization", admin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"\",\"description\":\"x\",\"category\":\"Technology\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").exists());

        mockMvc.perform(put("/api/news/" + id)
                        .header("Authorization", admin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"After edit\",\"description\":\"New\",\"category\":\"Technology\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("After edit"));
    }

    @Test
    void deleteRemovesArticleAndItsBookmarks() throws Exception {
        long id = createArticle("To be deleted", "Market", false);

        String signup = mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Reader\",\"email\":\"reader-del@example.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String userAuth = "Bearer " + mapper.readTree(signup).get("token").asText();

        mockMvc.perform(post("/api/bookmarks/" + id).header("Authorization", userAuth))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/news/" + id).header("Authorization", admin()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/news/" + id)).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/bookmarks/ids").header("Authorization", userAuth))
                .andExpect(jsonPath("$", not(hasItem((int) id))));
    }

    @Test
    void bookmarkFlowIsIdempotentAndPerUser() throws Exception {
        long id = createArticle("Bookmark me", "Reviews", false);

        String signup = mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Fan\",\"email\":\"fan-bm@example.com\",\"password\":\"secret123\"}"))
                .andReturn().getResponse().getContentAsString();
        String auth = "Bearer " + mapper.readTree(signup).get("token").asText();

        mockMvc.perform(get("/api/bookmarks")).andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/bookmarks/" + id).header("Authorization", auth))
                .andExpect(status().isNoContent());
        mockMvc.perform(post("/api/bookmarks/" + id).header("Authorization", auth))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/bookmarks").header("Authorization", auth))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Bookmark me"));

        mockMvc.perform(delete("/api/bookmarks/" + id).header("Authorization", auth))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/bookmarks/ids").header("Authorization", auth))
                .andExpect(jsonPath("$", hasSize(0)));

        mockMvc.perform(post("/api/bookmarks/999999").header("Authorization", auth))
                .andExpect(status().isNotFound());
    }
}
