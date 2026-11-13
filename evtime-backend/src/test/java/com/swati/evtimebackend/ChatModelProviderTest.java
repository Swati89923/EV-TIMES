package com.swati.evtimebackend;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ChatModelProviderTest {

    private static final AtomicReference<Integer> providerStatus = new AtomicReference<>(200);
    private static final AtomicReference<String> lastRequest = new AtomicReference<>();
    private static final HttpServer provider = startProvider();

    private static HttpServer startProvider() {
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            server.createContext("/v1/chat/completions", exchange -> {
                lastRequest.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8)
                        + "\nAUTH=" + exchange.getRequestHeaders().getFirst("Authorization"));
                int code = providerStatus.get();
                byte[] out = (code == 200
                        ? "{\"choices\":[{\"message\":{\"role\":\"assistant\",\"content\":\"Model says hello\"}}]}"
                        : "{\"error\":\"boom\"}").getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.sendResponseHeaders(code, out.length);
                exchange.getResponseBody().write(out);
                exchange.close();
            });
            server.start();
            return server;
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("app.ai.base-url", () -> "http://127.0.0.1:" + provider.getAddress().getPort() + "/v1");
        registry.add("app.ai.api-key", () -> "test-key");
        registry.add("app.ai.model", () -> "test-model");
    }

    @AfterAll
    static void stop() {
        provider.stop(0);
    }

    @Autowired
    private MockMvc mockMvc;

    private static final String ASK = "{\"messages\":[{\"role\":\"user\",\"content\":\"What is a battery?\"}]}";

    @Test
    void usesTheConfiguredModelAndSendsKeyOnlyToTheProvider() throws Exception {
        providerStatus.set(200);
        mockMvc.perform(post("/api/chat").contentType(MediaType.APPLICATION_JSON).content(ASK))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mode").value("ai"))
                .andExpect(jsonPath("$.reply").value("Model says hello"));

        String sent = lastRequest.get();
        assertTrue(sent.contains("\"model\":\"test-model\""));
        assertTrue(sent.contains("AUTH=Bearer test-key"));
        assertTrue(sent.contains("EV Assistant"));
    }

    @Test
    void fallsBackToBuiltInAnswerWhenTheProviderFails() throws Exception {
        providerStatus.set(500);
        mockMvc.perform(post("/api/chat").contentType(MediaType.APPLICATION_JSON).content(ASK))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mode").value("basic"))
                .andExpect(jsonPath("$.reply", containsString("EV Times")));
        providerStatus.set(200);
    }
}
