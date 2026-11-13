package com.swati.evtimebackend;

import com.swati.evtimebackend.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UploadIntegrationTest {

    private static final byte[] PNG = {
            (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0x0D, 'I', 'H', 'D', 'R'};

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    private String editor() {
        return "Bearer " + jwtUtil.generateToken("editor@example.com", "EDITOR");
    }

    @Test
    void anonymousUploadIsRejected() throws Exception {
        mockMvc.perform(multipart("/api/uploads")
                        .file(new MockMultipartFile("file", "a.png", "image/png", PNG)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void regularUserCannotUpload() throws Exception {
        mockMvc.perform(multipart("/api/uploads")
                        .file(new MockMultipartFile("file", "a.png", "image/png", PNG))
                        .header("Authorization", "Bearer " + jwtUtil.generateToken("u@example.com", "USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void validImageIsStoredUnderRandomNameAndServed() throws Exception {
        String json = mockMvc.perform(multipart("/api/uploads")
                        .file(new MockMultipartFile("file", "../../evil name.png", "image/png", PNG))
                        .header("Authorization", editor()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl", endsWith(".png")))
                .andExpect(jsonPath("$.imageUrl", not(containsString("evil"))))
                .andExpect(jsonPath("$.imageUrl", not(containsString(".."))))
                .andReturn().getResponse().getContentAsString();

        String url = json.replaceAll(".*\"imageUrl\":\"([^\"]+)\".*", "$1");
        String path = url.substring(url.indexOf("/uploads/"));

        mockMvc.perform(get(path)).andExpect(status().isOk());
    }

    @Test
    void textFileDisguisedAsImageIsRejected() throws Exception {
        mockMvc.perform(multipart("/api/uploads")
                        .file(new MockMultipartFile("file", "shell.png", "image/png",
                                "<?php echo 1; ?>".getBytes()))
                        .header("Authorization", editor()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void svgIsRejected() throws Exception {
        mockMvc.perform(multipart("/api/uploads")
                        .file(new MockMultipartFile("file", "x.svg", "image/svg+xml",
                                "<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>".getBytes()))
                        .header("Authorization", editor()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void emptyFileIsRejected() throws Exception {
        mockMvc.perform(multipart("/api/uploads")
                        .file(new MockMultipartFile("file", "a.png", "image/png", new byte[0]))
                        .header("Authorization", editor()))
                .andExpect(status().isBadRequest());
    }
}
