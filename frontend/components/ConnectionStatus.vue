<template>
  <div :class="['connection-status', { connected: isConnected, disconnected: !isConnected }]">
    <span class="status-dot"></span>
    {{ isConnected ? 'Connected to WebSocket Server' : 'Disconnected' }}
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  isConnected: boolean;
}>();
</script>

<style scoped>
.connection-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  border-radius: 20px;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}

.connected {
  background: #4CAF50;
}

.disconnected {
  background: #F44336;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.connected .status-dot {
  background: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>