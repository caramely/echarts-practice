package com.example.echarts.controller;

import com.example.echarts.model.RealTimeData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Random;

@Controller
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final Random random = new Random();
    private final AtomicInteger onlineUsers = new AtomicInteger(100);
    private final AtomicInteger orderCount = new AtomicInteger(50);
    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);

    @Autowired
    public WebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 定时推送实时数据到前端
     * 每秒执行一次
     */
    @Scheduled(fixedRate = 1000)
    public void sendRealTimeData() {
        try {
            // 模拟数据变化
            int currentOnlineUsers = onlineUsers.addAndGet(random.nextInt(10) - 5); // -5到+5的随机变化
            if (currentOnlineUsers < 50) onlineUsers.set(50);
            if (currentOnlineUsers > 500) onlineUsers.set(500);

            int currentOrderCount = orderCount.addAndGet(random.nextInt(8) - 4); // -4到+4的随机变化
            if (currentOrderCount < 20) orderCount.set(20);
            if (currentOrderCount > 200) orderCount.set(200);

            double cpuUsage = 30 + random.nextDouble() * 40; // 30-70%
            double memoryUsage = 40 + random.nextDouble() * 30; // 40-70%

            RealTimeData data = new RealTimeData(onlineUsers.get(), orderCount.get(), cpuUsage, memoryUsage);

            // 发送到/topic/realtime-data频道
            messagingTemplate.convertAndSend("/topic/realtime-data", data);

            logger.debug("Sent real-time data: {}", data);
        } catch (Exception e) {
            logger.error("Error sending real-time data", e);
        }
    }

    /**
     * 处理客户端发送的消息
     */
    @MessageMapping("/request-data")
    @SendTo("/topic/realtime-data")
    public RealTimeData handleRequest() {
        try {
            // 验证请求
            if (onlineUsers == null || orderCount == null) {
                throw new IllegalArgumentException("Internal server error: State not initialized");
            }

            // 当客户端请求数据时，返回当前数据
            double cpuUsage = 30 + random.nextDouble() * 40;
            double memoryUsage = 40 + random.nextDouble() * 30;

            RealTimeData data = new RealTimeData(onlineUsers.get(), orderCount.get(), cpuUsage, memoryUsage);

            // 验证响应数据
            validateRealTimeData(data);

            return data;
        } catch (Exception e) {
            logger.error("Error handling request data", e);
            throw new RuntimeException("Failed to process request", e);
        }
    }

    /**
     * 验证RealTimeData对象
     */
    private void validateRealTimeData(RealTimeData data) {
        if (data.getOnlineUsers() < 50 || data.getOnlineUsers() > 500) {
            throw new IllegalArgumentException("Online users out of valid range: " + data.getOnlineUsers());
        }
        if (data.getOrderCount() < 20 || data.getOrderCount() > 200) {
            throw new IllegalArgumentException("Order count out of valid range: " + data.getOrderCount());
        }
        if (data.getCpuUsage() < 30.0 || data.getCpuUsage() > 70.0) {
            throw new IllegalArgumentException("CPU usage out of valid range: " + data.getCpuUsage());
        }
        if (data.getMemoryUsage() < 40.0 || data.getMemoryUsage() > 70.0) {
            throw new IllegalArgumentException("Memory usage out of valid range: " + data.getMemoryUsage());
        }
    }
}