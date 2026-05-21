import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

export const useAdminStore = defineStore('admin', () => {
  const globalLoading = ref(false);

  const showToast = (msg, type = 'success') => {
    ElMessage.closeAll();
    ElMessage({ message: msg, type: type, duration: 2000, grouping: true });
  };

  const copyText = (txt) => {
    navigator.clipboard.writeText(txt).then(() => {
      showToast('已复制到剪贴板');
    }).catch(() => {
      showToast('复制失败，请手动选择', 'error');
    });
  };

  const api = async (path, opts = {}) => {
    globalLoading.value = true;
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
    } finally {
      globalLoading.value = false;
    }
  };

  const formatRealTime = (ts) => {
    const d = new Date(ts);
    return `${d.getFullYear().toString().slice(-2)}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  const admin = reactive({ logged: false, pwd: localStorage.getItem('v_pwd') || '', tab: 'dash' });

  const dashData = reactive({ stats: {}, recentOrders: [] });
  const adminData = reactive({ config: {}, categories: [], products: [] });
  const systemLogs = ref([]);
  const adminSearchKey = ref('');
  const reqOpts = () => ({ headers: { 'Authorization': admin.pwd, 'Content-Type': 'application/json' } });

  const fetchLogs = async () => {
    try { systemLogs.value = await api('/api/admin/logs?t=' + Date.now(), reqOpts()); } catch (e) { }
  };

  const adminLogin = async (isSilent = false) => {
    if (!admin.pwd) return;
    try {
      const d1 = await api('/api/admin/data?t=' + Date.now(), reqOpts());
      adminData.config = d1.config; adminData.categories = d1.categories; adminData.products = d1.products;

      adminData.config.apiFee = parseFloat(adminData.config.apiFee || 0);

      const d2 = await api('/api/admin/dashboard?t=' + Date.now(), reqOpts());
      dashData.stats = d2.stats; dashData.recentOrders = d2.recentOrders;
      admin.logged = true; localStorage.setItem('v_pwd', admin.pwd);
      if (admin.tab === 'log') fetchLogs();
      if (!isSilent) showToast('系统授权接入成功');
    } catch (e) {
      admin.logged = false; localStorage.removeItem('v_pwd'); admin.pwd = '';
      if (!isSilent) showToast('主控密码验证失败', 'error');
    }
  };
  const adminLogout = () => { admin.logged = false; admin.pwd = ''; localStorage.removeItem('v_pwd'); };

  const adminFilteredProducts = computed(() => {
    if (!adminSearchKey.value) return adminData.products;
    const key = adminSearchKey.value.toLowerCase();
    return adminData.products.filter(p => p.name.toLowerCase().includes(key) || p.id.toLowerCase().includes(key));
  });

  const groupedProducts = computed(() => {
    const groups = {};
    adminData.categories.forEach(c => { groups[c.id] = { name: c.name, products: [] }; });
    groups['default'] = { name: '未分类商品', products: [] };

    adminFilteredProducts.value.forEach(p => {
      const cid = p.categoryId || 'default';
      if (!groups[cid]) groups[cid] = { name: '未知分类', products: [] };
      groups[cid].products.push(p);
    });

    return Object.keys(groups)
      .map(id => ({ id, name: groups[id].name, products: groups[id].products }))
      .filter(g => g.products.length > 0);
  });

  const showCatModal = ref(false);
  const editCatForm = reactive({ index: -1, id: '', name: '', isExclusive: false });

  const openEditCat = (c, idx) => {
    editCatForm.index = idx;
    editCatForm.id = c.id;
    editCatForm.name = c.name;
    editCatForm.isExclusive = c.isExclusive === true;
    showCatModal.value = true;
  };

  const doSaveEditCat = () => {
    if (!editCatForm.id || !editCatForm.name) return showToast('标识和名称不能为空', 'warning');
    adminData.categories[editCatForm.index] = {
      id: editCatForm.id,
      name: editCatForm.name,
      isExclusive: editCatForm.isExclusive
    };
    showCatModal.value = false;
    showToast('修改已暂存，记得点云端同步哦');
  };

  const cardModal = reactive({ show: false, orderId: '', cardContent: '' });
  const viewCard = (o) => { cardModal.orderId = o.orderId; cardModal.cardContent = o.card || '未找到实体卡密数据'; cardModal.show = true; };

  const reissueOrder = async (order) => {
    try {
      await ElMessageBox.confirm(`即将为单号\n${order.orderId}\n执行人工补单发货。该操作会扣除仓储库存一件！确认执行吗？`, '强制补单', {
        confirmButtonText: '确定补发',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
        customClass: 'mobile-message-box'
      });

      await api('/api/admin/order/reissue', { method: 'POST', body: JSON.stringify({ orderId: order.orderId }), ...reqOpts() });
      showToast('干预成功！已发货');
      adminLogin(true);
    } catch (e) { }
  };

  const newCat = reactive({ id: '', name: '', isExclusive: false });
  const doAddCat = () => {
    if (!newCat.id || !newCat.name) { showToast('请填写完整的分类信息', 'warning'); return; }
    adminData.categories.push({ ...newCat });
    newCat.id = ''; newCat.name = ''; newCat.isExclusive = false;
    showToast('已暂存列表，记得点云端同步');
  };

  const doDelCat = async (idx) => {
    const catName = adminData.categories[idx].name;
    try {
      await ElMessageBox.confirm(`确定要移除分类【${catName}】吗？内部商品会自动变为未分类状态。`, '移除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'error',
        center: true
      });
      adminData.categories.splice(idx, 1);
      showToast('已移除，记得点云端同步');
    } catch (e) { }
  };

  const doSaveCats = async () => {
    await api('/api/admin/categories', { method: 'POST', body: JSON.stringify(adminData.categories), ...reqOpts() });
    showToast('分类结构已同步云端');
  };
  const doSaveConfig = async () => {
    const payload = { ...adminData.config, apiFee: adminData.config.apiFee.toString() };
    await api('/api/admin/config', { method: 'POST', body: JSON.stringify(payload), ...reqOpts() });
    showToast('核心配置已成功生效');
  };

  const showProdModal = ref(false);
  const pForm = reactive({ id: '', name: '', categoryId: 'default', price: 0, desc: '', icon: '', image: '', isHidden: false });

  const openAddProd = () => {
    pForm.id = ''; pForm.name = ''; pForm.categoryId = adminData.categories.length > 0 ? adminData.categories[0].id : 'default';
    pForm.price = 0; pForm.desc = ''; pForm.icon = ''; pForm.image = '';
    pForm.isHidden = false;
    showProdModal.value = true;
  };

  const openEditProd = (p) => {
    pForm.id = p.id; pForm.name = p.name; pForm.categoryId = p.categoryId || 'default';
    pForm.price = parseFloat(p.price); pForm.desc = p.desc; pForm.icon = p.icon || ''; pForm.image = p.image || '';
    pForm.isHidden = p.isHidden || false;
    showProdModal.value = true;
  };

  const doSaveProd = async () => {
    if (!pForm.name || pForm.name.trim() === '' || isNaN(pForm.price)) {
      return showToast('商品名称和有效金额为必填项', 'warning');
    }
    const payload = { ...pForm, price: pForm.price.toFixed(2) };
    await api('/api/admin/product', { method: 'POST', body: JSON.stringify(payload), ...reqOpts() });
    showToast('商品档案保存成功');
    showProdModal.value = false;
    adminLogin(true);
  };

  const doDelProd = async (id) => {
    try {
      await ElMessageBox.confirm('这将会永久销毁该商品及剩余卡密，且无法恢复！是否继续？', '危险警告', {
        confirmButtonText: '确定销毁',
        cancelButtonText: '取消',
        type: 'error',
        center: true
      });
      await api('/api/admin/product', { method: 'DELETE', body: JSON.stringify({ id }), ...reqOpts() });
      showToast('商品已彻底抹除');
      showProdModal.value = false;
      adminLogin(true);
    } catch (e) { }
  };

  const showCardsModal = ref(false);
  const cForm = reactive({ id: '', name: '', text: '' });

  const openCardsModal = (p) => {
    cForm.id = p.id; cForm.name = p.name; cForm.text = ''; showCardsModal.value = true;
  };

  const doSubmitCards = async (mode) => {
    if (!cForm.text.trim()) return showToast('卡密导入内容不能为空', 'warning');

    if (mode === 'replace') {
      try {
        await ElMessageBox.confirm('这会直接销毁该商品当前所有的未售卡密并替换为新内容！确认吗？', '确认覆盖', {
          confirmButtonText: '暴力覆盖',
          cancelButtonText: '手滑了',
          type: 'error',
          center: true
        });
      } catch (e) { return; }
    }

    await api('/api/admin/cards', { method: 'POST', body: JSON.stringify({ id: cForm.id, cardStr: cForm.text, mode }), ...reqOpts() });
    showToast('库存卡密更新完毕');
    showCardsModal.value = false;
    adminLogin(true);
  };

  return {
    globalLoading, showToast, copyText, api, formatRealTime, admin, dashData, adminData, systemLogs,
    adminSearchKey, reqOpts, fetchLogs, adminLogin, adminLogout, adminFilteredProducts, groupedProducts,
    showCatModal, editCatForm, openEditCat, doSaveEditCat, cardModal, viewCard, reissueOrder, newCat, doAddCat,
    doDelCat, doSaveCats, doSaveConfig, showProdModal, pForm, openAddProd, openEditProd, doSaveProd, doDelProd,
    showCardsModal, cForm, openCardsModal, doSubmitCards
  };
});