<template>
  <div class="container">
    <ErrorDisplay
      v-if="showError"
      :message="errorMessage"
      @retry="retryConnection"
    />

    <div class="header">
      <h1>📊 Real-time Data Monitoring Dashboard</h1>
      <p>Live updates every second via WebSocket | Built with Vue.js + ECharts + Spring Boot</p>
    </div>

    <div class="dashboard">
      <ChartCard
        title="Online Users Trend"
        :chart-id="'usersChart'"
        :option="usersChartOption"
      />

      <ChartCard
        title="Order Count Trend"
        :chart-id="'ordersChart'"
        :option="ordersChartOption"
      />

      <ChartCard
        title="System Resources"
        :chart-id="'resourcesChart'"
        :option="resourcesChartOption"
      />

      <div class="card">
        <h2>Real-time Statistics</h2>
        <div class="stats-grid">
          <StatCard
            title="Online Users"
            :value="onlineUsers"
            unit="users"
          />
          <StatCard
            title="Order Count"
            :value="orderCount"
            unit="orders"
          />
          <StatCard
            title="CPU Usage"
            :value="cpuUsage"
            unit="%"
            :format="(val) => val.toFixed(1)"
          />
          <StatCard
            title="Memory Usage"
            :value="memoryUsage"
            unit="%"
            :format="(val) => val.toFixed(1)"
          />
        </div>
        <div style="margin-top: 20px; color: #666; font-size: 0.9rem;">
          <p>Last update: {{ timestamp }}</p>
          <p>Data updates every second via WebSocket connection</p>
        </div>
      </div>
    </div>

    <ConnectionStatus :is-connected="isConnected" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import ChartCard from './ChartCard.vue';
import StatCard from './StatCard.vue';
import ConnectionStatus from './ConnectionStatus.vue';
import * as echarts from 'echarts';

// Reactive data
const onlineUsers = ref(100);
const orderCount = ref(50);
const cpuUsage = ref(45.5);
const memoryUsage = ref(60.2);
const timestamp = ref('--:--:--');
const isConnected = ref(false);
const showError = ref(false);
const errorMessage = ref('');

// Chart options
const usersChartOption = ref<any>({});
const ordersChartOption = ref<any>({});
const resourcesChartOption = ref<any>({});

// Data history for charts
const usersHistory = ref<number[]>([]);
const ordersHistory = ref<number[]>([]);
const cpuHistory = ref<number[]>([]);
const memoryHistory = ref<number[]>([]);
const timeHistory = ref<string[]>([]);
const maxHistoryLength = 20;

// WebSocket connection
let stompClient: any = null;

