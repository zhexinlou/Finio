package com.finio.model;

public class ChatResponse {
    private String type;
    private String message;
    private String filePath;

    public ChatResponse() {}
    public ChatResponse(String type, String message, String filePath) {
        this.type = type;
        this.message = message;
        this.filePath = filePath;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
}
