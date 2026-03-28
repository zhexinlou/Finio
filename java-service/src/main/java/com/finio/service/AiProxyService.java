package com.finio.service;

import com.finio.model.ChatRequest;
import com.finio.model.ChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class AiProxyService {

    private final WebClient webClient;

    @Value("${finio.warehouse.path}")
    private String warehousePath;

    public AiProxyService(@Value("${finio.python.service.url}") String pythonServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(pythonServiceUrl)
                .build();
    }

    public ChatResponse chat(ChatRequest request) {
        return webClient.post()
                .uri("/chat")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(ChatResponse.class)
                .timeout(Duration.ofSeconds(60))
                .block();
    }

    public void indexFile(String absolutePath) {
        Map<String, String> body = new HashMap<>();
        body.put("file_path", absolutePath);

        webClient.post()
                .uri("/index")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(30))
                .block();
    }

    public void removeIndex(String relPath) {
        try {
            Map<String, String> body = new HashMap<>();
            body.put("rel_path", relPath);
            webClient.post()
                    .uri("/index/remove")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception e) {
            System.err.println("Remove index error: " + e.getMessage());
        }
    }
}
