<template>
  <div v-show="adminStore.admin.tab === 'dash'" class="space-y-4 animate-fade-in">
    <!-- 核心指标 2x2 网格 -->
    <div class="grid grid-cols-2 gap-4">
      <!-- 今日营收 (高亮大卡片) -->
      <div
        class="col-span-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[20px] p-5 text-white shadow-[0_8px_20px_rgba(59,130,246,0.3)] relative overflow-hidden">
        <div class="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
          <i class="ri-money-cny-circle-fill text-9xl"></i>
        </div>
        <p class="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1 opacity-90">今日营收</p>
        <div class="flex items-end">
          <span class="text-xl font-bold mr-1 mb-1">¥</span>
          <span class="text-4xl font-black tracking-tight">{{ adminStore.dashData.stats?.todayRevenue || '0.00' }}</span>
        </div>
      </div>

      <!-- 历史总营收 -->
      <div class="bg-white rounded-[20px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
        <p class="text-gray-400 text-[11px] font-bold uppercase mb-2">历史总计</p>
        <div class="text-xl font-black text-gray-800">¥{{ adminStore.dashData.stats?.totalRevenue || '0.00' }}</div>
      </div>

      <!-- 成交订单 -->
      <div class="bg-white rounded-[20px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
        <p class="text-gray-400 text-[11px] font-bold uppercase mb-2">订单数量</p>
        <div class="text-xl font-black text-green-500">{{ adminStore.dashData.stats?.totalOrders || 0 }}</div>
      </div>

      <!-- 系统状态 -->
      <div class="col-span-2 bg-white rounded-[20px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          </div>
          <div>
            <div class="text-gray-800 font-bold text-sm">系统运行中</div>
            <div class="text-gray-400 text-xs mt-0.5">各项服务正常</div>
          </div>
        </div>
        <el-button circle icon="Refresh" @click="adminStore.adminLogin(true)" size="default" class="!shadow-sm"></el-button>
      </div>
    </div>

    <!-- 近期流水 -->
    <div class="mt-6">
      <h3 class="text-sm font-bold text-gray-800 mb-3 px-1">近期流水</h3>
      <el-empty v-if="!adminStore.dashData.recentOrders || adminStore.dashData.recentOrders.length === 0" description="暂无记录" :image-size="80"></el-empty>

      <div class="space-y-3">
        <div v-for="o in adminStore.dashData.recentOrders" :key="o.orderId"
          class="bg-white p-4 rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1 pr-3">
              <div class="text-[15px] font-bold text-gray-800 leading-tight mb-1">{{ o.productName }}</div>
              <div class="text-[11px] text-gray-400 font-mono">{{ o.orderId }}</div>
            </div>
            <div class="text-right">
              <div class="text-base font-black text-red-500">¥{{ o.payPrice }}</div>
              <div class="text-[10px] text-gray-500 mt-1 flex items-center justify-end">
                <i :class="o.payMethod === 'wechat' ? 'ri-wechat-pay-fill text-green-500' : 'ri-alipay-fill text-blue-500'"
                  class="mr-1"></i>
                {{ o.payMethod === 'wechat' ? '微信' : '支付宝' }}
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between pt-3 border-t border-gray-50">
            <div class="flex items-center">
              <span v-if="o.status === 'paid'"
                class="inline-flex items-center justify-center px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-bold"><i
                  class="ri-check-line mr-0.5"></i>已发货</span>
              <span v-else
                class="inline-flex items-center justify-center px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">未完成</span>
              <span class="text-[10px] text-gray-400 ml-2">{{ adminStore.formatRealTime(o.createTime).split(' ')[1] }}</span>
            </div>
            <div>
              <el-button v-if="o.status === 'paid'" type="primary" plain size="small" class="!rounded-lg"
                @click="adminStore.viewCard(o)">查看</el-button>
              <el-button v-if="o.status !== 'paid'" type="warning" plain size="small" class="!rounded-lg"
                @click="adminStore.reissueOrder(o)">补单</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAdminStore } from './store';
const adminStore = useAdminStore();
</script>