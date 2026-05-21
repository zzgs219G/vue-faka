<template>
  <div v-if="!adminStore.admin.logged" class="min-h-screen flex flex-col justify-center items-center bg-[#f7f8fa] p-6 relative">
    <el-button link type="info" @click="router.push('/')"
      style="position: absolute; top: env(safe-area-inset-top, 20px); left: 20px;">
      <el-icon>
        <ArrowLeft />
      </el-icon> 返回商城
    </el-button>

    <div class="w-full max-w-[340px] animate-fade-in">
      <div class="text-center mb-10">
        <div
          class="w-20 h-20 bg-white rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <i class="ri-shield-keyhole-fill text-4xl text-blue-500"></i>
        </div>
        <h2 class="text-3xl font-black text-gray-800 tracking-tight">V-MQ</h2>
        <p class="text-gray-400 text-sm mt-2 font-medium">云端管理控制台</p>
      </div>

      <div class="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <el-input v-model="adminStore.admin.pwd" type="password" placeholder="请输入主控密码" show-password size="large"
          @keyup.enter="adminStore.adminLogin(false)" class="mb-5">
          <template #prefix><el-icon>
              <Lock />
            </el-icon></template>
        </el-input>

        <el-button type="primary" size="large" @click="adminStore.adminLogin(false)"
          class="w-full font-bold !rounded-[12px] h-12 shadow-[0_4px_14px_0_rgba(64,158,255,0.39)]">
          解锁控制台
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAdminStore } from './store';
const router = useRouter();
const adminStore = useAdminStore();
</script>