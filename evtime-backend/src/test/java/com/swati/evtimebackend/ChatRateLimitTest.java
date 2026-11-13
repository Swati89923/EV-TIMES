package com.swati.evtimebackend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.chat.rate-limit=2")
@AutoConfigureMockMvc
class ChatRateLimitTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void thirdRequestWithinTheWindowIsRejected() throws Exception {
        String ask = "{\"messages\":[{\"role\":\"user\",\"content\":\"hello there\"}]}";
        for (int i = 0; i < 2; i++) {
            mockMvc.perform(post("/api/chat").contentType(MediaType.APPLICATION_JSON).content(ask))
                    .andExpect(status().isOk());
        }
        mockMvc.perform(post("/api/chat").contentType(MediaType.APPLICATION_JSON).content(ask))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429));
    }
}
