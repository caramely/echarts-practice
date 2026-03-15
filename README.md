# 实时数据监控仪表板

基于Spring Boot + Vue.js + ECharts + WebSocket的实时数据监控系统，每秒更新在线人数、订单量、CPU和内存使用率等数据。

## 功能特性

- **后端实时数据生成**：使用Spring Boot ScheduledExecutorService每秒生成模拟数据
- **WebSocket实时推送**：通过SimpMessagingTemplate将数据推送到前端
- **前端实时展示**：Vue.js + ECharts实现动态图表更新
- **响应式设计**：适配不同屏幕尺寸的仪表板界面
- **连接状态指示**：实时显示WebSocket连接状态

## 系统架构

```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   Vue.js前端    │◄───────────────►│ Spring Boot后端 │
│   - ECharts图表  │                 │   - 定时任务    │
│   - WebSocket客户端│                 │   - WebSocket服务│
└─────────────────┘                 └─────────────────┘
```

## 项目结构

```
d:/space/java/code/local/echarts/
├── backend/                    # Spring Boot后端
│   ├── src/main/java/com/example/echarts/
│   │   ├── config/WebSocketConfig.java    # WebSocket配置
│   │   ├── controller/WebSocketController.java # WebSocket控制器
│   │   ├── model/RealTimeData.java        # 数据模型
│   │   └── EchartsApplication.java        # 主应用类
│   ├── src/main/resources/application.properties # 配置文件
│   └── pom.xml                            # Maven配置
├── frontend/                   # Vue.js前端
│   ├── index.html             # 主页面
│   ├── app.js                 # Vue.js应用逻辑
│   └── package.json           # 前端依赖配置
└── README.md                  # 本文档
```

## 快速开始

### 1. 启动后端服务

```bash
# 进入后端目录
cd backend

# 使用Maven编译和运行（需要Maven）
mvn clean spring-boot:run

# 或者直接运行Java应用（需要先编译）
mvn clean package
java -jar target/echarts-backend-1.0.0.jar
```

后端服务将在 http://localhost:8080 启动，WebSocket端点位于 ws://localhost:8080/ws

### 2. 启动前端应用

由于前端使用了CDN引入依赖，可以直接在浏览器中打开 `frontend/index.html` 文件。

或者使用简单的HTTP服务器：

```bash
# 使用Python启动HTTP服务器
python -m http.server 3000

# 或者使用Node.js的http-server
npx http-server frontend -p 3000
```

然后访问 http://localhost:3000

### 3. 查看实时数据

1. 打开前端页面后，系统会自动连接到WebSocket服务器
2. 连接成功后，右下角会显示"Connected to WebSocket Server"
3. 图表和数据将每秒自动更新
4. 可以观察到：
   - 在线用户数趋势图（100-500用户范围）
   - 订单数量趋势图（20-200订单范围）
   - CPU和内存使用率趋势图
   - 实时统计卡片显示当前数值

## 技术栈

### 后端
- **Spring Boot 2.7.18** - Java后端框架
- **Spring WebSocket** - WebSocket通信支持
- **Spring Scheduling** - 定时任务调度
- **Jackson** - JSON序列化/反序列化

### 前端
- **Vue.js 3** - 响应式前端框架
- **ECharts 5** - 数据可视化图表库
- **SockJS + WebStomp** - WebSocket客户端库
- **Element Plus** - UI组件库（CDN引入）

## 数据模型

```java
public class RealTimeData {
    private int onlineUsers;      // 在线用户数
    private int orderCount;       // 订单数量
    private double cpuUsage;      // CPU使用率（%）
    private double memoryUsage;   // 内存使用率（%）
    private String timestamp;     // 时间戳（HH:mm:ss格式）
}
```

## 配置说明

### 后端配置 (application.properties)
```properties
server.port=8080                    # 服务器端口
websocket.endpoint=/ws              # WebSocket端点
cors.allowed-origins=http://localhost:3000 # CORS允许的源
```

### 前端配置
- WebSocket连接地址：`ws://localhost:8080/ws`
- 数据订阅主题：`/topic/realtime-data`
- 数据请求端点：`/app/request-data`

## 扩展功能建议

1. **数据持久化**：添加数据库存储历史数据
2. **用户认证**：添加WebSocket连接认证
3. **多图表类型**：支持柱状图、饼图等更多图表类型
4. **数据导出**：支持将数据导出为CSV或Excel
5. **告警功能**：设置阈值，超过时发送通知
6. **多数据源**：连接真实的数据源而非模拟数据

## 故障排除

### 常见问题

1. **WebSocket连接失败**
   - 检查后端服务是否正常运行
   - 检查端口8080是否被占用
   - 查看浏览器控制台错误信息

2. **图表不显示**
   - 检查ECharts库是否成功加载
   - 检查浏览器控制台是否有JavaScript错误
   - 确保div容器尺寸正确

3. **数据不更新**
   - 检查WebSocket连接状态
   - 查看后端控制台是否有数据推送日志
   - 检查网络连接

### 日志查看

后端日志会显示每秒推送的数据：
```
Sent real-time data: RealTimeData{onlineUsers=156, orderCount=73, cpuUsage=52.34, memoryUsage=61.78, timestamp='14:30:25'}
```

## 许可证

本项目仅供学习和演示使用。