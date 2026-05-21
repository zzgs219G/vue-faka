<template>
  <div v-show="adminStore.admin.tab === 'log'" class="space-y-4 animate-fade-in">
    <div class="flex justify-between items-center px-1 mb-2">
      <div class="text-[13px] font-bold text-gray-500 uppercase tracking-wider">运行日志</div>
      <el-button size="small" icon="Refresh" circle @click="adminStore.fetchLogs" class="!shadow-sm"></el-button>
    </div>

    <el-empty v-if="adminStore.systemLogs.length === 0" description="暂无异常日志" :image-size="80"></el-empty>

    <el-timeline v-else class="pl-0 custom-timeline">
      <el-timeline-item v-for="log in adminStore.systemLogs" :key="log.id" :timestamp="adminStore.formatRealTime(log.createTime)"
        :color="log.type.includes('失败') || log.type.includes('异常') || log.type.includes('警告') ? '#F56C6C' : '#409EFF'"
        placement="top" class="mb-2">
        <div class="bg-white p-4 rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div class="font-bold text-[14px] text-gray-800 mb-1 flex items-center">
            <i :class="log.type.includes('失败') || log.type.includes('警告') ? 'ri-error-warning-fill text-red-500' : 'ri-information-fill text-blue-500'"
              class="mr-1.5 text-lg"></i>
            {{ log.type }}
          </div>
          <p class="text-[13px] text-gray-600 leading-relaxed">{{ log.message }}</p>
          <div v-if="log.detail"
            class="mt-3 bg-gray-50 text-gray-500 text-[11px] p-2.5 rounded-lg border border-gray-100 font-mono break-all leading-tight">
            {{ log.detail }}</div>
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup>
import { useAdminStore } from './store';
const adminStore = useAdminStore();
</script>