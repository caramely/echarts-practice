<template>
  <div class="card">
    <h2>{{ title }}</h2>
    <div class="chart-container" :id="chartId"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import * as echarts from 'echarts';

const props = defineProps<{
  title: string;
  chartId: string;
  option: any;
}>();

const chart = ref<echarts.ECharts | null>(null);

onMounted(() => {
  if (props.chartId) {
    chart.value = echarts.init(document.getElementById(props.chartId));
    chart.value.setOption(props.option);
  }
});

onUnmounted(() => {
  if (chart.value) {
    chart.value.dispose();
  }
});

defineExpose({
  updateChart: (newOption: any) => {
    if (chart.value) {
      chart.value.setOption(newOption);
    }
  }
});
</script>

<style scoped>
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

.chart-container {
  height: 350px;
  width: 100%;
}
</style>