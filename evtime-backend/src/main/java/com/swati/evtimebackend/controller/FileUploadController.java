package com.swati.evtimebackend.controller;

import com.swati.evtimebackend.dto.FileUploadResponseDTO;
import com.swati.evtimebackend.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@Tag(name = "Uploads")
public class FileUploadController {

    private final FileStorageService storage;
    private final String publicBaseUrl;

    public FileUploadController(
            FileStorageService storage,
            @Value("${app.upload.public-base-url:}") String publicBaseUrl) {
        this.storage = storage;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    @Operation(summary = "Upload an article image (ADMIN / EDITOR)")
    @PostMapping("/api/uploads")
    public FileUploadResponseDTO upload(@RequestParam("file") MultipartFile file) {
        String name = storage.store(file);

        String base = publicBaseUrl.isEmpty()
                ? ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString()
                : publicBaseUrl;

        return new FileUploadResponseDTO(base + "/uploads/" + name);
    }
}
