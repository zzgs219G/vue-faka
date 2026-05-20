<template>
<div>
    
    <!-- 全局加载遮罩 -->
    <Transition name="fade">
      <div v-if="globalLoading" class="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
        <div class="bg-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3">
          <i class="ri-loader-4-line animate-spin text-2xl text-blue-600"></i>
          <span class="font-bold text-slate-700 text-sm">系统处理中...</span>
        </div>
      </div>
    </Transition>

    <div v-if="site.config.afterSales" @click="showService = true" class="fixed bottom-6 right-6 z-40 bg-blue-600 text-white w-10 h-10 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:bg-blue-700 transition transform hover:scale-110 active:scale-95">
      <i class="ri-customer-service-2-fill text-lg md:text-2xl"></i>
    </div>
    
    <div v-if="showService" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" @click.self="showService = false">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in relative">
        <button @click="showService = false" class="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 rounded-full w-8 h-8 transition"><i class="ri-close-line"></i></button>
        <div class="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"><i class="ri-customer-service-2-fill text-3xl"></i></div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">联系售后客服</h3>
        <p class="text-sm text-slate-500 mb-6">如遇提取问题或需要技术支持，请联系客服处理。</p>
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-slate-800 text-lg select-all mb-6">
          {{ site.config.afterSales }}
        </div>
        <button @click="copy(site.config.afterSales)" class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition">复制联系方式</button>
      </div>
    </div>

    <!-- =============== 买家前台界面 =============== -->
    <div class="min-h-screen flex flex-col">
      <nav class="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-100">
        <div class="max-w-5xl mx-auto px-4 flex justify-between h-14 md:h-16 items-center">
          <div class="flex items-center cursor-pointer flex-shrink mr-2 min-w-0" @click="frontTab = 'home'">
            <div class="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2 md:mr-3 shadow-md shadow-blue-200">
              <i class="ri-shopping-bag-3-fill text-white text-sm md:text-base"></i>
            </div>
            <span class="font-bold text-lg md:text-xl text-slate-800 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{{ site.config.siteName || '熠云发卡' }}</span>
          </div>
          <div class="flex space-x-1 flex-shrink-0">
            <button @click="frontTab = 'home'" :class="frontTab==='home'?'text-blue-600 bg-blue-50':'text-slate-500 hover:bg-slate-100'" class="px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-xs md:text-sm font-bold transition whitespace-nowrap"><i class="ri-store-2-line mr-0.5 md:mr-1"></i>商城</button>
            <button @click="frontTab = 'orders'" :class="frontTab==='orders'?'text-blue-600 bg-blue-50':'text-slate-500 hover:bg-slate-100'" class="px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-xs md:text-sm font-bold transition whitespace-nowrap"><i class="ri-file-list-3-line mr-0.5 md:mr-1"></i>订单</button>
            <router-link to="/admin" class="px-2 md:px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold text-slate-400 hover:text-slate-700 transition whitespace-nowrap"><i class="ri-shield-user-line"></i></router-link>
          </div>
        </div>
      </nav>

      <main class="flex-grow max-w-5xl w-full mx-auto px-3 py-4 md:px-4 md:py-8">
        <div v-if="site.config.isOpen === false" class="bg-rose-50 text-rose-600 p-8 rounded-3xl text-center border border-rose-100 shadow-sm mb-6">
          <i class="ri-door-lock-box-line text-5xl block mb-3"></i>
          <h2 class="text-xl font-bold">站点正在维护中</h2>
          <p class="text-sm mt-2 opacity-80">站长暂时关闭了购买通道，请稍后再来。</p>
        </div>

        <template v-else>
          <!-- 商城首页 -->
          <div v-if="frontTab === 'home'">
            <div class="flex flex-col md:flex-row gap-3 mb-5">
              <div class="flex-grow bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2.5 rounded-xl md:rounded-2xl flex items-center shadow-sm min-w-0">
                <i class="ri-notification-badge-fill mr-2 md:mr-3 text-lg text-blue-500 flex-shrink-0"></i>
                <marquee scrollamount="4" class="text-xs md:text-sm font-medium whitespace-nowrap">{{ site.config.notice || '欢迎惠顾' }}</marquee>
              </div>
              <div class="relative md:w-64 flex-shrink-0">
                <i class="ri-search-line absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input v-model="searchKey" placeholder="搜索商品..." class="w-full pl-9 pr-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl text-xs md:text-sm focus:ring-2 ring-blue-100 outline-none transition shadow-sm"/>
              </div>
            </div>

            <div class="flex space-x-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
              <button v-if="!isExclusiveMode" @click="activeCat = 'all'" :class="activeCat==='all'?'bg-slate-800 text-white shadow-md':'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'" class="px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition active:scale-95">全部</button>
              <button v-for="c in site.categories" :key="c.id" v-show="!isExclusiveMode || activeCat === c.id" @click="activeCat = c.id" :class="activeCat===c.id?'bg-slate-800 text-white shadow-md':'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'" class="px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition active:scale-95">{{ c.name }}</button>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-5">
              <div v-if="filteredProducts.length === 0" class="col-span-full text-center py-20 bg-white rounded-2xl md:rounded-3xl border border-dashed border-slate-200">
                <i class="ri-ghost-line text-4xl text-slate-300 block mb-2"></i><span class="text-slate-400 text-sm">此分类下暂无商品</span>
              </div>
              
              <div v-for="p in filteredProducts" :key="p.id" class="bg-white rounded-xl p-3 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col relative group cursor-pointer shadow-sm" @click="p.stock>0 && openBuy(p)">
                <div v-if="p.stock <= 0" class="absolute top-0 right-0 bg-slate-400 text-white text-[9px] md:text-xs font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-xl z-10">售罄</div>
                
                <div class="flex items-center mb-3">
                  <div class="w-10 h-10 md:w-14 md:h-14 bg-blue-50 rounded-lg md:rounded-xl border border-blue-100 flex-shrink-0 flex items-center justify-center overflow-hidden mr-2 md:mr-3">
                     <img v-if="p.icon" :src="p.icon" class="w-full h-full object-cover"/>
                     <i v-else class="ri-shopping-bag-3-fill text-lg md:text-2xl text-blue-400"></i>
                  </div>
                  <div class="flex-grow min-w-0">
                    <h3 class="text-xs md:text-sm font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">{{ p.name }}</h3>
                  </div>
                </div>
                
                <div class="mt-auto border-t border-slate-50 pt-2 flex items-end justify-between">
                  <div>
                    <div class="text-sm md:text-lg font-black text-rose-500 tracking-tight"><span class="text-[9px] font-normal mr-0.5">¥</span>{{ p.price }}</div>
                    <div class="text-[9px] mt-0.5 font-bold" :class="p.stock>20?'text-emerald-500':(p.stock>5?'text-amber-500':'text-rose-400')">
                       <i class="ri-pulse-line align-middle"></i> {{ getStockStatus(p.stock) }}
                    </div>
                  </div>
                  <button @click.stop="openBuy(p)" :disabled="p.stock<=0" :class="p.stock>0?'bg-blue-600 hover:bg-blue-700 text-white shadow shadow-blue-200/50':'bg-slate-100 text-slate-400 cursor-not-allowed'" class="h-6 md:h-8 px-2.5 md:px-4 rounded-md md:rounded-lg font-bold text-[10px] md:text-sm transition transform active:scale-95 flex items-center justify-center whitespace-nowrap">
                    {{ p.stock>0 ? '购买' : '缺货' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 查单页面 -->
          <div v-if="frontTab === 'orders'" class="max-w-2xl mx-auto">
            <div class="bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-6 shadow-sm border border-slate-100">
              <div class="flex justify-between items-center mb-4 md:mb-6">
                <h2 class="text-lg md:text-xl font-black text-slate-800"><i class="ri-history-line mr-2 text-blue-500"></i>查单跟踪</h2>
              </div>
              
              <div class="relative mb-5 md:mb-6 flex space-x-2">
                <div class="relative flex-grow">
                  <i class="ri-hashtag absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input v-model="queryId" placeholder="输入单号查单" class="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 ring-blue-100 outline-none font-mono text-xs md:text-sm transition"/>
                </div>
                <button @click="doQuery(queryId)" class="bg-slate-800 hover:bg-slate-900 text-white px-4 md:px-6 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition shadow-md whitespace-nowrap active:scale-95">深度查询</button>
              </div>

              <div v-if="localOrders.length === 0" class="text-center py-10 md:py-16 text-slate-400 border-t border-dashed border-slate-100">
                 <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3"><i class="ri-file-unknow-line text-2xl text-slate-300"></i></div>
                 <span class="text-sm">暂无本地购买记录</span>
              </div>
              
              <div v-else class="space-y-2.5 md:space-y-3">
                 <div v-for="o in localOrders" :key="o.orderId" @click="doQuery(o.orderId)" class="bg-white hover:bg-slate-50 border border-slate-100 hover:border-blue-200 p-3 md:p-4 rounded-xl md:rounded-2xl cursor-pointer transition flex flex-col md:flex-row justify-between items-start md:items-center group shadow-sm">
                    <div class="overflow-hidden w-full md:flex-1 pr-0 md:pr-4 mb-2 md:mb-0">
                      <div class="font-bold text-slate-800 text-sm md:text-base truncate">{{ o.productName }}</div>
                      <div class="flex items-center text-[10px] md:text-xs text-slate-400 mt-1.5">
                        <span class="font-mono bg-slate-100 px-1.5 py-0.5 rounded mr-2 text-slate-500">{{ o.orderId }}</span>
                        <span>{{ formatRealTime(o.time) }}</span>
                      </div>
                    </div>
                    <div class="flex items-center justify-between w-full md:w-auto space-x-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-none border-slate-50">
                       <span v-if="o.status === 'paid'" class="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-bold whitespace-nowrap"><i class="ri-checkbox-circle-fill mr-0.5"></i> 已完成</span>
                       <span v-else-if="o.status === 'expired'" class="px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-xs font-bold whitespace-nowrap"><i class="ri-close-circle-fill mr-0.5"></i> 已超时</span>
                       <span v-else class="px-2.5 py-1 bg-amber-50 text-amber-500 border border-amber-100 rounded-lg text-xs font-bold whitespace-nowrap"><i class="ri-time-fill mr-0.5"></i> 待支付</span>
                       <div class="text-xs text-blue-500 font-bold flex items-center group-hover:translate-x-1 transition-transform">
                         详情 <i class="ri-arrow-right-s-line align-middle"></i>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>

    <!-- 订单查询结果弹窗 -->
    <Transition name="fade">
      <div v-if="showOrderModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" @click.self="showOrderModal = false">
        <div class="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 relative animate-fade-in">
          <button @click="showOrderModal = false" class="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 rounded-full w-8 h-8 transition active:scale-90"><i class="ri-close-line"></i></button>
          
          <div class="text-center mb-6 mt-2">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" :class="queryRes.status==='paid'?'bg-emerald-100 text-emerald-500':(queryRes.status==='expired'?'bg-slate-100 text-slate-500':'bg-amber-100 text-amber-500')">
               <i class="text-2xl" :class="queryRes.status==='paid'?'ri-check-line':(queryRes.status==='expired'?'ri-close-line':'ri-time-line')"></i>
            </div>
            <h3 class="font-bold text-lg text-slate-800 leading-tight">{{ queryRes.productName }}</h3>
            <div class="text-sm font-bold mt-1.5" :class="queryRes.status==='paid'?'text-emerald-600':(queryRes.status==='expired'?'text-slate-500':'text-amber-600')">
               {{ queryRes.status==='paid'?'交易已完成，货品已发卡':(queryRes.status==='expired'?'订单超时未付已关闭':'订单已生成，等待付款中') }}
            </div>
          </div>

          <div class="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100 text-sm space-y-3">
             <div class="flex justify-between text-slate-500"><span>支付总额</span><span class="font-bold text-rose-500 text-base">¥{{ queryRes.payPrice }}</span></div>
             <div class="flex justify-between text-slate-500"><span>创建时间</span><span>{{ formatRealTime(queryRes.createTime) }}</span></div>
             <div class="flex justify-between text-slate-500 items-center">
                <span>系统单号</span>
                <span class="font-mono bg-white border border-slate-200 px-2 py-1 rounded cursor-pointer active:bg-slate-100 transition" @click="copy(queryRes.orderId)">{{ queryRes.orderId }} <i class="ri-file-copy-line text-blue-500"></i></span>
             </div>
          </div>

          <div v-if="queryRes.status === 'paid'">
            <div class="text-xs text-emerald-600 font-bold mb-2 flex justify-between items-center">
              <span><i class="ri-key-2-fill mr-1"></i>数字卡密提取结果：</span>
              <span v-if="queryRes.contact && queryRes.contact.includes('@')" class="text-[10px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-600 whitespace-nowrap"><i class="ri-mail-send-line"></i> 备份已发</span>
            </div>
            <div class="bg-slate-800 text-emerald-400 p-4 rounded-xl font-mono text-xs md:text-sm break-all select-all border border-slate-700 max-h-40 overflow-y-auto leading-relaxed shadow-inner">
              {{ queryRes.card }}
            </div>
            <button @click="copy(queryRes.card)" class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex justify-center items-center active:scale-95">
               <i class="ri-file-copy-2-line mr-2"></i> 一键提取卡密内容
            </button>
          </div>

          <div v-if="queryRes.status === 'pending'">
            <div class="bg-amber-50 text-amber-600 p-3 rounded-xl text-xs mb-4 border border-amber-100 leading-relaxed">
              系统为您锁定了当前库存与价格，请在倒计时结束前完成支付。
            </div>
            <button @click="resumePayment" class="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-lg transition flex justify-center items-center active:scale-95">
               <i class="ri-wallet-3-line mr-2 text-lg"></i> 调出收银台，继续支付
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 收银台购买流程弹窗 -->
    <Transition name="fade">
      <div v-if="buyUI.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div class="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative">
          <button @click="closeBuy" class="absolute top-4 right-4 bg-black/20 text-white hover:bg-black/40 rounded-full w-8 h-8 flex items-center justify-center z-30 transition backdrop-blur-md"><i class="ri-close-line"></i></button>
          
          <div v-if="buyUI.step === 1" class="relative">
              <div v-if="buyUI.showContactWarning" class="absolute inset-0 bg-white/95 backdrop-blur z-40 flex flex-col justify-center text-center p-6 rounded-[2rem]">
                 <div class="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"><i class="ri-mail-star-fill text-3xl"></i></div>
                 <h3 class="text-lg font-bold text-slate-800 mb-2">强烈建议填写邮箱</h3>
                 <p class="text-xs text-slate-500 mb-8 leading-relaxed">不填邮箱依然可以在网页直接获取卡密。<br>但填写后，系统会将卡密和订单号<strong class="text-blue-500">永久备份至您的邮箱</strong>，防止遗失。</p>
                 <button @click="buyUI.showContactWarning = false" class="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl mb-3 shadow-lg hover:bg-blue-700 transition active:scale-95">返回填写 (防丢失推荐)</button>
                 <button @click="buyUI.confirmNoContact = true; doBuy()" class="w-full text-slate-500 font-bold py-3 hover:bg-slate-50 rounded-xl transition">不需要，直接付款</button>
              </div>

              <div class="h-40 md:h-48 bg-slate-50 relative mb-4 flex items-center justify-center">
                 <img v-if="buyUI.product.image" :src="buyUI.product.image" class="w-full h-full object-cover"/>
                 <div v-else class="w-full h-full bg-blue-50 flex items-center justify-center border-b border-blue-100">
                     <img v-if="buyUI.product.icon" :src="buyUI.product.icon" class="w-20 h-20 rounded-2xl object-cover shadow-sm"/>
                     <i v-else class="ri-shopping-bag-3-fill text-5xl text-blue-300"></i>
                 </div>
                 <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
                     <h3 class="text-white font-bold text-lg line-clamp-2 leading-snug">{{ buyUI.product.name }}</h3>
                 </div>
              </div>
              
              <div class="px-5 pb-5">
                <div class="flex justify-between items-center mb-3 border-b border-slate-100 pb-3">
                  <div>
                    <div class="text-rose-500 font-black text-2xl tracking-tight leading-none mb-1"><span class="text-sm font-normal mr-1">¥</span>{{ (parseFloat(buyUI.product.price) + parseFloat(site.config.apiFee || 0)).toFixed(2) }}</div>
                    <div v-if="site.config.apiFee > 0" class="text-[10px] text-slate-400">含商品 ¥{{buyUI.product.price}} + 手续费 ¥{{site.config.apiFee}}</div>
                  </div>
                  <div class="text-[10px] font-bold px-3 py-1.5 rounded-lg border" :class="buyUI.product.stock>20?'bg-emerald-50 text-emerald-600 border-emerald-100':'bg-amber-50 text-amber-600 border-amber-100'">
                     库存：{{ getStockStatus(buyUI.product.stock) }}
                  </div>
                </div>

                <div class="mb-4">
                  <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">{{ buyUI.product.desc || '该商品暂无详细介绍。' }}</div>
                </div>
                
                <label class="text-xs font-bold text-slate-500 mb-2 flex justify-between"><span>接收邮箱 (选填，防丢备份)</span></label>
                <div class="relative mb-5">
                  <i class="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input v-model="buyUI.contact" placeholder="填写邮箱以便接收卡密备份" class="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:border-blue-500 outline-none text-sm bg-slate-50 focus:bg-white transition shadow-sm"/>
                </div>
                
                <button @click="doBuy" :disabled="buyUI.loading" class="w-full bg-slate-900 disabled:bg-slate-200 text-white font-bold py-3.5 rounded-2xl transition shadow-lg active:scale-95">
                  <i v-if="buyUI.loading" class="ri-loader-4-line animate-spin mr-2"></i> {{ buyUI.loading ? '锁定金额中...' : '确认订单去付款' }}
                </button>
              </div>
          </div>

          <!-- 第二步收银台UI优化区 -->
          <div v-if="buyUI.step === 2" class="p-5 md:p-6 text-center">
              <h3 class="font-black text-xl text-slate-800 mb-4">安全收银台</h3>

              <div class="bg-rose-50 border-2 border-rose-400 rounded-2xl pt-7 pb-6 mb-4 relative overflow-hidden shadow-lg shadow-rose-100 price-alert-anim">
                 <div class="absolute top-0 left-0 w-full bg-rose-500 text-white text-sm md:text-base font-bold py-1 flex justify-center items-center tracking-widest shadow-sm">
                    <i class="ri-time-line mr-1.5 text-lg"></i> 请在 {{ formatTime(buyUI.timeLeft) }} 内完成支付
                 </div>
                 <div class="text-sm md:text-base text-rose-600 font-bold mb-1 mt-3 tracking-wide"><i class="ri-alarm-warning-fill mr-1 align-text-bottom"></i>付错金额将导致发货失败</div>
                 <div class="text-4xl md:text-5xl font-black text-rose-600 flex justify-center items-baseline drop-shadow-sm tracking-tight mt-2">
                   <span class="text-2xl md:text-3xl font-bold mr-1 opacity-80">¥</span><span>{{ buyUI.order.payPrice }}</span>
                   <button @click="copy(buyUI.order.payPrice)" class="ml-3 text-rose-500 bg-rose-100 hover:bg-rose-200 hover:text-rose-700 w-10 h-10 md:w-12 md:h-12 rounded-full transition-all active:scale-90 shadow-sm flex items-center justify-center border border-rose-200 self-center"><i class="ri-file-copy-line text-lg md:text-xl"></i></button>
                 </div>
              </div>
              
              <div class="mb-5 text-left bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between shadow-sm">
                  <div class="flex items-center w-full">
                      <i class="ri-mail-check-line mr-2 text-slate-400 text-lg"></i>
                      <div v-if="!buyUI.editingContact" class="flex justify-between items-center w-full min-w-0">
                         <span class="text-xs md:text-sm font-mono text-slate-700 truncate mr-2">{{ buyUI.order.contact || '未填邮箱 (建议补充防丢失)' }}</span>
                         <button @click="buyUI.editContactInput = buyUI.order.contact; buyUI.editingContact = true" class="text-[10px] md:text-xs bg-white text-blue-600 hover:bg-blue-50 px-2 py-1 border border-blue-100 rounded-lg font-bold transition flex-shrink-0 shadow-sm">修改</button>
                      </div>
                      <div v-else class="flex items-center space-x-2 w-full">
                         <input v-model="buyUI.editContactInput" placeholder="常用邮箱" class="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs md:text-sm focus:border-blue-500 outline-none shadow-sm transition"/>
                         <button @click="updateOrderContact" class="bg-blue-600 text-white text-xs font-bold px-2 py-1.5 rounded-lg shadow-sm hover:bg-blue-700 transition active:scale-95 flex-shrink-0">保存</button>
                         <button @click="buyUI.editingContact = false" class="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1.5 rounded-lg hover:bg-slate-300 transition active:scale-95 flex-shrink-0">取消</button>
                      </div>
                  </div>
              </div>

              <div class="flex justify-center mb-5">
                <div class="bg-slate-100 p-1 rounded-xl inline-flex space-x-1 shadow-inner w-full">
                  <button @click="buyUI.order.payMethod = 'alipay'" :class="buyUI.order.payMethod === 'alipay' ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-700'" class="flex-1 py-2 md:py-2.5 rounded-lg text-sm md:text-base transition flex items-center justify-center active:scale-95">
                    <i class="ri-alipay-fill text-xl md:text-2xl mr-1.5"></i> 支付宝
                  </button>
                  <button @click="buyUI.order.payMethod = 'wechat'" :class="buyUI.order.payMethod === 'wechat' ? 'bg-white shadow text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-700'" class="flex-1 py-2 md:py-2.5 rounded-lg text-sm md:text-base transition flex items-center justify-center active:scale-95">
                    <i class="ri-wechat-pay-fill text-xl md:text-2xl mr-1.5"></i> 微信
                  </button>
                </div>
              </div>

              <!-- 彻底美化版的支付宝UI，用唤醒按钮直接替换顶部的提示语文字 -->
              <div v-if="buyUI.order.payMethod === 'alipay'" class="animate-fade-in flex flex-col items-center">
                <a v-if="site.config.alipayLink" :href="'alipays://platformapi/startapp?appId=20000067&url=' + encodeURIComponent(site.config.alipayLink)" class="inline-flex items-center justify-center bg-[#1677ff] hover:bg-blue-600 text-white text-xs md:text-sm font-bold px-5 py-2.5 rounded-full shadow-md transition active:scale-95 mb-3"><i class="ri-alipay-fill text-lg md:text-xl mr-1"></i>一键唤醒支付宝 APP 支付</a>
                <p v-else class="text-[10px] md:text-xs text-blue-600 mb-3 font-bold bg-blue-50 inline-block px-4 py-2 rounded-full border border-blue-100"><i class="ri-scan-2-line mr-1"></i>请扫码支付 或 截屏保存到相册扫一扫</p>
                
                <div class="w-40 md:w-48 p-2 border-2 border-blue-100 rounded-2xl bg-blue-50 shadow-sm mb-1 relative">
                  <img v-if="site.config.alipayQr" :src="site.config.alipayQr" class="w-full rounded-xl" alt="支付宝收款码"/>
                </div>
              </div>

              <!-- 微信UI，保持相同的提示样式和对称感 -->
              <div v-if="buyUI.order.payMethod === 'wechat'" class="animate-fade-in flex flex-col items-center">
                <p class="text-[10px] md:text-xs text-emerald-600 mb-3 font-bold bg-emerald-50 inline-block px-4 py-2 rounded-full border border-emerald-100"><i class="ri-scan-2-line mr-1"></i>请扫码支付 或 截屏保存到相册扫一扫</p>
                
                <div class="w-40 md:w-48 p-2 border-2 border-emerald-100 rounded-2xl bg-emerald-50 shadow-sm mb-1 relative">
                  <img v-if="site.config.wechatQr" :src="site.config.wechatQr" class="w-full rounded-xl" alt="微信收款码"/>
                </div>
              </div>

              <div class="mt-5 md:mt-6 flex items-center justify-center space-x-2 text-blue-600 bg-blue-50 py-2.5 md:py-3 rounded-xl border border-blue-100">
                <i class="ri-radar-line animate-spin text-lg md:text-xl"></i><span class="text-xs md:text-sm font-bold tracking-wide">云端持续监听收款中...</span>
              </div>
          </div>

          <div v-if="buyUI.step === 3" class="p-5 md:p-6 text-center mt-2 success-pop-anim">
              <div class="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-emerald-400 to-emerald-300 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(52,211,153,0.5)] border-4 border-emerald-100"><i class="ri-check-line text-5xl md:text-6xl font-black drop-shadow-md"></i></div>
              <h3 class="text-2xl md:text-3xl font-black text-emerald-600 mb-1 tracking-tight">付款成功</h3>
              <p class="text-xs text-slate-400 font-mono mb-5">系统单号: {{ buyUI.order.orderId }}</p>
              
              <div v-if="buyUI.order.contact && buyUI.order.contact.includes('@')" class="text-[10px] md:text-xs text-blue-600 bg-blue-50 py-2 px-3 rounded-xl font-bold mb-5 flex justify-center items-center mail-pulse border border-blue-100">
                 <i class="ri-mail-send-fill mr-1.5 text-lg"></i> 备份已同步发送至您的邮箱，请查收！
              </div>
              
              <div class="relative mt-4 mb-8">
                 <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-800 text-emerald-400 text-xs font-bold px-4 py-1.5 rounded-full border border-slate-700 z-10 whitespace-nowrap shadow-md flex items-center">
                   <i class="ri-gift-2-line mr-1 text-base"></i> 您的发货内容已送达
                 </div>
                 <div class="bg-slate-900 border-4 border-slate-700 pt-8 pb-6 px-5 md:px-6 rounded-3xl font-mono text-base md:text-lg break-all text-emerald-300 shadow-inner max-h-56 overflow-y-auto select-all text-left leading-relaxed">
                   {{ buyUI.order.card }}
                 </div>
              </div>
              
              <button @click="copy(buyUI.order.card)" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg py-4 md:py-5 rounded-2xl shadow-[0_8px_20px_rgba(79,70,229,0.3)] mb-2 transition transform active:scale-95 flex justify-center items-center group">
                 <i class="ri-file-copy-2-fill mr-2 text-2xl group-hover:scale-110 transition-transform"></i> 一键提取发货内容
              </button>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="toast.show" class="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] bg-slate-800 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center border border-slate-700 text-xs md:text-sm font-bold animate-fade-in transition-all whitespace-nowrap">
      <i :class="toast.icon" class="mr-2 text-lg"></i> {{ toast.msg }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const toast = reactive({ show: false, msg: '', icon: '' });
const showToast = (msg, type='info') => {
  toast.msg = msg;
  toast.icon = type==='success'?'ri-checkbox-circle-fill text-emerald-400':(type==='error'?'ri-close-circle-fill text-rose-400':'ri-information-fill text-blue-400');
  toast.show = true; setTimeout(() => toast.show = false, 3000);
};

const globalLoading = ref(false);

const api = async (path, opts={}) => {
  try {
    const fetchOpts = { ...opts };
    if (!fetchOpts.method || fetchOpts.method === 'GET') {
       fetchOpts.headers = { ...fetchOpts.headers, 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' };
    }
    const res = await fetch(path, fetchOpts);
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || '请求失败，请检查网络或配置');
    return data;
  } catch(e) { showToast(e.message, 'error'); throw e; }
};

const copy = (txt) => { navigator.clipboard.writeText(txt).then(()=>showToast('内容已复制到剪贴板','success')).catch(()=>showToast('复制失败，请手动选择','error')); };
const formatTime = (ms) => {
    if(ms<=0) return "00:00";
    const s=Math.floor(ms/1000); return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
};
const formatRealTime = (ts) => {
    const d = new Date(ts);
    return `${d.getFullYear().toString().slice(-2)}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
};
const getStockStatus = (stock) => {
    if (stock <= 0) return '售罄'; if (stock <= 5) return '紧张'; if (stock <= 20) return '少量'; return '充足';
};

const frontTab = ref('home');
const site = reactive({ config: {}, categories: [], products: [] });
const activeCat = ref('all');
const isExclusiveMode = ref(false);

const searchKey = ref('');
const showService = ref(false);
const showOrderModal = ref(false);
const queryId = ref('');
const queryRes = ref(null);

const buyUI = reactive({
    show: false, step: 1, product: null, contact: '', payMethod: 'alipay', order: null,
    loading: false, timer: null, countDownTimer: null, sseSource: null, timeLeft: 0, showContactWarning: false, confirmNoContact: false,
    editingContact: false, editContactInput: ''
});

let localOrdersStr = localStorage.getItem('v_orders') || '[]';
let rawOrders = JSON.parse(localOrdersStr);
rawOrders = rawOrders.filter(o => (Date.now() - o.time) < 86400000);
const localOrders = ref(rawOrders);
localStorage.setItem('v_orders', JSON.stringify(localOrders.value));

const saveLocalOrder = (orderId, productName) => {
   if(!localOrders.value.find(o => o.orderId === orderId)) {
     localOrders.value.unshift({ orderId, productName, time: Date.now(), status: 'pending' });
     if(localOrders.value.length > 20) localOrders.value.pop();
     localStorage.setItem('v_orders', JSON.stringify(localOrders.value));
   }
};

const loadSite = async () => {
  const d = await api('/api/public');
  site.config = d.config; site.categories = d.categories; site.products = d.products;

  const path = route.path.replace(/^\/+|\/+$/g, '');

  if (path && path !== 'admin' && path !== 'admin.html' && path !== '') {
    const matchedCat = site.categories.find(c => c.id === path);
    if (matchedCat) {
      activeCat.value = matchedCat.id;
      isExclusiveMode.value = matchedCat.isExclusive === true;
      document.title = `${matchedCat.name} - ${site.config.siteName || '发卡网'}`;
      return;
    }
  }
  document.title = site.config.siteName || '发卡网';
};

const refreshLocalOrdersStatus = async () => {
  let updated = false;
  for (let o of localOrders.value) {
    if (o.status !== 'paid' && o.status !== 'expired') {
       try {
         const res = await api('/api/order/check?orderId=' + o.orderId + '&t=' + Date.now());
         if (res && res.status) { o.status = res.status; updated = true; }
       } catch(e){}
    }
  }
  if (updated) localStorage.setItem('v_orders', JSON.stringify(localOrders.value));
};

watch(frontTab, (val) => { if (val === 'orders') refreshLocalOrdersStatus(); });

const clearAllTimers = () => {
   if (buyUI.timer) clearInterval(buyUI.timer);
   if (buyUI.countDownTimer) clearInterval(buyUI.countDownTimer);
   if (buyUI.sseSource) { buyUI.sseSource.close(); buyUI.sseSource = null; }
   buyUI.timer = null; buyUI.countDownTimer = null;
};

const fallbackCheckPaymentStatus = async () => {
  if (!buyUI.show || buyUI.step !== 2 || !buyUI.order) return;
  try {
    const chk = await api('/api/order/check?orderId=' + buyUI.order.orderId + '&t=' + Date.now());
    if (chk && chk.status === 'paid') {
       clearAllTimers(); buyUI.order.card = chk.card; buyUI.step = 3;
       showToast('交易支付成功！','success'); refreshLocalOrdersStatus();
    } else if (chk && chk.status === 'expired') {
       clearAllTimers(); showToast('订单已超时关闭','error'); closeBuy();
    } else if (chk && chk.status === 'pending') {
       if (!buyUI.sseSource && !buyUI.timer) buyUI.timer = setTimeout(fallbackCheckPaymentStatus, 3000);
    }
  } catch(e) {}
};

const startSSEListener = (orderId) => {
    if (buyUI.sseSource) buyUI.sseSource.close();

    if (typeof EventSource === "undefined") {
         buyUI.timer = setInterval(fallbackCheckPaymentStatus, 3000);
         return;
    }

    buyUI.sseSource = new EventSource('/api/order/stream?orderId=' + orderId);

    buyUI.sseSource.addEventListener('status', (e) => {
        try {
            const data = JSON.parse(e.data);
            if (data.status === 'paid') {
               clearAllTimers(); buyUI.order.card = data.card; buyUI.step = 3;
               showToast('交易支付成功！','success'); refreshLocalOrdersStatus();
            } else if (data.status === 'expired') {
               clearAllTimers(); showToast('订单已超时关闭','error'); closeBuy();
            }
        } catch(err) {}
    });

    buyUI.sseSource.addEventListener('not_found', () => {
        clearAllTimers(); showToast('订单不存在或已被清理','error'); closeBuy();
    });

    buyUI.sseSource.onerror = () => {
        if (buyUI.sseSource) buyUI.sseSource.close();
        if (buyUI.show && buyUI.step === 2) {
           setTimeout(fallbackCheckPaymentStatus, 2000);
        }
    };
};

onMounted(() => {
   loadSite();
   document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') fallbackCheckPaymentStatus(); });
   window.addEventListener('focus', () => fallbackCheckPaymentStatus());
});

const filteredProducts = computed(() => {
  let arr = site.products.filter(p => !p.isHidden);

  if(activeCat.value !== 'all') arr = arr.filter(p => p.categoryId === activeCat.value);
  if(searchKey.value) {
      const k = searchKey.value.toLowerCase();
      arr = arr.filter(p => p.name.toLowerCase().includes(k) || (p.desc && p.desc.toLowerCase().includes(k)));
  }
  return arr;
});

const openBuy = (p) => {
    buyUI.product=p; buyUI.contact=''; buyUI.payMethod='alipay'; buyUI.step=1; buyUI.show=true;
    buyUI.showContactWarning=false; buyUI.confirmNoContact=false; buyUI.editingContact=false;
};
const closeBuy = () => { buyUI.show=false; clearAllTimers(); if(buyUI.step===3) loadSite(); };

const doBuy = async () => {
  if(!buyUI.contact && !buyUI.confirmNoContact) { buyUI.showContactWarning = true; return; }
  buyUI.showContactWarning = false; buyUI.loading = true;
  try {
    const order = await api('/api/order/create', { method:'POST', body: JSON.stringify({productId: buyUI.product.id, contact: buyUI.contact, payMethod: buyUI.payMethod})});
    buyUI.order = order; buyUI.step = 2; buyUI.timeLeft = (order.frontendExpireTime || order.expireTime) - Date.now();
    saveLocalOrder(order.orderId, buyUI.product.name);

    clearAllTimers();
    buyUI.countDownTimer = setInterval(() => {
        buyUI.timeLeft -= 1000;
        if(buyUI.timeLeft <= 0) { clearAllTimers(); showToast("支付超时，金额已释放", "error"); closeBuy(); refreshLocalOrdersStatus(); }
    }, 1000);
    startSSEListener(order.orderId);
  } catch(e) {
  } finally { buyUI.loading = false; }
};

const updateOrderContact = async () => {
   if(!buyUI.editContactInput) return;
   try {
     globalLoading.value = true;
     await api('/api/order/updateContact', { method: 'POST', body: JSON.stringify({ orderId: buyUI.order.orderId, contact: buyUI.editContactInput })});
     buyUI.order.contact = buyUI.editContactInput;
     buyUI.editingContact = false;
     showToast('邮箱已安全更新', 'success');
   } catch(e) {
   } finally { globalLoading.value = false; }
};

const doQuery = async (id) => {
  if(!id) return;
  globalLoading.value = true;
  try {
    const d = await api('/api/order/check?orderId=' + id.trim() + '&t=' + Date.now());
    if(d.status === 'not_found') { showToast('查无此单记录，请检查单号','error'); }
    else {
       queryRes.value = d; showOrderModal.value = true;
       const lo = localOrders.value.find(x => x.orderId === id.trim());
       if(lo) { lo.status = d.status; localStorage.setItem('v_orders', JSON.stringify(localOrders.value)); }
    }
  } finally { globalLoading.value = false; }
};

const resumePayment = () => {
  showOrderModal.value = false;
  const left = (queryRes.value.frontendExpireTime || queryRes.value.expireTime) - Date.now();
  if (left <= 0 || queryRes.value.status === 'expired') {
     showToast('该订单已超时失效，金额已释放请重新下单', 'error');
     queryRes.value.status = 'expired'; refreshLocalOrdersStatus(); return;
  }
  buyUI.order = queryRes.value; buyUI.step = 2; buyUI.timeLeft = left; buyUI.show = true; buyUI.editingContact = false;

  clearAllTimers();
  buyUI.countDownTimer = setInterval(() => {
      buyUI.timeLeft -= 1000;
      if(buyUI.timeLeft <= 0) { clearAllTimers(); showToast("支付超时，订单关闭", "error"); closeBuy(); refreshLocalOrdersStatus(); }
  }, 1000);
  startSSEListener(queryRes.value.orderId);
};

</script>
