package com.swati.evtimebackend.dto;

public class FileUploadResponseDTO {

    private String imageUrl;

    public FileUploadResponseDTO(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}