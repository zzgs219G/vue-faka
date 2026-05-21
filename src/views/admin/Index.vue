<template>
  <div>
    <div v-if="adminStore.globalLoading" class="global-loading-overlay">
      <el-icon class="is-loading" :size="40" color="#409EFF"><Loading /></el-icon>
    </div>

    <Login v-if="!adminStore.admin.logged" />

    <!-- 控制台主界面 -->
    <div v-if="adminStore.admin.logged" class="flex flex-col h-screen bg-[#f7f8fa]">
      <!-- 顶部 Header (纯标题) -->
      <header class="glass-header h-14 flex items-center justify-between px-5 sticky top-0 z-40 flex-shrink-0 pt-[env(safe-area-inset-top)]">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
            <i class="ri-instance-fill text-white text-lg"></i>
          </div>
          <span class="font-black text-gray-800 text-lg tracking-tight">{{ currentTabName }}</span>
        </div>

        <div class="flex items-center space-x-3">
          <button @click="router.push('/')" class="text-gray-400 hover:text-gray-600 transition p-1"><i class="ri-store-2-line text-xl"></i></button>
          <button @click="adminStore.adminLogout" class="text-red-400 hover:text-red-500 transition p-1"><i class="ri-shut-down-line text-xl"></i></button>
        </div>
      </header>

      <!-- 主体内容区 (留出底部 Tabbar 的空间) -->
      <main class="flex-grow p-4 sm:p-6 overflow-y-auto hide-scrollbar w-full max-w-3xl mx-auto pb-28 pt-4">

        <Dashboard />
        <Products />
        <Categories />
        <Logs />
        <Settings />

      </main>

      <!-- 底部固定 Tabbar (Mobile First) -->
      <nav class="glass-tabbar fixed bottom-0 left-0 right-0 h-[72px] pb-[env(safe-area-inset-bottom)] z-40 flex justify-around items-center px-2">
        <button v-for="t in tabs" :key="t.id" @click="adminStore.admin.tab = t.id" class="flex flex-col items-center justify-center w-full h-full transition-colors relative">
          <i :class="[t.i, adminStore.admin.tab === t.id ? 'text-blue-500' : 'text-gray-400']" class="text-2xl mb-1 transition-all" :style="adminStore.admin.tab === t.id ? 'transform: translateY(-2px);' : ''"></i>
          <span :class="adminStore.admin.tab === t.id ? 'text-blue-500 font-bold' : 'text-gray-400 font-medium'" class="text-[10px]">{{ t.n }}</span>
        </button>
      </nav>
    </div>

    <!-- ==================== 抽屉与弹窗 ==================== -->

    <!-- 查看卡密弹窗 -->
    <el-dialog v-model="adminStore.cardModal.show" title="发货卡密" width="90%" center align-center :show-close="false">
      <div class="text-[11px] text-gray-500 mb-3 font-mono text-center">{{ adminStore.cardModal.orderId }}</div>
      <div class="bg-gray-50 text-gray-800 p-4 rounded-xl font-mono text-[13px] break-all max-h-[40vh] overflow-y-auto mb-5 border border-gray-100 select-all leading-relaxed">
        {{ adminStore.cardModal.cardContent }}
      </div>
      <template #footer>
        <div class="flex gap-3">
          <el-button @click="adminStore.cardModal.show = false" class="flex-1 !rounded-[12px]" size="large">关闭</el-button>
          <el-button type="primary" class="flex-1 !rounded-[12px]" size="large" @click="adminStore.copyText(adminStore.cardModal.cardContent)">复制内容</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 商品管理抽屉 (底部升起) -->
    <el-drawer v-model="adminStore.showProdModal" direction="btt" size="90%" :with-header="false" class="!bg-[#f7f8fa]">
      <div class="pt-4 px-5 pb-10 max-h-full overflow-y-auto hide-scrollbar relative">
        <button @click="adminStore.showProdModal = false" class="absolute top-4 right-5 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600"><i class="ri-close-line text-xl"></i></button>

        <h3 class="text-xl font-black text-gray-800 mb-6 mt-2">{{ adminStore.pForm.id ? '编辑商品' : '上架新商品' }}</h3>

        <div class="bg-white p-5 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-6">
          <el-form label-position="top" size="large">
            <el-form-item label="商品名称 *">
              <el-input v-model="adminStore.pForm.name" placeholder="简明扼要的商品名..."></el-input>
            </el-form-item>

            <div class="grid grid-cols-2 gap-4">
              <el-form-item label="归属分类">
                <el-select v-model="adminStore.pForm.categoryId" class="w-full">
                  <el-option v-for="c in adminStore.adminData.categories" :key="c.id" :label="c.name" :value="c.id"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="单价 (元) *">
                <el-input-number v-model="adminStore.pForm.price" :precision="2" :step="0.1" :min="0" class="!w-full" controls-position="right"></el-input-number>
              </el-form-item>
            </div>

            <el-form-item label="购买须知 / 详情文案">
              <el-input type="textarea" v-model="adminStore.pForm.desc" :rows="3" placeholder="告知发货格式或注意事项..."></el-input>
            </el-form-item>

            <div class="flex gap-4">
              <el-form-item label="小图标 URL" class="flex-1">
                <el-input v-model="adminStore.pForm.icon" placeholder="https://..."></el-input>
              </el-form-item>
              <el-form-item label="大图 URL" class="flex-1">
                <el-input v-model="adminStore.pForm.image" placeholder="https://..."></el-input>
              </el-form-item>
            </div>

            <div class="bg-red-50 p-3 rounded-xl border border-red-100 flex items-center">
              <el-switch v-model="adminStore.pForm.isHidden" active-color="#ef4444"></el-switch>
              <div class="ml-3 text-[13px] text-red-800 font-bold">临时下架隐藏该商品</div>
            </div>
          </el-form>
        </div>

        <el-button type="primary" size="large" class="w-full !rounded-[16px] font-bold h-14 shadow-[0_4px_14px_0_rgba(64,158,255,0.39)]" @click="adminStore.doSaveProd">确认保存</el-button>
        <el-button v-if="adminStore.pForm.id" type="danger" plain size="large" class="w-full !rounded-[16px] font-bold h-14 mt-3" @click="adminStore.doDelProd(adminStore.pForm.id)">彻底删除此商品</el-button>
      </div>
    </el-drawer>

    <!-- 库存管理弹窗 -->
    <el-dialog v-model="adminStore.showCardsModal" :title="'补货: ' + adminStore.cForm.name" width="90%" align-center>
      <div class="bg-blue-50 text-blue-600 text-[11px] p-2 rounded-lg mb-3 leading-tight border border-blue-100">
        在此处粘贴纯文本卡密，系统会自动按行识别，一行代表一份库存。
      </div>
      <el-input
        type="textarea"
        v-model="adminStore.cForm.text"
        :rows="8"
        placeholder="卡密一
