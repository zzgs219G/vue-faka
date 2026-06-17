// 文件名: functions/_core.js
// ==========================================
// 核心逻辑系统 (包含了升级后的智能复用、D1强锁与系统日志)
// ==========================================

export const Utils = {
  async sign(type, price, secret) {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const buf = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`${type}${price}`)
    );
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  },
  json(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};

export class MailService {
  static async send(env, toEmail, productName, orderId, cardContent) {
    if (!toEmail || !toEmail.includes('@')) return;
    if (!env.RESEND_EMAIL_API_KEY) return;

    const siteName = env.TITLE || "熠云发卡"; 
    
    const htmlBody = `
    <div style="padding: 15px; font-family: -apple-system, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 420px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="background-color: #1f2937; padding: 16px; text-align: center;">
          <div style="color: #ffffff; font-size: 16px; font-weight: 600; letter-spacing: 0.5px;">${siteName} · 自动发卡系统</div>
        </div>
        <div style="padding: 24px;">
          <div style="margin-bottom: 24px;">
            <p style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">您领取的卡密内容：</p>
            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 18px; border-radius: 8px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 16px; word-break: break-all; line-height: 1.5; text-align: center;">
              ${cardContent.replace(/\n/g, '<br>')}
            </div>
            <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 8px;">温馨提示：请及时激活，长按即可复制</p>
          </div>
          <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; font-size: 12px; color: #4b5563;">
            <div style="margin-bottom: 4px;">商品名称：<span style="color: #111827; font-weight: 500;">${productName}</span></div>
            <div>订单单号：<span style="font-family: monospace;">${orderId}</span></div>
          </div>
        </div>
        <div style="background-color: #fcfcfc; padding: 12px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #f3f4f6;">
          云端原生架构 · 自动提卡服务
        </div>
      </div>
    </div>`;

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_EMAIL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${siteName} <onboarding@resend.dev>`, 
          to: [toEmail],
          subject: `【${siteName}】您购买的 [${productName}] 已发卡`,
          html: htmlBody
        })
      });
    } catch (e) {}
  }
}

// 🌟 新增：专门用于监控和记录异常行为的日志服务
export class LogService {
  constructor(env) { 
    this.d1 = env.DB; 
  }
  async log(type, message, detail = "") {
    try {
      await this.d1.prepare("INSERT INTO system_logs (type, message, detail, createTime) VALUES (?, ?, ?, ?)").bind(type, message, detail, Date.now()).run();
    } catch(e) {}
  }
  async getLogs() {
    try {
      const { results } = await this.d1.prepare("SELECT * FROM system_logs ORDER BY createTime DESC LIMIT 200").all();
      return results || [];
    } catch(e) { return []; }
  }
}

export class DBService {
  constructor(env) { 
    this.kv = env.FAKA_DATA; 
    this.d1 = env.DB;        
  }

  async getConfig() { return await this.kv.get("SYS_CONFIG", "json") || { siteName: "熠云发卡", notice: "全天自动发货", afterSales: "", alipayQr: "", wechatQr: "", alipayLink: "", isOpen: true, apiFee: "0" }; }
  async saveConfig(config) { await this.kv.put("SYS_CONFIG", JSON.stringify(config)); }

  async getCategories() { return await this.kv.get("CATEGORIES", "json") || [{id: 'default', name: '默认分类', sort: 0}]; }
  async saveCategories(cats) { await this.kv.put("CATEGORIES", JSON.stringify(cats)); }

  async getProducts() { 
    const products = await this.kv.get("PRODUCTS", "json") || []; 
    try {
        const { results } = await this.d1.prepare("SELECT productId, COUNT(*) as count FROM inventory WHERE status = 'unsold' GROUP BY productId").all();
        const stockMap = {};
        if (results) results.forEach(r => stockMap[r.productId] = r.count);
        products.forEach(p => { p.stock = stockMap[p.id] || 0; p.cards = undefined; });
    } catch(e) {
        products.forEach(p => { p.stock = p.cards ? p.cards.length : 0; p.cards = undefined; });
    }
    return products;
  }
  
  async saveProducts(products) { await this.kv.put("PRODUCTS", JSON.stringify(products)); }

  generateOrderId() {
    const d = new Date();
    const yy = d.getFullYear().toString().slice(-2);
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    const hh = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    const sec = d.getSeconds().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9000 + 1000); 
    return `${yy}${mm}${dd}-${hh}${min}${sec}-${random}`;
  }

  // 🚀 核心机制：随机浮动锁单，记录 clientIP 方便防刷判断
  async createUniqueOrder(product, contact, payMethod, clientIP) {
    const basePriceCents = Math.round(parseFloat(product.price) * 100);
    const now = Date.now();
    // 后端锁单保留 8 分钟，给监控回调留出 3 分钟的宽限期防掉单
    const expireTime = now + 480000;
    let finalPriceStr = "";
    
    // 0.01 随机加减概率池
    const offsets = [0]; 
    for (let i = 1; i <= 50; i++) {
      offsets.push(-i); 
      offsets.push(i);  
    }

    let found = false;
    for (let offset of offsets) {
      let currentPriceCents = basePriceCents + offset;
      if (currentPriceCents <= 0) continue; // 防底线

      finalPriceStr = (currentPriceCents / 100).toFixed(2);
      
      const exist = await this.d1.prepare(
        "SELECT orderId FROM orders WHERE payPrice = ? AND status = 'pending' AND expireTime > ?"
      ).bind(finalPriceStr, now).first();
      
      if (!exist) {
        found = true;
        break; 
      }
    }
    
    if (!found) throw new Error("当前并发人数过多导致撞单，请稍后再试！");
    
    const orderId = this.generateOrderId();

    const lockResult = await this.d1.prepare(`
      UPDATE inventory SET status = 'locking', orderId = ? 
      WHERE id = (SELECT id FROM inventory WHERE productId = ? AND status = 'unsold' LIMIT 1) 
      RETURNING id
    `).bind(orderId, product.id).first();

    if (!lockResult) throw new Error("手慢了，该商品库存已被抢空！");
    
    await this.d1.prepare(
      "INSERT INTO orders (orderId, productId, productName, payPrice, contact, payMethod, status, card, createTime, expireTime, clientIP) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      orderId, product.id, product.name, finalPriceStr, contact || '', payMethod, 'pending', '', now, expireTime, clientIP
    ).run();

    return { orderId, productId: product.id, productName: product.name, payPrice: finalPriceStr, contact, payMethod, status: "pending", card: "", createTime: now, expireTime, clientIP };
  }

  async getWaitOrder(price) { 
    const priceStr = parseFloat(price).toFixed(2);
    const now = Date.now();
    return await this.d1.prepare(
        "SELECT * FROM orders WHERE payPrice = ? AND status = 'pending' AND expireTime > ?"
    ).bind(priceStr, now).first(); 
  }

  async getOrderInfo(orderId) { 
    return await this.d1.prepare("SELECT * FROM orders WHERE orderId = ?").bind(orderId).first(); 
  }
  
  async updateOrderStatus(orderId, status) {
    await this.d1.prepare("UPDATE orders SET status = ? WHERE orderId = ?").bind(status, orderId).run();
  }

  async completeOrder(orderId, card, env, ctx) {
    const now = Date.now();
    await this.d1.prepare("UPDATE orders SET status = 'paid', card = ?, payTime = ? WHERE orderId = ?").bind(card, now, orderId).run();
    
    const order = await this.getOrderInfo(orderId);
    if (order && order.contact && order.contact.includes('@')) {
      if (ctx) ctx.waitUntil(MailService.send(env, order.contact, order.productName, order.orderId, card));
      else MailService.send(env, order.contact, order.productName, order.orderId, card);
    }
  }

  async cleanUpExpiredOrders() {
      const now = Date.now();
      await this.d1.prepare("UPDATE inventory SET status = 'unsold', orderId = NULL WHERE status = 'locking' AND orderId IN (SELECT orderId FROM orders WHERE status = 'pending' AND expireTime < ?)").bind(now).run();
      await this.d1.prepare("UPDATE orders SET status = 'expired' WHERE status = 'pending' AND expireTime < ?").bind(now).run();
  }

  async getOrderHistory() { 
    const { results } = await this.d1.prepare("SELECT * FROM orders WHERE status != 'pending' ORDER BY createTime DESC LIMIT 500").all();
    return results || [];
  }
}