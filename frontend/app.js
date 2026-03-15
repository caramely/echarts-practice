const { createApp, ref, onMounted, onUnmounted } = Vue;

createApp({
    setup() {
        // Reactive data
        const onlineUsers = ref(100);
        const orderCount = ref(50);
        const cpuUsage = ref(45.5);
        const memoryUsage = ref(60.2);
        const timestamp = ref('--:--:--');
        const isConnected = ref(false);
        
        // Chart instances
        let usersChart = null;
        let ordersChart = null;
        let resourcesChart = null;
        
        // Data history for charts
        const usersHistory = ref([]);
        const ordersHistory = ref([]);
        const cpuHistory = ref([]);
        const memoryHistory = ref([]);
        const timeHistory = ref([]);
        
        // WebSocket connection
        let stompClient = null;
        const maxHistoryLength = 20;
        
        // Initialize ECharts charts
        const initCharts = () => {
            // Users chart
            usersChart = echarts.init(document.getElementById('usersChart'));
            usersChart.setOption({
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
            });
            
            // Orders chart
            ordersChart = echarts.init(document.getElementById('ordersChart'));
            ordersChart.setOption({
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
            });
            
            // Resources chart
            resourcesChart = echarts.init(document.getElementById('resourcesChart'));
            resourcesChart.setOption({
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
            });
        };
        
        // Update chart data
        const updateCharts = () => {
            if (usersChart) {
                usersChart.setOption({
                    xAxis: { data: timeHistory.value },
                    series: [{ data: usersHistory.value }]
                });
            }
            
            if (ordersChart) {
                ordersChart.setOption({
                    xAxis: { data: timeHistory.value },
                    series: [{ data: ordersHistory.value }]
                });
            }
            
            if (resourcesChart) {
                resourcesChart.setOption({
                    xAxis: { data: timeHistory.value },
                    series: [
                        { data: cpuHistory.value },
                        { data: memoryHistory.value }
                    ]
                });
            }
        };
        
        // Add data point to history
        const addDataPoint = (data) => {
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
        const handleRealTimeData = (message) => {
            const data = JSON.parse(message.body);
            
            // Update reactive values
            onlineUsers.value = data.onlineUsers;
            orderCount.value = data.orderCount;
            cpuUsage.value = data.cpuUsage;
            memoryUsage.value = data.memoryUsage;
            timestamp.value = data.timestamp;
            
            // Add to history and update charts
            addDataPoint(data);
            updateCharts();
        };
        
        // Connect to WebSocket
        const connectWebSocket = () => {
            const socket = new SockJS('http://localhost:8080/ws');
            stompClient = webstomp.over(socket);
            
            stompClient.connect({}, () => {
                console.log('WebSocket connected');
                isConnected.value = true;
                
                // Subscribe to real-time data topic
                stompClient.subscribe('/topic/realtime-data', handleRealTimeData);
                
                // Request initial data
                stompClient.send('/app/request-data', JSON.stringify({}));
            }, (error) => {
                console.error('WebSocket connection error:', error);
                isConnected.value = false;
                
                // Try to reconnect after 3 seconds
                setTimeout(connectWebSocket, 3000);
            });
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
            initCharts();
            connectWebSocket();
            
            // Handle window resize
            window.addEventListener('resize', () => {
                if (usersChart) usersChart.resize();
                if (ordersChart) ordersChart.resize();
                if (resourcesChart) resourcesChart.resize();
            });
        });
        
        onUnmounted(() => {
            disconnectWebSocket();
            window.removeEventListener('resize', () => {});
        });
        
        return {
            onlineUsers,
            orderCount,
            cpuUsage,
            memoryUsage,
            timestamp,
            isConnected
        };
    }
}).mount('#app');