package com.swati.evtimebackend.chat;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public final class ChatDtos {

    private ChatDtos() {
    }

    public record ChatMessage(
            @NotBlank(message = "Message role is required")
            @Pattern(regexp = "user|assistant", message = "Role must be 'user' or 'assistant'")
            String role,

            @NotBlank(message = "Message cannot be empty")
            @Size(max = 1000, message = "Message must be at most 1000 characters")
            String content) {
    }

    public record ChatRequest(
            @NotEmpty(message = "At least one message is required")
            @Size(max = 30, message = "Too many messages")
            List<@Valid ChatMessage> messages) {
    }

    public record Source(Long id, String title, String sourceName) {
    }

    /** mode is "ai" when a language model answered, "basic" for the built-in fallback. */
    public record ChatResponse(String reply, List<Source> sources, String mode) {
    }
}
