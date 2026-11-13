package com.swati.evtimebackend.contact;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@Tag(name = "Contact")
public class ContactController {

    public record SubscribeRequest(
            @NotBlank(message = "Email cannot be empty")
            @Email(message = "Invalid email format")
            @Size(max = 190, message = "Email must be at most 190 characters")
            String email) {
    }

    public record ContactRequest(
            @NotBlank(message = "Please tell us your name")
            @Size(max = 100, message = "Name must be at most 100 characters")
            String name,

            @NotBlank(message = "Email cannot be empty")
            @Email(message = "Invalid email format")
            @Size(max = 190, message = "Email must be at most 190 characters")
            String email,

            @NotBlank(message = "Message cannot be empty")
            @Size(min = 10, max = 3000, message = "Message must be between 10 and 3000 characters")
            String message) {
    }

    private final SubscriberRepository subscribers;
    private final ContactMessageRepository messages;

    public ContactController(SubscriberRepository subscribers, ContactMessageRepository messages) {
        this.subscribers = subscribers;
        this.messages = messages;
    }

    @Operation(summary = "Subscribe to the newsletter (idempotent)")
    @PostMapping("/api/newsletter/subscribe")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> subscribe(@Valid @RequestBody SubscribeRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (!subscribers.existsByEmail(email)) {
            Subscriber s = new Subscriber();
            s.setEmail(email);
            try {
                subscribers.save(s);
            } catch (DataIntegrityViolationException ignored) {
                // already subscribed by a parallel request
            }
        }
        // same answer whether or not the address was already known
        return Map.of("message", "You are on the list.");
    }

    @Operation(summary = "Send a message to the team")
    @PostMapping("/api/contact")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> contact(@Valid @RequestBody ContactRequest request) {
        ContactMessage m = new ContactMessage();
        m.setName(request.name().trim());
        m.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        m.setMessage(request.message().trim());
        messages.save(m);
        return Map.of("message", "Thanks for reaching out.");
    }

    @Operation(summary = "Newsletter subscribers, newest first (ADMIN)")
    @GetMapping("/api/admin/subscribers")
    public List<Subscriber> listSubscribers() {
        return subscribers.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 1000));
    }

    @Operation(summary = "Contact messages, newest first (ADMIN)")
    @GetMapping("/api/admin/messages")
    public List<ContactMessage> listMessages() {
        return messages.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 500));
    }
}
