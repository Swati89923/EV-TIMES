package com.swati.evtimebackend;

import com.swati.evtimebackend.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    private static final String ARTICLE = """
            {"title":"Test headline","description":"Short summary","category":"Technology"}
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    private String bearer(String role) {
        return "Bearer " + jwtUtil.generateToken("someone@example.com", role);
    }

    @Test
    void publicCanReadNews() throws Exception {
        mockMvc.perform(get("/api/news")).andExpect(status().isOk());
    }

    @Test
    void anonymousCannotCreateNews() throws Exception {
        mockMvc.perform(post("/api/news")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ARTICLE))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void regularUserCannotCreateNews() throws Exception {
        mockMvc.perform(post("/api/news")
                        .header("Authorization", bearer("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ARTICLE))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void anonymousCannotDeleteNews() throws Exception {
        mockMvc.perform(delete("/api/news/1")).andExpect(status().isUnauthorized());
    }

    @Test
    void editorCanCreateNews() throws Exception {
        mockMvc.perform(post("/api/news")
                        .header("Authorization", bearer("EDITOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ARTICLE))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void tamperedTokenIsRejected() throws Exception {
        mockMvc.perform(delete("/api/news/1")
                        .header("Authorization", bearer("ADMIN") + "x"))
                .andExpect(status().isUnauthorized());
    }
}
