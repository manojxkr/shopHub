package com.book.BookStore.realtime;

import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.book.BookStore.DTO.OrderResponseDTO;

@Component
public class OrderRealtimePublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public OrderRealtimePublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @SuppressWarnings("null")
    public void publishOrderEvent(String event, OrderResponseDTO order) {
        messagingTemplate.convertAndSend("/topic/orders",
                (Object) Map.of("event", event, "order", order != null ? order : Map.of()));
    }
}
