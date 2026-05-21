<template>
  <div v-show="adminStore.admin.tab === 'cat'" class="space-y-6 animate-fade-in">
    <div class="bg-white p-5 rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
      <h3 class="text-sm font-bold text-gray-800 mb-4">新增分类</h3>
      <div class="space-y-4">
        <el-input v-model="adminStore.newCat.id" placeholder="短标识 (例如: vip)" size="large"></el-input>
        <el-input v-model="adminStore.newCat.name" placeholder="展示名称 (例如: 会员专区)" size="large"></el-input>
        <div class="flex items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
          <el-switch v-model="adminStore.newCat.isExclusive" active-color="#409EFF"></el-switch>
          <div class="ml-3">
            <div class="text-[13px] font-bold text-gray-700">设为专属独立分类</div>
            <div class="text-[10px] text-gray-400 mt-0.5">买家通过链接进入时，强制隐藏其他</div>
          </div>
        </div>
        <el-button type="primary" size="large" class="w-full !rounded-[12px] font-bold" @click="adminStore.doAddCat">添加分类</el-button>
      </div>
    </div>

    <div>
      <div class="flex justify-between items-center mb-3 px-1">
        <h3 class="text-sm font-bold text-gray-800">当前分类列表</h3>
        <el-button type="success" link @click="adminStore.doSaveCats" class="font-bold">云端同步 <i
            class="ri-cloud-upload-line ml-1"></i></el-button>
      </div>

      <el-empty v-if="adminStore.adminData.categories.length === 0" description="暂无分类" :image-size="80"></el-empty>

      <div class="space-y-3">
        <div v-for="(c, i) in adminStore.adminData.categories" :key="c.id"
          class="bg-white p-4 rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex justify-between items-center">
          <div>
            <div class="font-bold text-[15px] text-gray-800 flex items-center">
              {{ c.name }}
              <span v-if="c.isExclusive"
                class="ml-2 bg-blue-50 text-blue-500 text-[9px] px-1.5 py-0.5 rounded font-bold">专属</span>
            </div>
            <div class="text-[11px] text-gray-400 font-mono mt-1">{{ c.id }}</div>
          </div>
          <div class="flex space-x-2">
            <button @click="adminStore.openEditCat(c, i)"
              class="w-8 h-8 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-100 transition"><i
                class="ri-edit-line"></i></button>
            <button @click="adminStore.doDelCat(i)"
              class="w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 transition"><i
                class="ri-delete-bin-line"></i></button>
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