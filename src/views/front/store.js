import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';

export const useFrontStore = defineStore('front', () => {
  const globalLoading = ref(false);
  const toast = reactive({ show: false, msg: '', icon: '' });

  const showToast = (msg, type = 'info') => {
    toast.msg = msg;
    toast.icon = type === 'success' ? 'ri-checkbox-circle-fill text-emerald-400' : (type === 'error' ? 'ri-close-circle-fill text-rose-400' : 'ri-information-fill text-blue-400');
    toast.show = true;
    setTimeout(() => toast.show = false, 3000);
  };

  const copy = (txt) => {
    navigator.clipboard.writeText(txt).then(() => showToast('内容已复制到剪贴板', 'success')).catch(() => showToast('复制失败，请手动选择', 'error'));
  };

  const formatTime = (ms) => {
    if (ms <= 0) return "00:00";
    const s = Math.floor(ms / 1000); return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const formatRealTime = (ts) => {
    const d = new Date(ts);
    return `${d.getFullYear().toString().slice(-2)}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return '售罄'; if (stock <= 5) return '紧张'; if (stock <= 20) return '少量'; return '充足';
  };

  const api = async (path, opts = {}) => {
    try {
      const fetchOpts = { ...opts };
      if (!fetchOpts.method || fetchOpts.method === 'GET') {
        fetchOpts.headers = { ...fetchOpts.headers, 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' };
      }
      const res = await fetch(path, fetchOpts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '请求失败，请检查网络或配置');
      return data;
    } catch (e) {
      showToast(e.message, 'error');
      throw e;
    }
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
    if (!localOrders.value.find(o => o.orderId === orderId)) {
      localOrders.value.unshift({ orderId, productName, time: Date.now(), status: 'pending' });
      if (localOrders.value.length > 20) localOrders.value.pop();
      localStorage.setItem('v_orders', JSON.stringify(localOrders.value));
    }
  };

  const loadSite = async (path) => {
    const d = await api('/api/public');
    site.config = d.config; site.categories = d.categories; site.products = d.products;

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
    const pendingOrders = localOrders.value.filter(o => o.status !== 'paid' && o.status !== 'expired');
    if (pendingOrders.length === 0) return;

    const orderIds = pendingOrders.map(o => o.orderId);
    try {
      const res = await api('/api/order/checkBatch', {
        method: 'POST',
        body: JSON.stringify({ orderIds })
      });

      let updated = false;
      for (let o of pendingOrders) {
        if (res[o.orderId] && res[o.orderId] !== o.status) {
          o.status = res[o.orderId];
          updated = true;
        }
      }

      if (updated) localStorage.setItem('v_orders', JSON.stringify(localOrders.value));
    } catch (e) { }
  };

  const clearAllTimers = () => {
    if (buyUI.timer) clearTimeout(buyUI.timer);
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
        showToast('交易支付成功！', 'success'); refreshLocalOrdersStatus();
      } else if (chk && chk.status === 'expired') {
        clearAllTimers(); showToast('订单已超时关闭', 'error'); closeBuy();
      } else if (chk && chk.status === 'pending') {
        if (!buyUI.sseSource) {
          if (buyUI.timer) clearTimeout(buyUI.timer);
          buyUI.timer = setTimeout(fallbackCheckPaymentStatus, 3000);
        }
      }
    } catch (e) { }
  };

  const startSSEListener = (orderId) => {
    if (buyUI.sseSource) buyUI.sseSource.close();

    if (typeof EventSource === "undefined") {
      if (buyUI.timer) clearTimeout(buyUI.timer);
      buyUI.timer = setTimeout(fallbackCheckPaymentStatus, 3000);
      return;
    }

    buyUI.sseSource = new EventSource('/api/order/stream?orderId=' + orderId);

    buyUI.sseSource.addEventListener('status', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.status === 'paid') {
          clearAllTimers(); buyUI.order.card = data.card; buyUI.step = 3;
          showToast('交易支付成功！', 'success'); refreshLocalOrdersStatus();
        } else if (data.status === 'expired') {
          clearAllTimers(); showToast('订单已超时关闭', 'error'); closeBuy();
        }
      } catch (err) { }
    });

    buyUI.sseSource.addEventListener('not_found', () => {
      clearAllTimers(); showToast('订单不存在或已被清理', 'error'); closeBuy();
    });

    buyUI.sseSource.onerror = () => {
      if (buyUI.sseSource) buyUI.sseSource.close();
      if (buyUI.show && buyUI.step === 2) {
        if (buyUI.timer) clearTimeout(buyUI.timer);
        buyUI.timer = setTimeout(fallbackCheckPaymentStatus, 2000);
      }
    };
  };

  const filteredProducts = computed(() => {
    let arr = site.products.filter(p => !p.isHidden);

    if (activeCat.value !== 'all') arr = arr.filter(p => p.categoryId === activeCat.value);
    if (searchKey.value) {
      const k = searchKey.value.toLowerCase();
      arr = arr.filter(p => p.name.toLowerCase().includes(k) || (p.desc && p.desc.toLowerCase().includes(k)));
    }
    return arr;
  });

  const openBuy = (p) => {
    buyUI.product = p; buyUI.contact = ''; buyUI.payMethod = ''; buyUI.step = 1; buyUI.show = true;
    buyUI.showContactWarning = false; buyUI.confirmNoContact = false; buyUI.editingContact = false;
  };

  const closeBuy = () => { buyUI.show = false; clearAllTimers(); if (buyUI.step === 3) loadSite(); };

  const doBuy = async () => {
    
    if (!buyUI.contact && !buyUI.confirmNoContact) { buyUI.showContactWarning = true; return; }
    buyUI.showContactWarning = false; buyUI.loading = true;
    try {
      const order = await api('/api/order/create', { method: 'POST', body: JSON.stringify({ productId: buyUI.product.id, contact: buyUI.contact, payMethod: buyUI.payMethod }) });
      buyUI.order = order; buyUI.step = 2; buyUI.timeLeft = (order.frontendExpireTime || order.expireTime) - Date.now();
      saveLocalOrder(order.orderId, buyUI.product.name);

      clearAllTimers();
      buyUI.countDownTimer = setInterval(() => {
        buyUI.timeLeft -= 1000;
        if (buyUI.timeLeft <= 0) { clearAllTimers(); showToast("支付超时，金额已释放", "error"); closeBuy(); refreshLocalOrdersStatus(); }
      }, 1000);
      startSSEListener(order.orderId);
    } catch (e) {
    } finally { buyUI.loading = false; }
  };

  const updateOrderContact = async () => {
    if (!buyUI.editContactInput) return;
    try {
      globalLoading.value = true;
      await api('/api/order/updateContact', { method: 'POST', body: JSON.stringify({ orderId: buyUI.order.orderId, contact: buyUI.editContactInput }) });
      buyUI.order.contact = buyUI.editContactInput;
      buyUI.editingContact = false;
      showToast('邮箱已安全更新', 'success');
    } catch (e) {
    } finally { globalLoading.value = false; }
  };

  const doQuery = async (id) => {
    if (!id) return;
    globalLoading.value = true;
    try {
      const d = await api('/api/order/check?orderId=' + id.trim() + '&t=' + Date.now());
      if (d.status === 'not_found') { showToast('查无此单记录，请检查单号', 'error'); }
      else {
        queryRes.value = d; showOrderModal.value = true;
        const lo = localOrders.value.find(x => x.orderId === id.trim());
        if (lo) { lo.status = d.status; localStorage.setItem('v_orders', JSON.stringify(localOrders.value)); }
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
      if (buyUI.timeLeft <= 0) { clearAllTimers(); showToast("支付超时，订单关闭", "error"); closeBuy(); refreshLocalOrdersStatus(); }
    }, 1000);
    startSSEListener(queryRes.value.orderId);
  };

  return {
    globalLoading, toast, showToast, copy, formatTime, formatRealTime, getStockStatus, api,
    frontTab, site, activeCat, isExclusiveMode, searchKey, showService, showOrderModal, queryId, queryRes,
    buyUI, localOrders, saveLocalOrder, loadSite, refreshLocalOrdersStatus, clearAllTimers, fallbackCheckPaymentStatus,
    startSSEListener, filteredProducts, openBuy, closeBuy, doBuy, updateOrderContact, doQuery, resumePayment
  };
});
