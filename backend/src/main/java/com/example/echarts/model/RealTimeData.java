package com.example.echarts.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class RealTimeData {
    @NotNull
    @Min(50)
    @Max(500)
    private int onlineUsers;

    @NotNull
    @Min(20)
    @Max(200)
    private int orderCount;

    @NotNull
    @Min(30.0)
    @Max(70.0)
    private double cpuUsage;

    @NotNull
    @Min(40.0)
    @Max(70.0)
    private double memoryUsage;

    @NotNull
    private String timestamp;

    public RealTimeData() {
        this.timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    }

    public RealTimeData(int onlineUsers, int orderCount, double cpuUsage, double memoryUsage) {
        this.onlineUsers = onlineUsers;
        this.orderCount = orderCount;
        this.cpuUsage = cpuUsage;
        this.memoryUsage = memoryUsage;
        this.timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    }

    // Getters and Setters
    public int getOnlineUsers() {
        return onlineUsers;
    }

    public void setOnlineUsers(int onlineUsers) {
        this.onlineUsers = onlineUsers;
    }

    public int getOrderCount() {
        return orderCount;
    }

    public void setOrderCount(int orderCount) {
        this.orderCount = orderCount;
    }

    public double getCpuUsage() {
        return cpuUsage;
    }

    public void setCpuUsage(double cpuUsage) {
        this.cpuUsage = cpuUsage;
    }

    public double getMemoryUsage() {
        return memoryUsage;
    }

    public void setMemoryUsage(double memoryUsage) {
        this.memoryUsage = memoryUsage;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "RealTimeData{" +
                "onlineUsers=" + onlineUsers +
                ", orderCount=" + orderCount +
                ", cpuUsage=" + cpuUsage +
                ", memoryUsage=" + memoryUsage +
                ", timestamp='" + timestamp + '\'' +
                '}';
    }
}