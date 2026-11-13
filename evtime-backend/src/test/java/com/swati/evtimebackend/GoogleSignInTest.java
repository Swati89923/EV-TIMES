package com.swati.evtimebackend;

import com.swati.evtimebackend.exception.ApiException;
import com.swati.evtimebackend.security.GoogleIdentity;
import com.swati.evtimebackend.security.GoogleTokenVerifier;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyString;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class GoogleSignInTest {

    @MockitoBean
    private GoogleTokenVerifier verifier;

    @Autowired
    private MockMvc mockMvc;

    private static String body(String credential) {
        return "{\"credential\":\"" + credential + "\"}";
    }

    @Test
    void newGoogleUserGetsAnAccountAndToken() throws Exception {
        when(verifier.verify("good-new")).thenReturn(
                new GoogleIdentity("New.Person@Gmail.com", "New Person", "https://lh3.googleusercontent.com/a/x"));

        mockMvc.perform(post("/api/auth/google").contentType(MediaType.APPLICATION_JSON).content(body("good-new")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", not(emptyString())))
                .andExpect(jsonPath("$.email").value("new.person@gmail.com"))
                .andExpect(jsonPath("$.name").value("New Person"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.picture").value("https://lh3.googleusercontent.com/a/x"));
    }

    @Test
    void googleSignInLinksAnExistingPasswordAccountWithTheSameEmail() throws Exception {
        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Linked\",\"email\":\"linked@gmail.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isCreated());
        when(verifier.verify("good-linked")).thenReturn(
                new GoogleIdentity("linked@gmail.com", "Linked G", null));

        mockMvc.perform(post("/api/auth/google").contentType(MediaType.APPLICATION_JSON).content(body("good-linked")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Linked"));

        // the original password still works
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"linked@gmail.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void googleOnlyAccountCannotBeEnteredWithAGuessedPassword() throws Exception {
        when(verifier.verify("good-g")).thenReturn(new GoogleIdentity("gonly@gmail.com", "G Only", null));
        mockMvc.perform(post("/api/auth/google").contentType(MediaType.APPLICATION_JSON).content(body("good-g")))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"gonly@gmail.com\",\"password\":\"password\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidTokenIsRejectedWith401() throws Exception {
        when(verifier.verify(anyString())).thenThrow(
                new ApiException(HttpStatus.UNAUTHORIZED, "Google sign-in failed. Please try again."));

        mockMvc.perform(post("/api/auth/google").contentType(MediaType.APPLICATION_JSON).content(body("forged")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void blankCredentialIsABadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/google").contentType(MediaType.APPLICATION_JSON).content(body("")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void configEndpointHidesGoogleWhenNotConfigured() throws Exception {
        when(verifier.isConfigured()).thenReturn(false);
        mockMvc.perform(get("/api/auth/config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.googleClientId").doesNotExist());
    }
}
