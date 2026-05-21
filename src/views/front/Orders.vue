<template>
  <div v-if="frontStore.frontTab === 'orders'" class="max-w-2xl mx-auto">
    <div class="bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-6 shadow-sm border border-slate-100">
      <div class="flex justify-between items-center mb-4 md:mb-6">
        <h2 class="text-lg md:text-xl font-black text-slate-800"><i
            class="ri-history-line mr-2 text-blue-500"></i>查单跟踪</h2>
      </div>

      <div class="relative mb-5 md:mb-6 flex space-x-2">
        <div class="relative flex-grow">
          <i class="ri-hashtag absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input v-model="frontStore.queryId" placeholder="输入单号查单"
            class="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 ring-blue-100 outline-none font-mono text-xs md:text-sm transition" />
        </div>
        <button @click="frontStore.doQuery(frontStore.queryId)"
          class="bg-slate-800 hover:bg-slate-900 text-white px-4 md:px-6 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition shadow-md whitespace-nowrap active:scale-95">深度查询</button>
      </div>

      <div v-if="frontStore.localOrders.length === 0"
        class="text-center py-10 md:py-16 text-slate-400 border-t border-dashed border-slate-100">
        <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3"><i
            class="ri-file-unknow-line text-2xl text-slate-300"></i></div>
        <span class="text-sm">暂无本地购买记录</span>
      </div>

      <div v-else class="space-y-2.5 md:space-y-3">
        <div v-for="o in frontStore.localOrders" :key="o.orderId" @click="frontStore.doQuery(o.orderId)"
          class="bg-white hover:bg-slate-50 border border-slate-100 hover:border-blue-200 p-3 md:p-4 rounded-xl md:rounded-2xl cursor-pointer transition flex flex-col md:flex-row justify-between items-start md:items-center group shadow-sm">
          <div class="overflow-hidden w-full md:flex-1 pr-0 md:pr-4 mb-2 md:mb-0">
            <div class="font-bold text-slate-800 text-sm md:text-base truncate">{{ o.productName }}</div>
            <div class="flex items-center text-[10px] md:text-xs text-slate-400 mt-1.5">
              <span class="font-mono bg-slate-100 px-1.5 py-0.5 rounded mr-2 text-slate-500">{{ o.orderId
                }}</span>
              <span>{{ frontStore.formatRealTime(o.time) }}</span>
            </div>
          </div>
          <div
            class="flex items-center justify-between w-full md:w-auto space-x-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-none border-slate-50">
            <span v-if="o.status === 'paid'"
              class="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-bold whitespace-nowrap"><i
                class="ri-checkbox-circle-fill mr-0.5"></i> 已完成</span>
            <span v-else-if="o.status === 'expired'"
              class="px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-xs font-bold whitespace-nowrap"><i
                class="ri-close-circle-fill mr-0.5"></i> 已超时</span>
            <span v-else
              class="px-2.5 py-1 bg-amber-50 text-amber-500 border border-amber-100 rounded-lg text-xs font-bold whitespace-nowrap"><i
                class="ri-time-fill mr-0.5"></i> 待支付</span>
            <div
              class="text-xs text-blue-500 font-bold flex items-center group-hover:translate-x-1 transition-transform">
              详情 <i class="ri-arrow-right-s-line align-middle"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFrontStore } from './store';
const frontStore = useFrontStore();
</script>