// Initialize ECharts chart options
const initChartOptions = () => {
  usersChartOption.value = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c} users'
    },
    xAxis: {
      type: 'category',
      data: timeHistory.value,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: 'Users'
    },
    series: [{
      name: 'Online Users',
      type: 'line',
      data: usersHistory.value,
      smooth: true,
      lineStyle: {
        color: '#667eea',
        width: 3
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(102, 126, 234, 0.8)' },
          { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
        ])
      },
      symbol: 'circle',
      symbolSize: 8
    }],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    }
  };

  ordersChartOption.value = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c} orders'
    },
    xAxis: {
      type: 'category',
      data: timeHistory.value,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: 'Orders'
    },
    series: [{
      name: 'Order Count',
      type: 'line',
      data: ordersHistory.value,
      smooth: true,
      lineStyle: {
        color: '#764ba2',
        width: 3
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(118, 75, 162, 0.8)' },
          { offset: 1, color: 'rgba(118, 75, 162, 0.1)' }
        ])
      },
      symbol: 'circle',
      symbolSize: 8
    }],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    }
  };

  resourcesChartOption.value = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c}%'
    },
    xAxis: {
      type: 'category',
      data: timeHistory.value,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: 'Usage %',
      max: 100
    },
    legend: {
      data: ['CPU Usage', 'Memory Usage']
    },
    series: [
      {
        name: 'CPU Usage',
        type: 'line',
        data: cpuHistory.value,
        smooth: true,
        lineStyle: {
          color: '#4CAF50',
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8
      },
      {
        name: 'Memory Usage',
        type: 'line',
        data: memoryHistory.value,
        smooth: true,
        lineStyle: {
          color: '#FF9800',
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    }
  };
};

// Update chart data
const updateCharts = () => {
  // Update users chart
  if (usersChartOption.value) {
    usersChartOption.value.xAxis.data = timeHistory.value;
    usersChartOption.value.series[0].data = usersHistory.value;
  }

  // Update orders chart
  if (ordersChartOption.value) {
    ordersChartOption.value.xAxis.data = timeHistory.value;
    ordersChartOption.value.series[0].data = ordersHistory.value;
  }

  // Update resources chart
  if (resourcesChartOption.value) {
    resourcesChartOption.value.xAxis.data = timeHistory.value;
    resourcesChartOption.value.series[0].data = cpuHistory.value;
    resourcesChartOption.value.series[1].data = memoryHistory.value;
  }
};

// Add data point to history
const addDataPoint = (data: any) => {
  // Add to history arrays
  timeHistory.value.push(data.timestamp);
  usersHistory.value.push(data.onlineUsers);
  ordersHistory.value.push(data.orderCount);
  cpuHistory.value.push(data.cpuUsage);
  memoryHistory.value.push(data.memoryUsage);

  // Keep only last N points
  if (timeHistory.value.length > maxHistoryLength) {
    timeHistory.value.shift();
    usersHistory.value.shift();
    ordersHistory.value.shift();
    cpuHistory.value.shift();
    memoryHistory.value.shift();
  }
};

// Handle incoming WebSocket message
const handleRealTimeData = (message: any) => {
  try {
    const data = JSON.parse(message.body);

    // Validate data structure
    if (!data.onlineUsers || !data.orderCount || !data.cpuUsage || !data.memoryUsage || !data.timestamp) {
      throw new Error('Invalid data structure');
    }

    // Validate data ranges
    if (data.onlineUsers < 50 || data.onlineUsers > 500) {
      throw new Error(`Invalid online users value: ${data.onlineUsers}`);
    }
    if (data.orderCount < 20 || data.orderCount > 200) {
      throw new Error(`Invalid order count value: ${data.orderCount}`);
    }
    if (data.cpuUsage < 30.0 || data.cpuUsage > 70.0) {
      throw new Error(`Invalid CPU usage value: ${data.cpuUsage}`);
    }
    if (data.memoryUsage < 40.0 || data.memoryUsage > 70.0) {
      throw new Error(`Invalid memory usage value: ${data.memoryUsage}`);
    }

    // Update reactive values
    onlineUsers.value = data.onlineUsers;
    orderCount.value = data.orderCount;
    cpuUsage.value = data.cpuUsage;
    memoryUsage.value = data.memoryUsage;
    timestamp.value = data.timestamp;

    // Hide error if it was showing
    showError.value = false;
    errorMessage.value = '';

    // Add to history and update charts
    addDataPoint(data);
    updateCharts();
  } catch (error) {
    console.error('Error processing WebSocket message:', error);
    showError.value = true;
    errorMessage.value = error.message || 'Failed to process data. Please try again.';

    // Fallback to sample data
    initializeSampleData();
    updateCharts();
  }
};

// Error handling functions
const dismissError = () => {
  showError.value = false;
  errorMessage.value = '';
};

const retryConnection = () => {
  showError.value = false;
  errorMessage.value = '';
  connectWebSocket();
};

// Connect to WebSocket
const connectWebSocket = () => {
  try {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = webstomp.over(socket);

    stompClient.connect({}, () => {
      console.log('WebSocket connected');
      isConnected.value = true;

      // Subscribe to real-time data topic
      stompClient.subscribe('/topic/realtime-data', handleRealTimeData);

      // Request initial data
      stompClient.send('/app/request-data', JSON.stringify({}));
    }, (error: any) => {
      console.error('WebSocket connection error:', error);
      isConnected.value = false;

      // Try to reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    });
  } catch (error) {
    console.error('WebSocket connection failed:', error);
    isConnected.value = false;
    setTimeout(connectWebSocket, 3000);
  }
};

// Disconnect WebSocket
const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.disconnect();
    isConnected.value = false;
  }
};

// Initialize with some sample data
const initializeSampleData = () => {
  const now = new Date();
  for (let i = maxHistoryLength - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 1000);
    const timeStr = time.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    timeHistory.value.push(timeStr);
    usersHistory.value.push(100 + Math.floor(Math.random() * 50));
    ordersHistory.value.push(50 + Math.floor(Math.random() * 30));
    cpuHistory.value.push(30 + Math.random() * 40);
    memoryHistory.value.push(40 + Math.random() * 30);
  }
};

// Lifecycle hooks
onMounted(() => {
  initializeSampleData();
  initChartOptions();
  connectWebSocket();

  // Handle window resize
  window.addEventListener('resize', () => {
    updateCharts();
  });
});

onUnmounted(() => {
  disconnectWebSocket();
  window.removeEventListener('resize', () => {});
});

defineExpose({
  updateChart: (newOption: any) => {
    if (chart.value) {
      chart.value.setOption(newOption);
    }
  },
  dismissError,
  retryConnection
});
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}
</style>