卡密二
卡密三..."
        class="font-mono text-[13px] mb-5"
      ></el-input>
      <div class="flex gap-3">
        <el-button type="danger" plain class="flex-1 !rounded-[12px] h-12" @click="adminStore.doSubmitCards('replace')">清空覆盖</el-button>
        <el-button type="primary" class="flex-[2] !rounded-[12px] font-bold h-12" @click="adminStore.doSubmitCards('append')">安全追加</el-button>
      </div>
    </el-dialog>

    <!-- 分类编辑弹窗 -->
    <el-dialog v-model="adminStore.showCatModal" title="编辑分类" width="90%" align-center>
      <el-form label-position="top" size="large">
        <el-form-item label="分类名称">
          <el-input v-model="adminStore.editCatForm.name"></el-input>
        </el-form-item>
        <el-form-item label="标识 ID (不可更改)">
          <el-input v-model="adminStore.editCatForm.id" disabled></el-input>
        </el-form-item>
        <div class="flex items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
          <el-switch v-model="adminStore.editCatForm.isExclusive" active-color="#409EFF"></el-switch>
          <div class="ml-3 text-[13px] font-bold text-gray-700">设为专属独立分类</div>
        </div>
      </el-form>
      <template #footer>
        <el-button type="primary" size="large" class="w-full !rounded-[12px] font-bold mt-2" @click="adminStore.doSaveEditCat">确认修改</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from './store';
import Login from './Login.vue';
import Dashboard from './Dashboard.vue';
import Products from './Products.vue';
import Categories from './Categories.vue';
import Logs from './Logs.vue';
import Settings from './Settings.vue';

const router = useRouter();
const adminStore = useAdminStore();

const tabs = [
  {id:'dash', n:'数据', i:'ri-dashboard-fill'},
  {id:'prod', n:'仓库', i:'ri-inbox-archive-fill'},
  {id:'cat',  n:'分类', i:'ri-folder-3-fill'},
  {id:'set',  n:'配置', i:'ri-settings-4-fill'},
  {id:'log',  n:'日志', i:'ri-file-paper-2-fill'}
];

const currentTabName = computed(() => {
  const t = tabs.find(x => x.id === adminStore.admin.tab);
  return t ? t.n : '管理';
});

onMounted(() => { if(adminStore.admin.pwd) adminStore.adminLogin(true); });
watch(() => adminStore.admin.tab, (newVal) => { if (newVal === 'log') adminStore.fetchLogs(); });

</script>