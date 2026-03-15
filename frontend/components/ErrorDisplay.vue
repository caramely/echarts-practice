<template>
  <div v-if="showError" class="error-display">
    <div class="error-header">
      <span class="error-icon">⚠️</span>
      <span class="error-title">Connection Error</span>
      <button @click="dismissError" class="dismiss-btn">×</button>
    </div>
    <div class="error-message">
      {{ errorMessage }}
    </div>
    <div class="error-actions">
      <button @click="retryConnection" class="retry-btn">Retry Connection</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  message: string;
}>();

const showError = ref(true);
const errorMessage = ref(props.message);

const dismissError = () => {
  showError.value = false;
};

const retryConnection = () => {
  // Emit event to parent component to retry connection
  emit('retry');
  showError.value = false;
};

defineExpose({
  showError,
  errorMessage
});
</script>

<style scoped>
.error-display {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff4444;
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  z-index: 1000;
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.error-icon {
  font-size: 1.2rem;
  margin-right: 8px;
}

.error-title {
  font-weight: bold;
  font-size: 1.1rem;
}

.dismiss-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 5px;
}

.error-message {
  margin-bottom: 15px;
  font-size: 0.95rem;
}

.error-actions {
  display: flex;
  justify-content: flex-end;
}

.retry-btn {
  background: white;
  color: #ff4444;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #ffeeee;
}
</style>