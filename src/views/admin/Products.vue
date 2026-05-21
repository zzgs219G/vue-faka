<template>
  <div v-show="adminStore.admin.tab === 'prod'" class="space-y-4 animate-fade-in">
    <div class="sticky top-0 z-10 bg-[#f7f8fa] pb-2 pt-1">
      <el-input v-model="adminStore.adminSearchKey" placeholder="搜索商品名称或ID" prefix-icon="Search" clearable size="large"
        class="!shadow-sm"></el-input>
    </div>

    <el-empty v-if="adminStore.adminFilteredProducts.length === 0" description="未找到商品" :image-size="80"></el-empty>

    <div v-for="group in adminStore.groupedProducts" :key="group.id" class="mb-6">
      <div class="flex justify-between items-center mb-3 px-1">
        <span class="text-[13px] font-bold text-gray-500 uppercase tracking-wider">{{ group.name }}</span>
        <span class="text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">{{ group.products.length
          }}</span>
      </div>

      <div class="space-y-3">
        <div v-for="p in group.products" :key="p.id"
          class="bg-white p-4 rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col relative"
          @click="adminStore.openEditProd(p)">
          <div class="flex justify-between items-start mb-2">
            <div class="font-bold text-[15px] text-gray-800 pr-2 leading-tight">{{ p.name }}</div>
            <div class="text-red-500 font-black text-[15px] whitespace-nowrap">¥{{ p.price }}</div>
          </div>
          <div class="flex justify-between items-center mb-4">
            <span class="text-[11px] text-gray-400 font-mono">ID: {{ p.id }}</span>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-md"
              :class="p.stock > 5 ? 'bg-green-50 text-green-600' : (p.stock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600')">
              余量: {{ p.stock || 0 }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-3 border-t border-gray-50 mt-auto">
            <el-button type="info" plain size="default" class="!rounded-[10px] w-full" @click.stop="adminStore.openEditProd(p)"><i
                class="ri-edit-line mr-1"></i>编辑</el-button>
            <el-button type="primary" size="default" class="!rounded-[10px] w-full"
              @click.stop="adminStore.openCardsModal(p)"><i class="ri-inbox-archive-line mr-1"></i>库存</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 悬浮添加按钮 (FAB) -->
    <div class="fixed right-5 bottom-24 z-30">
      <button @click="adminStore.openAddProd"
        class="w-14 h-14 bg-blue-600 text-white rounded-full shadow-[0_8px_20px_rgba(37,99,235,0.4)] flex items-center justify-center transform transition active:scale-90">
        <i class="ri-add-line text-3xl"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAdminStore } from './store';
const adminStore = useAdminStore();
</script>