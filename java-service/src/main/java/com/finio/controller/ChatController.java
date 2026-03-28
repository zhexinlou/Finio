package com.finio.controller;

import com.finio.model.ChatRequest;
import com.finio.model.ChatResponse;
import com.finio.service.AiProxyService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final AiProxyService aiProxyService;

    public ChatController(AiProxyService aiProxyService) {
        this.aiProxyService = aiProxyService;
    }

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        return aiProxyService.chat(request);
    }
}
