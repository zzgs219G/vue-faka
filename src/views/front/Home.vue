<template>
  <div v-if="frontStore.frontTab === 'home'">
    <div class="flex flex-col md:flex-row gap-3 mb-5">
      <div
        class="flex-grow bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2.5 rounded-xl md:rounded-2xl flex items-center shadow-sm min-w-0">
        <i class="ri-notification-badge-fill mr-2 md:mr-3 text-lg text-blue-500 flex-shrink-0"></i>
        <marquee scrollamount="4" class="text-xs md:text-sm font-medium whitespace-nowrap">{{
          frontStore.site.config.notice || '欢迎惠顾' }}</marquee>
      </div>
      <div class="relative md:w-64 flex-shrink-0">
        <i class="ri-search-line absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input v-model="frontStore.searchKey" placeholder="搜索商品..."
          class="w-full pl-9 pr-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl text-xs md:text-sm focus:ring-2 ring-blue-100 outline-none transition shadow-sm" />
      </div>
    </div>

    <div class="flex space-x-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
      <button v-if="!frontStore.isExclusiveMode" @click="frontStore.activeCat = 'all'"
        :class="frontStore.activeCat === 'all' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
        class="px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition active:scale-95">全部</button>
      <button v-for="c in frontStore.site.categories" :key="c.id"
        v-show="!frontStore.isExclusiveMode || frontStore.activeCat === c.id" @click="frontStore.activeCat = c.id"
        :class="frontStore.activeCat === c.id ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
        class="px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition active:scale-95">{{
          c.name }}</button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-5">
      <div v-if="frontStore.filteredProducts.length === 0"
        class="col-span-full text-center py-20 bg-white rounded-2xl md:rounded-3xl border border-dashed border-slate-200">
        <i class="ri-ghost-line text-4xl text-slate-300 block mb-2"></i><span
          class="text-slate-400 text-sm">此分类下暂无商品</span>
      </div>

      <div v-for="p in frontStore.filteredProducts" :key="p.id"
        class="bg-white rounded-xl p-3 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col relative group cursor-pointer shadow-sm"
        @click="p.stock > 0 && frontStore.openBuy(p)">
        <div v-if="p.stock <= 0"
          class="absolute top-0 right-0 bg-slate-400 text-white text-[9px] md:text-xs font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-xl z-10">
          售罄</div>

        <div class="flex items-center mb-3">
          <div
            class="w-10 h-10 md:w-14 md:h-14 bg-blue-50 rounded-lg md:rounded-xl border border-blue-100 flex-shrink-0 flex items-center justify-center overflow-hidden mr-2 md:mr-3">
            <img v-if="p.icon" :src="p.icon" class="w-full h-full object-cover" />
            <i v-else class="ri-shopping-bag-3-fill text-lg md:text-2xl text-blue-400"></i>
          </div>
          <div class="flex-grow min-w-0">
            <h3
              class="text-xs md:text-sm font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
              {{ p.name }}</h3>
          </div>
        </div>

        <div class="mt-auto border-t border-slate-50 pt-2 flex items-end justify-between">
          <div>
            <div class="text-sm md:text-lg font-black text-rose-500 tracking-tight"><span
                class="text-[9px] font-normal mr-0.5">¥</span>{{ p.price }}</div>
            <div class="text-[9px] mt-0.5 font-bold"
              :class="p.stock > 20 ? 'text-emerald-500' : (p.stock > 5 ? 'text-amber-500' : 'text-rose-400')">
              <i class="ri-pulse-line align-middle"></i> {{ frontStore.getStockStatus(p.stock) }}
            </div>
          </div>
          <button @click.stop="frontStore.openBuy(p)" :disabled="p.stock <= 0"
            :class="p.stock > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white shadow shadow-blue-200/50' : 'bg-slate-100 text-slate-400 cursor-not-allowed'"
            class="h-6 md:h-8 px-2.5 md:px-4 rounded-md md:rounded-lg font-bold text-[10px] md:text-sm transition transform active:scale-95 flex items-center justify-center whitespace-nowrap">
            {{ p.stock > 0 ? '购买' : '缺货' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFrontStore } from './store';
const frontStore = useFrontStore();
</script>
