<template>
  <div class="stat-card">
    <h3>{{ title }}</h3>
    <div class="value">{{ formattedValue }}</div>
    <div class="unit">{{ unit }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  value: number | string;
  unit: string;
  format?: (value: any) => string;
}>();

const formattedValue = computed(() => {
  if (props.format) {
    return props.format(props.value);
  }
  return props.value;
});
</script>

<style scoped>
.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.stat-card h3 {
  font-size: 1rem;
  margin-bottom: 10px;
  opacity: 0.9;
}

.stat-card .value {
  font-size: 2.5rem;
  font-weight: bold;
}

.stat-card .unit {
  font-size: 1rem;
  opacity: 0.8;
}
</style>