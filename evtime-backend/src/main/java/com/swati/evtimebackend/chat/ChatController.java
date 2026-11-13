package com.swati.evtimebackend.chat;

import com.swati.evtimebackend.chat.ChatDtos.ChatRequest;
import com.swati.evtimebackend.chat.ChatDtos.ChatResponse;
import com.swati.evtimebackend.exception.ApiException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@Tag(name = "Chat")
public class ChatController {

    private final ChatService chatService;
    private final RateLimiter rateLimiter;

    public ChatController(ChatService chatService,
                          @org.springframework.beans.factory.annotation.Qualifier("chatRateLimiter") RateLimiter rateLimiter) {
        this.chatService = chatService;
        this.rateLimiter = rateLimiter;
    }

    @Operation(summary = "Ask the EV assistant (public, rate limited)")
    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest request, HttpServletRequest http) {
        if (!rateLimiter.tryAcquire(http.getRemoteAddr())) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "You are sending messages too quickly. Please wait a few minutes and try again.");
        }
        return chatService.reply(request.messages());
    }
}
