package com.swati.evtimebackend;

import com.swati.evtimebackend.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ContactFormsTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    private String admin() {
        return "Bearer " + jwtUtil.generateToken("admin@example.com", "ADMIN");
    }

    @Test
    void subscribingIsIdempotentAndListedForAdminsOnly() throws Exception {
        String body = "{\"email\":\"Reader.One@Example.com\"}";
        for (int i = 0; i < 2; i++) {
            mockMvc.perform(post("/api/newsletter/subscribe").contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message").value("You are on the list."));
        }

        mockMvc.perform(get("/api/admin/subscribers")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/admin/subscribers")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken("u@example.com", "USER")))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/subscribers").header("Authorization", admin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email=='reader.one@example.com')]", hasSize(1)));
    }

    @Test
    void invalidSubscriptionIsRejected() throws Exception {
        mockMvc.perform(post("/api/newsletter/subscribe").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"nope\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    void contactMessageIsStoredAndVisibleToAdmins() throws Exception {
        mockMvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Asha\",\"email\":\"asha@example.com\",\"message\":\"I have a story tip about charging.\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/admin/messages").header("Authorization", admin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].message", hasItem("I have a story tip about charging.")));
    }

    @Test
    void shortOrIncompleteContactMessageIsRejected() throws Exception {
        mockMvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"email\":\"x@example.com\",\"message\":\"hi\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.errors.message").exists());
    }
}
