package com.swati.evtimebackend.controller;

import com.swati.evtimebackend.dto.FileUploadResponseDTO;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@RestController
public class FileUploadController {

    @PostMapping("/upload")
    public FileUploadResponseDTO uploadFile(
            @RequestParam("file")
            MultipartFile file)
            throws IOException {

        String uploadDir =
                System.getProperty("user.dir")
                        + "/uploads/";

        File directory = new File(uploadDir);

        if (!directory.exists()) {
            directory.mkdirs();
        }

        String filePath =
                uploadDir +
                        file.getOriginalFilename();

        file.transferTo(new File(filePath));

        String imageUrl =
                "http://localhost:8080/uploads/"
                        + file.getOriginalFilename();

        return new FileUploadResponseDTO(imageUrl);
    }
}