                                                                                                                                           10# CLAUDE.md

## Project Overview

This is a real-time data monitoring dashboard that displays live metrics for online users, order counts, and system resources (CPU/memory usage). The project consists of:

- **Backend**: Spring Boot application with WebSocket support for real-time data pushing
- **Frontend**: Vue.js application with ECharts for data visualization

The dashboard updates every second via WebSocket connection, showing simulated data that mimics a production monitoring system.

## Commands

### Running the Project

**Option 1: Using the interactive Windows script**
```batch
run.bat
```
This provides a menu to start backend, frontend, or both.

**Option 2: Manual commands**

Start the backend (requires Java 8+ and Maven):
```bash
cd backend
mvn clean spring-boot:run
```

Or build and run the JAR:
```bash
cd backend
mvn clean package
java -jar target/echarts-backend-1.0.0.jar
```

Start the frontend (requires Python 3):
```bash
cd frontend
python -m http.server 3000
```

Or use http-server (Node.js):
```bash
npx http-server frontend -p 3000
```

Or simply open `frontend/index.html` directly in a browser.

**Access the application**:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080

## Architecture

### Backend (Spring Boot)

The backend uses Spring Boot 2.7.18 with WebSocket messaging to push real-time data:

```
backend/src/main/java/com/example/echarts/
├── EchartsApplication.java    # Main entry point with @EnableScheduling
├── config/
│   └── WebSocketConfig.java   # STOMP WebSocket configuration
├── controller/
│   └── WebSocketController.java  # Scheduled data generation and push
└── model/
    └── RealTimeData.java      # Data model
```

### Frontend (Vue.js)

The frontend uses Vue 3 Composition API and ECharts 5 for visualization:

```
frontend/
├── index.html    # Main HTML with CDN-loaded libraries
└── app.js        # Vue app with WebSocket client logic
```

### Data Flow

1. Backend `@Scheduled(fixedRate=1000)` method generates data every second
2. `SimpMessagingTemplate` pushes data to `/topic/realtime-data`
3. Frontend connects to `ws://localhost:8080/ws` via SockJS/WebStomp
4. Frontend subscribes to `/topic/realtime-data` and updates ECharts charts
5. Charts display last 20 data points with smooth animations

## Key Files

### Backend Configuration~~~~

| File | Purpose |
|------|---------|
| `backend/pom.xml` | Maven dependencies (Spring Boot 2.7.18, WebSocket, Jackson) |
| `backend/src/main/resources/application.properties` | Server config: port 8080, CORS allowed origins |
| `backend/src/main/java/com/example/echarts/EchartsApplication.java` | Spring Boot main class with `@EnableScheduling` |
| `backend/src/main/java/com/example/echarts/config/WebSocketConfig.java` | WebSocket endpoint `/ws`, message broker `/topic` |
| `backend/src/main/java/com/example/echarts/controller/WebSocketController.java` | `@Scheduled` method (1s interval) generating and pushing data |
| `backend/src/main/java/com/example/echarts/model/RealTimeData.java` | Data model: `onlineUsers`, `orderCount`, `cpuUsage`, `memoryUsage`, `timestamp` |

### Frontend Files

| File | Purpose |
|------|---------|
| `frontend/index.html` | HTML structure, imports Vue 3, ECharts 5, SockJS, WebStomp via CDN |
| `frontend/app.js` | Vue 3 app with WebSocket connection, ECharts initialization, data updates |

### Data Model (RealTimeData)

```java
{
  "onlineUsers": int,      // Range: 50-500
  "orderCount": int,       // Range: 20-200
  "cpuUsage": double,      // Range: 30-70%
  "memoryUsage": double,  // Range: 40-70%
  "timestamp": string      // Format: HH:mm:ss
}
```

## Configuration

### Backend (application.properties)

```properties
server.port=8080
websocket.endpoint=/ws
cors.allowed-origins=http://localhost:3000,http://localhost:8081
logging.level.com.example.echarts=DEBUG
```

### WebSocket Configuration

- **Endpoint**: `http://localhost:8080/ws` (with SockJS fallback)
- **Message Prefix**: `/app` for client-to-server messages
- **Topic Prefix**: `/topic` for server-to-client broadcasts
- **Data Topic**: `/topic/realtime-data`
- **Request Endpoint**: `/app/request-data` (optional, for on-demand data)

### Frontend WebSocket Connection

```javascript
// Connection (app.js:236-256)
const socket = new SockJS('http://localhost:8080/ws');
stompClient = webstomp.over(socket);
stompClient.connect({}, () => {
    stompClient.subscribe('/topic/realtime-data', handleRealTimeData);
});
```

## Dependencies

### Backend Maven Dependencies

- Spring Boot Starter Web
- Spring Boot Starter WebSocket
- Jackson Databind (JSON serialization)

### Frontend CDN Dependencies (loaded in index.html)

- Vue 3 (`https://unpkg.com/vue@3/dist/vue.global.js`)
- ECharts 5.4.3 (`https://unpkg.com/echarts@5.4.3/dist/echarts.min.js`)
- SockJS 1.6.1 (`https://unpkg.com/sockjs-client@1.6.1/dist/sockjs.min.js`)
- WebStomp 1.2.6 (`https://unpkg.com/webstomp-client@1.2.6/dist/webstomp.min.js`)

## Notes

- The data is simulated and randomly generated for demonstration purposes
- Charts maintain a history of 20 data points for smooth visualization
- Auto-reconnect is implemented with a 3-second retry interval
- Window resize events trigger chart resizing for responsiveness
