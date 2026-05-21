<template>
  <div v-show="adminStore.admin.tab === 'set'" class="space-y-5 animate-fade-in">
    <div class="bg-white p-5 rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex justify-between items-center">
      <div>
        <div class="font-bold text-[15px] text-gray-800">站点营业状态</div>
        <div class="text-[11px] text-gray-400 mt-1">关闭后买家无法在前台下单</div>
      </div>
      <el-switch v-model="adminStore.adminData.config.isOpen" active-color="#10b981" inactive-color="#ef4444" size="large"></el-switch>
    </div>

    <div class="bg-white p-5 rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
      <h3 class="text-sm font-bold text-gray-800 mb-4 flex items-center"><i
          class="ri-settings-3-fill text-blue-500 mr-2"></i>核心基础参数</h3>
      <el-form label-position="top" size="large">
        <el-form-item label="网站主标题">
          <el-input v-model="adminStore.adminData.config.siteName" placeholder="显示在导航栏的名称"></el-input>
        </el-form-item>
        <el-form-item label="售后联系方式">
          <el-input v-model="adminStore.adminData.config.afterSales" placeholder="QQ群 / 客服微信"></el-input>
        </el-form-item>
        <el-form-item label="跑马灯公告">
          <el-input type="textarea" :rows="2" v-model="adminStore.adminData.config.notice" placeholder="顶部滚动的通知文本"></el-input>
        </el-form-item>

        <div class="bg-blue-50 p-4 rounded-xl mt-2 mb-4 border border-blue-100">
          <div class="text-[13px] font-bold text-blue-800 mb-2">单笔接口手续费 (元)</div>
          <div class="text-[11px] text-blue-600 mb-3 leading-tight">由买家额外承担，将自动叠加在支付总额上</div>
          <el-input-number v-model="adminStore.adminData.config.apiFee" :precision="2" :step="0.1" :min="0"
            class="!w-full"></el-input-number>
        </div>
      </el-form>
    </div>

    <div class="bg-white p-5 rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
      <h3 class="text-sm font-bold text-gray-800 mb-4 flex items-center"><i
          class="ri-secure-payment-fill text-green-500 mr-2"></i>支付收款通道</h3>
      <el-form label-position="top" size="large">
        <el-form-item label="支付宝收款码图片 URL">
          <el-input v-model="adminStore.adminData.config.alipayQr" placeholder="https://..."></el-input>
        </el-form-item>
        <el-form-item label="支付宝一键唤醒链接 (Deep Link)">
          <el-input v-model="adminStore.adminData.config.alipayLink" placeholder="https://qr.alipay.com/..."></el-input>
        </el-form-item>
        <el-divider class="!my-6"></el-divider>
        <el-form-item label="微信收款码图片 URL">
          <el-input v-model="adminStore.adminData.config.wechatQr" placeholder="https://..."></el-input>
        </el-form-item>
      </el-form>
    </div>

    <el-button type="primary" size="large"
      class="w-full !rounded-[16px] font-bold h-14 shadow-[0_4px_14px_0_rgba(64,158,255,0.39)]"
      @click="adminStore.doSaveConfig">保存并应用全部配置</el-button>
  </div>
</template>

<script setup>
import { useAdminStore } from './store';
const adminStore = useAdminStore();
</script>