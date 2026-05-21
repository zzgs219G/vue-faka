<template>
  <div>
    <!-- 全局加载遮罩 -->
    <Transition name="fade">
      <div v-if="frontStore.globalLoading"
        class="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
        <div class="bg-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3">
          <i class="ri-loader-4-line animate-spin text-2xl text-blue-600"></i>
          <span class="font-bold text-slate-700 text-sm">系统处理中...</span>
        </div>
      </div>
    </Transition>

    <div v-if="frontStore.site.config.afterSales" @click="frontStore.showService = true"
      class="fixed bottom-6 right-6 z-40 bg-blue-600 text-white w-10 h-10 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:bg-blue-700 transition transform hover:scale-110 active:scale-95">
      <i class="ri-customer-service-2-fill text-lg md:text-2xl"></i>
    </div>

    <div v-if="frontStore.showService"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      @click.self="frontStore.showService = false">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in relative">
        <button @click="frontStore.showService = false"
          class="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 rounded-full w-8 h-8 transition"><i
            class="ri-close-line"></i></button>
        <div class="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="ri-customer-service-2-fill text-3xl"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">联系售后客服</h3>
        <p class="text-sm text-slate-500 mb-6">如遇提取问题或需要技术支持，请联系客服处理。</p>
        <div
          class="bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-slate-800 text-lg select-all mb-6">
          {{ frontStore.site.config.afterSales }}
        </div>
        <button @click="frontStore.copy(frontStore.site.config.afterSales)"
          class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition">复制联系方式</button>
      </div>
    </div>

    <!-- =============== 买家前台界面 =============== -->
    <div class="min-h-screen flex flex-col">
      <nav class="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-100">
        <div class="max-w-5xl mx-auto px-4 flex justify-between h-14 md:h-16 items-center">
          <div class="flex items-center cursor-pointer flex-shrink mr-2 min-w-0"
            @click="frontStore.frontTab = 'home'">
            <div
              class="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2 md:mr-3 shadow-md shadow-blue-200">
              <i class="ri-shopping-bag-3-fill text-white text-sm md:text-base"></i>
            </div>
            <span
              class="font-bold text-lg md:text-xl text-slate-800 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{{
              frontStore.site.config.siteName || '熠云发卡' }}</span>
          </div>
          <div class="flex space-x-1 flex-shrink-0">
            <button @click="frontStore.frontTab = 'home'"
              :class="frontStore.frontTab === 'home' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-100'"
              class="px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-xs md:text-sm font-bold transition whitespace-nowrap"><i
                class="ri-store-2-line mr-0.5 md:mr-1"></i>商城</button>
            <button @click="frontStore.frontTab = 'orders'"
              :class="frontStore.frontTab === 'orders' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-100'"
              class="px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-xs md:text-sm font-bold transition whitespace-nowrap"><i
                class="ri-file-list-3-line mr-0.5 md:mr-1"></i>订单</button>
            <router-link to="/admin"
              class="px-2 md:px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold text-slate-400 hover:text-slate-700 transition whitespace-nowrap"><i
                class="ri-shield-user-line"></i></router-link>
          </div>
        </div>
      </nav>

      <main class="flex-grow max-w-5xl w-full mx-auto px-3 py-4 md:px-4 md:py-8">
        <div v-if="frontStore.site.config.isOpen === false"
          class="bg-rose-50 text-rose-600 p-8 rounded-3xl text-center border border-rose-100 shadow-sm mb-6">
          <i class="ri-door-lock-box-line text-5xl block mb-3"></i>
          <h2 class="text-xl font-bold">站点正在维护中</h2>
          <p class="text-sm mt-2 opacity-80">站长暂时关闭了购买通道，请稍后再来。</p>
        </div>

        <template v-else>
          <Home />
          <Orders />
        </template>
      </main>
    </div>

    <!-- 订单查询结果弹窗 -->
    <Transition name="fade">
      <div v-if="frontStore.showOrderModal"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        @click.self="frontStore.showOrderModal = false">
        <div class="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 relative animate-fade-in">
          <button @click="frontStore.showOrderModal = false"
            class="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 rounded-full w-8 h-8 transition active:scale-90"><i
              class="ri-close-line"></i></button>

          <div class="text-center mb-6 mt-2">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
              :class="frontStore.queryRes.status === 'paid' ? 'bg-emerald-100 text-emerald-500' : (frontStore.queryRes.status === 'expired' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-500')">
              <i class="text-2xl"
                :class="frontStore.queryRes.status === 'paid' ? 'ri-check-line' : (frontStore.queryRes.status === 'expired' ? 'ri-close-line' : 'ri-time-line')"></i>
            </div>
            <h3 class="font-bold text-lg text-slate-800 leading-tight">{{ frontStore.queryRes.productName }}</h3>
            <div class="text-sm font-bold mt-1.5"
              :class="frontStore.queryRes.status === 'paid' ? 'text-emerald-600' : (frontStore.queryRes.status === 'expired' ? 'text-slate-500' : 'text-amber-600')">
              {{ frontStore.queryRes.status === 'paid' ? '交易已完成，货品已发卡' : (frontStore.queryRes.status === 'expired' ?
              '订单超时未付已关闭' : '订单已生成，等待付款中') }}
            </div>
          </div>

          <div class="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100 text-sm space-y-3">
            <div class="flex justify-between text-slate-500"><span>支付总额</span><span
                class="font-bold text-rose-500 text-base">¥{{ frontStore.queryRes.payPrice }}</span></div>
            <div class="flex justify-between text-slate-500"><span>创建时间</span><span>{{
              frontStore.formatRealTime(frontStore.queryRes.createTime) }}</span></div>
            <div class="flex justify-between text-slate-500 items-center">
              <span>系统单号</span>
              <span
                class="font-mono bg-white border border-slate-200 px-2 py-1 rounded cursor-pointer active:bg-slate-100 transition"
                @click="frontStore.copy(frontStore.queryRes.orderId)">{{ frontStore.queryRes.orderId }} <i
                  class="ri-file-copy-line text-blue-500"></i></span>
            </div>
          </div>

          <div v-if="frontStore.queryRes.status === 'paid'">
            <div class="text-xs text-emerald-600 font-bold mb-2 flex justify-between items-center">
              <span><i class="ri-key-2-fill mr-1"></i>数字卡密提取结果：</span>
              <span v-if="frontStore.queryRes.contact && frontStore.queryRes.contact.includes('@')"
                class="text-[10px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-600 whitespace-nowrap"><i
                  class="ri-mail-send-line"></i> 备份已发</span>
            </div>
            <div
              class="bg-slate-800 text-emerald-400 p-4 rounded-xl font-mono text-xs md:text-sm break-all select-all border border-slate-700 max-h-40 overflow-y-auto leading-relaxed shadow-inner">
              {{ frontStore.queryRes.card }}
            </div>
            <button @click="frontStore.copy(frontStore.queryRes.card)"
              class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex justify-center items-center active:scale-95">
              <i class="ri-file-copy-2-line mr-2"></i> 一键提取卡密内容
            </button>
          </div>

          <div v-if="frontStore.queryRes.status === 'pending'">
            <div
              class="bg-amber-50 text-amber-600 p-3 rounded-xl text-xs mb-4 border border-amber-100 leading-relaxed">
              系统为您锁定了当前库存与价格，请在倒计时结束前完成支付。
            </div>
            <button @click="frontStore.resumePayment"
              class="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-lg transition flex justify-center items-center active:scale-95">
              <i class="ri-wallet-3-line mr-2 text-lg"></i> 调出收银台，继续支付
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 收银台购买流程弹窗 -->
    <Transition name="fade">
      <div v-if="frontStore.buyUI.show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div
          class="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative">
          <button @click="frontStore.closeBuy"
            class="absolute top-4 right-4 bg-black/20 text-white hover:bg-black/40 rounded-full w-8 h-8 flex items-center justify-center z-30 transition backdrop-blur-md"><i
              class="ri-close-line"></i></button>

          <div v-if="frontStore.buyUI.step === 1" class="relative">
            <div v-if="frontStore.buyUI.showContactWarning"
              class="absolute inset-0 bg-white/95 backdrop-blur z-40 flex flex-col justify-center text-center p-6 rounded-[2rem]">
              <div
                class="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="ri-mail-star-fill text-3xl"></i>
              </div>
              <h3 class="text-lg font-bold text-slate-800 mb-2">强烈建议填写邮箱</h3>
              <p class="text-xs text-slate-500 mb-8 leading-relaxed">
                不填邮箱依然可以在网页直接获取卡密。<br>但填写后，系统会将卡密和订单号<strong
                  class="text-blue-500">永久备份至您的邮箱</strong>，防止遗失。</p>
              <button @click="frontStore.buyUI.showContactWarning = false"
                class="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl mb-3 shadow-lg hover:bg-blue-700 transition active:scale-95">返回填写
                (防丢失推荐)</button>
              <button @click="frontStore.buyUI.confirmNoContact = true; frontStore.doBuy()"
                class="w-full text-slate-500 font-bold py-3 hover:bg-slate-50 rounded-xl transition">不需要，直接付款</button>
            </div>

            <div class="h-40 md:h-48 bg-slate-50 relative mb-4 flex items-center justify-center">
              <img v-if="frontStore.buyUI.product.image" :src="frontStore.buyUI.product.image"
                class="w-full h-full object-cover" />
              <div v-else
                class="w-full h-full bg-blue-50 flex items-center justify-center border-b border-blue-100">
                <img v-if="frontStore.buyUI.product.icon" :src="frontStore.buyUI.product.icon"
                  class="w-20 h-20 rounded-2xl object-cover shadow-sm" />
                <i v-else class="ri-shopping-bag-3-fill text-5xl text-blue-300"></i>
              </div>
              <div
                class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
                <h3 class="text-white font-bold text-lg line-clamp-2 leading-snug">{{
                  frontStore.buyUI.product.name }}</h3>
              </div>
            </div>

            <div class="px-5 pb-5">
              <div class="flex justify-between items-center mb-3 border-b border-slate-100 pb-3">
                <div>
                  <div class="text-rose-500 font-black text-2xl tracking-tight leading-none mb-1"><span
                      class="text-sm font-normal mr-1">¥</span>{{ (parseFloat(frontStore.buyUI.product.price) +
                      parseFloat(frontStore.site.config.apiFee || 0)).toFixed(2) }}</div>
                  <div v-if="frontStore.site.config.apiFee > 0" class="text-[10px] text-slate-400">含商品
                    ¥{{ frontStore.buyUI.product.price }} + 手续费 ¥{{ frontStore.site.config.apiFee }}</div>
                </div>
                <div class="text-[10px] font-bold px-3 py-1.5 rounded-lg border"
                  :class="frontStore.buyUI.product.stock > 20 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'">
                  库存：{{ frontStore.getStockStatus(frontStore.buyUI.product.stock) }}
                </div>
              </div>

              <div class="mb-4">
                <div
                  class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">
                  {{ frontStore.buyUI.product.desc || '该商品暂无详细介绍。' }}</div>
              </div>

              <label class="text-xs font-bold text-slate-500 mb-2 flex justify-between"><span>接收邮箱
                  (选填，防丢备份)</span></label>
              <div class="relative mb-5">
                <i class="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input v-model="frontStore.buyUI.contact" placeholder="填写邮箱以便接收卡密备份"
                  class="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:border-blue-500 outline-none text-sm bg-slate-50 focus:bg-white transition shadow-sm" />
              </div>

              <button @click="frontStore.doBuy" :disabled="frontStore.buyUI.loading"
                class="w-full bg-slate-900 disabled:bg-slate-200 text-white font-bold py-3.5 rounded-2xl transition shadow-lg active:scale-95">
                <i v-if="frontStore.buyUI.loading" class="ri-loader-4-line animate-spin mr-2"></i> {{
                  frontStore.buyUI.loading ? '锁定金额中...' : '确认订单去付款' }}
              </button>
            </div>
          </div>

          <!-- 第二步收银台UI优化区 -->
          <div v-if="frontStore.buyUI.step === 2" class="p-5 md:p-6 text-center">
            <h3 class="font-black text-xl text-slate-800 mb-4">安全收银台</h3>

            <div
              class="bg-rose-50 border-2 border-rose-400 rounded-2xl pt-7 pb-6 mb-4 relative overflow-hidden shadow-lg shadow-rose-100 price-alert-anim">
              <div
                class="absolute top-0 left-0 w-full bg-rose-500 text-white text-sm md:text-base font-bold py-1 flex justify-center items-center tracking-widest shadow-sm">
                <i class="ri-time-line mr-1.5 text-lg"></i> 请在 {{ frontStore.formatTime(frontStore.buyUI.timeLeft)
                }} 内完成支付
              </div>
              <div class="text-sm md:text-base text-rose-600 font-bold mb-1 mt-3 tracking-wide"><i
                  class="ri-alarm-warning-fill mr-1 align-text-bottom"></i>付错金额将导致发货失败</div>
              <div
                class="text-4xl md:text-5xl font-black text-rose-600 flex justify-center items-baseline drop-shadow-sm tracking-tight mt-2">
                <span class="text-2xl md:text-3xl font-bold mr-1 opacity-80">¥</span><span>{{
                  frontStore.buyUI.order.payPrice }}</span>
                <button @click="frontStore.copy(frontStore.buyUI.order.payPrice)"
                  class="ml-3 text-rose-500 bg-rose-100 hover:bg-rose-200 hover:text-rose-700 w-10 h-10 md:w-12 md:h-12 rounded-full transition-all active:scale-90 shadow-sm flex items-center justify-center border border-rose-200 self-center"><i
                    class="ri-file-copy-line text-lg md:text-xl"></i></button>
              </div>
            </div>

            <div
              class="mb-5 text-left bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between shadow-sm">
              <div class="flex items-center w-full">
                <i class="ri-mail-check-line mr-2 text-slate-400 text-lg"></i>
                <div v-if="!frontStore.buyUI.editingContact" class="flex justify-between items-center w-full min-w-0">
                  <span class="text-xs md:text-sm font-mono text-slate-700 truncate mr-2">{{
                    frontStore.buyUI.order.contact || '未填邮箱 (建议补充防丢失)' }}</span>
                  <button
                    @click="frontStore.buyUI.editContactInput = frontStore.buyUI.order.contact; frontStore.buyUI.editingContact = true"
                    class="text-[10px] md:text-xs bg-white text-blue-600 hover:bg-blue-50 px-2 py-1 border border-blue-100 rounded-lg font-bold transition flex-shrink-0 shadow-sm">修改</button>
                </div>
                <div v-else class="flex items-center space-x-2 w-full">
                  <input v-model="frontStore.buyUI.editContactInput" placeholder="常用邮箱"
                    class="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs md:text-sm focus:border-blue-500 outline-none shadow-sm transition" />
                  <button @click="frontStore.updateOrderContact"
                    class="bg-blue-600 text-white text-xs font-bold px-2 py-1.5 rounded-lg shadow-sm hover:bg-blue-700 transition active:scale-95 flex-shrink-0">保存</button>
                  <button @click="frontStore.buyUI.editingContact = false"
                    class="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1.5 rounded-lg hover:bg-slate-300 transition active:scale-95 flex-shrink-0">取消</button>
                </div>
              </div>
            </div>

            <div class="flex justify-center mb-5">
              <div class="bg-slate-100 p-1 rounded-xl inline-flex space-x-1 shadow-inner w-full">
                <button @click="frontStore.buyUI.order.payMethod = 'alipay'"
                  :class="frontStore.buyUI.order.payMethod === 'alipay' ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-700'"
                  class="flex-1 py-2 md:py-2.5 rounded-lg text-sm md:text-base transition flex items-center justify-center active:scale-95">
                  <i class="ri-alipay-fill text-xl md:text-2xl mr-1.5"></i> 支付宝
                </button>
                <button @click="frontStore.buyUI.order.payMethod = 'wechat'"
                  :class="frontStore.buyUI.order.payMethod === 'wechat' ? 'bg-white shadow text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-700'"
                  class="flex-1 py-2 md:py-2.5 rounded-lg text-sm md:text-base transition flex items-center justify-center active:scale-95">
                  <i class="ri-wechat-pay-fill text-xl md:text-2xl mr-1.5"></i> 微信
                </button>
              </div>
            </div>

            <div v-if="frontStore.buyUI.order.payMethod === 'alipay'" class="animate-fade-in flex flex-col items-center">
              <a v-if="frontStore.site.config.alipayLink"
                :href="'alipays://platformapi/startapp?appId=20000067&url=' + encodeURIComponent(frontStore.site.config.alipayLink)"
                class="inline-flex items-center justify-center bg-[#1677ff] hover:bg-blue-600 text-white text-xs md:text-sm font-bold px-5 py-2.5 rounded-full shadow-md transition active:scale-95 mb-3"><i
                  class="ri-alipay-fill text-lg md:text-xl mr-1"></i>一键唤醒支付宝 APP 支付</a>
              <p v-else
                class="text-[10px] md:text-xs text-blue-600 mb-3 font-bold bg-blue-50 inline-block px-4 py-2 rounded-full border border-blue-100">
                <i class="ri-scan-2-line mr-1"></i>请扫码支付 或 截屏保存到相册扫一扫</p>

              <div
                class="w-40 md:w-48 p-2 border-2 border-blue-100 rounded-2xl bg-blue-50 shadow-sm mb-1 relative">
                <img v-if="frontStore.site.config.alipayQr" :src="frontStore.site.config.alipayQr"
                  class="w-full rounded-xl" alt="支付宝收款码" />
              </div>
            </div>

            <div v-if="frontStore.buyUI.order.payMethod === 'wechat'" class="animate-fade-in flex flex-col items-center">
              <p
                class="text-[10px] md:text-xs text-emerald-600 mb-3 font-bold bg-emerald-50 inline-block px-4 py-2 rounded-full border border-emerald-100">
                <i class="ri-scan-2-line mr-1"></i>请扫码支付 或 截屏保存到相册扫一扫</p>

              <div
                class="w-40 md:w-48 p-2 border-2 border-emerald-100 rounded-2xl bg-emerald-50 shadow-sm mb-1 relative">
                <img v-if="frontStore.site.config.wechatQr" :src="frontStore.site.config.wechatQr"
                  class="w-full rounded-xl" alt="微信收款码" />
              </div>
            </div>

            <div
              class="mt-5 md:mt-6 flex items-center justify-center space-x-2 text-blue-600 bg-blue-50 py-2.5 md:py-3 rounded-xl border border-blue-100">
              <i class="ri-radar-line animate-spin text-lg md:text-xl"></i><span
                class="text-xs md:text-sm font-bold tracking-wide">云端持续监听收款中...</span>
            </div>
          </div>

          <div v-if="frontStore.buyUI.step === 3" class="p-5 md:p-6 text-center mt-2 success-pop-anim">
            <div
              class="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-emerald-400 to-emerald-300 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(52,211,153,0.5)] border-4 border-emerald-100">
              <i class="ri-check-line text-5xl md:text-6xl font-black drop-shadow-md"></i>
            </div>
            <h3 class="text-2xl md:text-3xl font-black text-emerald-600 mb-1 tracking-tight">付款成功</h3>
            <p class="text-xs text-slate-400 font-mono mb-5">系统单号: {{ frontStore.buyUI.order.orderId }}</p>

            <div v-if="frontStore.buyUI.order.contact && frontStore.buyUI.order.contact.includes('@')"
              class="text-[10px] md:text-xs text-blue-600 bg-blue-50 py-2 px-3 rounded-xl font-bold mb-5 flex justify-center items-center mail-pulse border border-blue-100">
              <i class="ri-mail-send-fill mr-1.5 text-lg"></i> 备份已同步发送至您的邮箱，请查收！
            </div>

            <div class="relative mt-4 mb-8">
              <div
                class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-800 text-emerald-400 text-xs font-bold px-4 py-1.5 rounded-full border border-slate-700 z-10 whitespace-nowrap shadow-md flex items-center">
                <i class="ri-gift-2-line mr-1 text-base"></i> 您的发货内容已送达
              </div>
              <div
                class="bg-slate-900 border-4 border-slate-700 pt-8 pb-6 px-5 md:px-6 rounded-3xl font-mono text-base md:text-lg break-all text-emerald-300 shadow-inner max-h-56 overflow-y-auto select-all text-left leading-relaxed">
                {{ frontStore.buyUI.order.card }}
              </div>
            </div>

            <button @click="frontStore.copy(frontStore.buyUI.order.card)"
              class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg py-4 md:py-5 rounded-2xl shadow-[0_8px_20px_rgba(79,70,229,0.3)] mb-2 transition transform active:scale-95 flex justify-center items-center group">
              <i class="ri-file-copy-2-fill mr-2 text-2xl group-hover:scale-110 transition-transform"></i>
              一键提取发货内容
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="frontStore.toast.show"
      class="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] bg-slate-800 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center border border-slate-700 text-xs md:text-sm font-bold animate-fade-in transition-all whitespace-nowrap">
      <i :class="frontStore.toast.icon" class="mr-2 text-lg"></i> {{ frontStore.toast.msg }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useFrontStore } from './store';
import Home from './Home.vue';
import Orders from './Orders.vue';

const route = useRoute();
const frontStore = useFrontStore();

watch(() => frontStore.frontTab, (val) => { if (val === 'orders') frontStore.refreshLocalOrdersStatus(); });

onMounted(() => {
  const path = route.path.replace(/^\/+|\/+$/g, '');
  frontStore.loadSite(path);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') frontStore.fallbackCheckPaymentStatus(); });
  window.addEventListener('focus', () => frontStore.fallbackCheckPaymentStatus());
});

</script>