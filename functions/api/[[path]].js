// 文件名: functions/api/[[path]].js
import { Utils, DBService, LogService } from '../_core.js';

const ipRateLimit = new Map();
function checkRateLimit(ip) {
  if(!ip) return true;
  const now = Date.now();
  const record = ipRateLimit.get(ip) || { count: 0, time: now };
  if (now - record.time > 60000) { record.count = 1; record.time = now; }
  else { record.count++; }
  ipRateLimit.set(ip, record);
  return record.count <= 3;
}

let lastCleanupTime = 0;

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === "OPTIONS") return Utils.json({ msg: "CORS OK" });

  try {
    const db = new DBService(env);
    const logger = new LogService(env);

    // 1. 前台公开接口
    if (path === "/api/public" && method === "GET") {
      const config = await db.getConfig();
      const categories = await db.getCategories();
      const products = await db.getProducts();
      const response = Utils.json({ config, categories, products });
      response.headers.set("Cache-Control", "public, max-age=60, s-maxage=3600");
      return response;
    }

    // 2. 创建订单
    if (path === "/api/order/create" && method === "POST") {
      if (Date.now() - lastCleanupTime > 300000) {
        lastCleanupTime = Date.now();
        context.waitUntil(db.cleanUpExpiredOrders());
      }
      const config = await db.getConfig();
      if (!config.isOpen) return Utils.json({ error: "站点维护中，暂不支持购买" }, 403);
      const { productId, contact, payMethod } = await request.json();
      if (!['alipay', 'wechat'].includes(payMethod)) return Utils.json({ error: "支付方式错误" }, 400);
      const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
      const products = await db.getProducts();
      const product = products.find(p => p.id === productId);
      if (!product) return Utils.json({ error: "商品不存在" }, 400);
      const now = Date.now();
      const existingOrder = await db.d1.prepare(
        "SELECT * FROM orders WHERE clientIP = ? AND productId = ? AND status = 'pending' AND expireTime > ?"
      ).bind(clientIP, product.id, now + 240000).first();
      if (existingOrder) {
        if (contact && contact !== existingOrder.contact) {
          await db.d1.prepare("UPDATE orders SET contact = ? WHERE orderId = ?").bind(contact, existingOrder.orderId).run();
          existingOrder.contact = contact;
        }
        existingOrder.frontendExpireTime = existingOrder.expireTime - 180000;
        return Utils.json(existingOrder);
      }
      if (!checkRateLimit(clientIP)) {
        context.waitUntil(logger.log("系统限流警告", `IP ${clientIP} 触发了订单刷单防线`));
        return Utils.json({ error: "创建新订单频率太快，请稍后1分钟再试" }, 429);
      }
      try {
        const orderInfo = await db.createUniqueOrder(product, contact, payMethod, clientIP);
        orderInfo.frontendExpireTime = Date.now() + 300000;
        return Utils.json(orderInfo);
      } catch (e) {
        context.waitUntil(logger.log("订单创建异常", e.message, `IP: ${clientIP}, 商品: ${product.name}`));
        return Utils.json({ error: e.message }, 400);
      }
    }

    // 3. 修改邮箱
    if (path === "/api/order/updateContact" && method === "POST") {
      const { orderId, contact } = await request.json();
      if (!orderId) return Utils.json({ error: "参数不完整" }, 400);
      const order = await db.getOrderInfo(orderId);
      if (order && order.status === 'pending') {
        await db.d1.prepare("UPDATE orders SET contact = ? WHERE orderId = ?").bind(contact || '', orderId).run();
        return Utils.json({ success: true });
      }
      return Utils.json({ error: "无法修改当前订单" }, 400);
    }

    // 4. 查单
    if (path === "/api/order/check" && method === "GET") {
      if (Date.now() - lastCleanupTime > 300000) {
        lastCleanupTime = Date.now();
        context.waitUntil(db.cleanUpExpiredOrders());
      }
      const orderId = url.searchParams.get("orderId");
      if (!orderId) return Utils.json({ error: "缺少单号" }, 400);
      const order = await db.getOrderInfo(orderId);
      if (order && order.status === 'pending') {
        const frontendExpireTime = order.expireTime - 180000;
        if (Date.now() > frontendExpireTime) {
          order.status = 'expired';
        } else {
          order.frontendExpireTime = frontendExpireTime;
        }
      }
      return Utils.json(order || { status: "not_found" });
    }

    // 5. 批量查单
    if (path === "/api/order/checkBatch" && method === "POST") {
      if (Date.now() - lastCleanupTime > 300000) {
        lastCleanupTime = Date.now();
        context.waitUntil(db.cleanUpExpiredOrders());
      }
      const { orderIds } = await request.json();
      if (!Array.isArray(orderIds) || orderIds.length === 0) return Utils.json({});
      const safeIds = orderIds.slice(0, 50);
      const placeholders = safeIds.map(() => '?').join(',');
      const { results } = await db.d1.prepare(
        `SELECT orderId, status, expireTime FROM orders WHERE orderId IN (${placeholders})`
      ).bind(...safeIds).all();
      const statusMap = {};
      const now = Date.now();
      if (results) {
        for (let order of results) {
          let status = order.status;
          if (status === 'pending' && now > order.expireTime - 180000) status = 'expired';
          statusMap[order.orderId] = status;
        }
      }
      return Utils.json(statusMap);
    }

    // 6. SSE 流式接口
    if (path === "/api/order/stream" && method === "GET") {
      const orderId = url.searchParams.get("orderId");
      if (!orderId) return new Response("Missing orderId", { status: 400 });
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();
      const response = new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*"
        }
      });
      context.waitUntil((async () => {
        let isClosed = false;
        try {
          await writer.write(encoder.encode(`event: ping\ndata: connected\n\n`));
        } catch(e) { isClosed = true; }
        let loops = 0;
        const MAX_LOOPS = 150; // 2秒*150=5分钟
        while (!isClosed && loops < MAX_LOOPS) {
          loops++;
          try {
            const order = await db.getOrderInfo(orderId);
            if (!order) {
              await writer.write(encoder.encode(`event: not_found\ndata: {}\n\n`));
              break;
            }
            if (order.status === 'pending' && Date.now() > (order.expireTime - 180000)) {
              await writer.write(encoder.encode(`event: status\ndata: ${JSON.stringify({ status: 'expired', card: '' })}\n\n`));
              break;
            }
            if (order.status === 'paid' || order.status === 'expired') {
              await writer.write(encoder.encode(`event: status\ndata: ${JSON.stringify({ status: order.status, card: order.card || '' })}\n\n`));
              break;
            }
            await writer.write(encoder.encode(`:\n\n`));
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (e) { isClosed = true; }
        }
        try { await writer.close(); } catch(e){}
      })());
      return response;
    }

    // 7. V-MQ 支付回调
    if (path === "/api/push" && method === "POST") {
      const { type, price, sign } = await request.json();
      const secretKey = env.APP_SECRET || "123456";
      const localSign = await Utils.sign(type, price, secretKey);
      if (sign !== localSign) {
        context.waitUntil(logger.log("严重安全警告", `回调签名校验失败`, `金额: ${price}, 类型: ${type}`));
        return Utils.json({ code: 401, msg: "签名校验拦截，非法请求" }, 401);
      }
      const order = await db.getWaitOrder(price);
      if (order && order.status === "pending") {
        try {
          const result = await db.d1.prepare(
            "UPDATE inventory SET status = 'sold' WHERE orderId = ? AND status = 'locking' RETURNING card"
          ).bind(order.orderId).first();
          if (result && result.card) {
            await db.d1.prepare(
              "UPDATE orders SET payMethod = ? WHERE orderId = ?"
            ).bind(type, order.orderId).run();
            await db.completeOrder(order.orderId, result.card, env, context);
            context.waitUntil(logger.log("发货成功", `单号 ${order.orderId} (金额: ${price}) 已自动提卡发货`));
            return Utils.json({ code: 200, msg: "发货成功" });
          } else {
            context.waitUntil(logger.log("发货异常阻断", `单号 ${order.orderId} 提取卡密锁定失败`));
            return Utils.json({ code: 400, msg: "发货失败：库存突然不足或已被释放" });
          }
        } catch (e) {
          return Utils.json({ code: 500, msg: "数据库操作异常" });
        }
      }
      context.waitUntil(logger.log("游离的回调通知", `收到匹配不到订单的回调`, `金额: ${price}, 类型: ${type}`));
      return Utils.json({ code: 404, msg: "无匹配单或订单已超时释放" });
    }

    // 8. 管理端接口
    if (path.startsWith("/api/admin/")) {
      const adminPwd = env.ADMIN_PASSWORD || "z2458181028";
      if (request.headers.get("Authorization") !== adminPwd) {
        return Utils.json({ error: "权限拒绝" }, 401);
      }

      if (path === "/api/admin/data" && method === "GET") {
        await env.DB.prepare("CREATE TABLE IF NOT EXISTS inventory (id INTEGER PRIMARY KEY AUTOINCREMENT, productId TEXT, card TEXT, status TEXT DEFAULT 'unsold', orderId TEXT)").run();
        await env.DB.prepare("CREATE TABLE IF NOT EXISTS orders (orderId TEXT PRIMARY KEY, productId TEXT, productName TEXT, payPrice TEXT, contact TEXT, payMethod TEXT, status TEXT, card TEXT, createTime INTEGER, payTime INTEGER, expireTime INTEGER)").run();
        try { await env.DB.prepare("ALTER TABLE orders ADD COLUMN clientIP TEXT").run(); } catch(e) {}
        try { await env.DB.prepare("CREATE TABLE IF NOT EXISTS system_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, message TEXT, detail TEXT, createTime INTEGER)").run(); } catch(e) {}
        return Utils.json({ config: await db.getConfig(), categories: await db.getCategories(), products: await db.getProducts() });
      }

      if (path === "/api/admin/dashboard" && method === "GET") {
        await db.cleanUpExpiredOrders();
        const history = await db.getOrderHistory();
        const today = new Date(Date.now() + 8 * 3600 * 1000).setUTCHours(0, 0, 0, 0) - 8 * 3600 * 1000;
        const paidOrders = history.filter(o => o.status === 'paid');
        const todayOrders = paidOrders.filter(o => o.createTime >= today);
        const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.payPrice), 0).toFixed(2);
        const todayRevenue = todayOrders.reduce((sum, o) => sum + parseFloat(o.payPrice), 0).toFixed(2);
        return Utils.json({ stats: { totalOrders: paidOrders.length, totalRevenue, todayRevenue }, recentOrders: history });
      }

      if (path === "/api/admin/logs" && method === "GET") {
        return Utils.json(await logger.getLogs());
      }

      if (path === "/api/admin/order/reissue" && method === "POST") {
        const { orderId } = await request.json();
        const order = await db.getOrderInfo(orderId);
        if (!order) return Utils.json({ error: "核心数据库中未找到该订单" }, 404);
        if (order.status === 'paid') return Utils.json({ error: "该订单已经是交易完成状态，无需补单" }, 400);
        const cardRes = await db.d1.prepare("SELECT id, card FROM inventory WHERE productId = ? AND status = 'unsold' LIMIT 1").bind(order.productId).first();
        if (!cardRes) {
          context.waitUntil(logger.log("人工补单失败", `管理员尝试为 ${orderId} 补单失败，因商品无剩余库存`));
          return Utils.json({ error: "补单失败：该商品彻底缺货，无法分配新卡密" }, 400);
        }
        await db.d1.prepare("UPDATE inventory SET status = 'sold', orderId = ? WHERE id = ?").bind(orderId, cardRes.id).run();
        await db.completeOrder(orderId, cardRes.card, env, context);
        context.waitUntil(logger.log("执行人工补单", `管理员对订单 ${orderId} (原状态:${order.status}) 进行了强制补发`));
        return Utils.json({ success: true, card: cardRes.card });
      }

      if (path === "/api/admin/categories" && method === "POST") {
        await db.saveCategories(await request.json());
        return Utils.json({ success: true });
      }

      if (path === "/api/admin/config" && method === "POST") {
        await db.saveConfig(await request.json());
        return Utils.json({ success: true });
      }

      if (path === "/api/admin/product" && method === "POST") {
        const data = await request.json();
        const parsedPrice = parseFloat(data.price);
        if (!data.name || data.name.trim() === '' || isNaN(parsedPrice)) return Utils.json({ error: "参数不合法" }, 400);
        const products = await db.getProducts();
        if (data.id) {
          const idx = products.findIndex(p => p.id === data.id);
          if (idx > -1) {
            products[idx] = { ...products[idx], name: data.name, price: parsedPrice.toFixed(2), categoryId: data.categoryId, desc: data.desc, icon: data.icon, image: data.image };
          }
        } else {
          products.unshift({ id: "P" + Date.now(), name: data.name, price: parsedPrice.toFixed(2), categoryId: data.categoryId, desc: data.desc, icon: data.icon, image: data.image });
        }
        await db.saveProducts(products.map(p => ({...p, cards: undefined, stock: undefined})));
        return Utils.json({ success: true });
      }

      if (path === "/api/admin/product" && method === "DELETE") {
        const { id } = await request.json();
        const products = await db.getProducts();
        await db.saveProducts(products.filter(p => p.id !== id));
        await db.d1.prepare("DELETE FROM inventory WHERE productId = ?").bind(id).run();
        return Utils.json({ success: true });
      }

      if (path === "/api/admin/cards" && method === "POST") {
        const { id, cardStr, mode } = await request.json();
        const newCards = cardStr.split('\n').map(c => c.trim()).filter(c => c);
        if (mode === 'replace') {
          await db.d1.prepare("DELETE FROM inventory WHERE productId = ? AND status = 'unsold'").bind(id).run();
        }
        if (newCards.length > 0) {
          const stmts = newCards.map(c => db.d1.prepare("INSERT INTO inventory (productId, card, status) VALUES (?, ?, 'unsold')").bind(id, c));
          await db.d1.batch(stmts);
        }
        return Utils.json({ success: true });
      }
    }

    return Utils.json({ error: "API 接口不存在" }, 404);

  } catch (e) {
    console.error(e);
    return Utils.json({ error: "System Error", details: e.message }, 500);
  }
}