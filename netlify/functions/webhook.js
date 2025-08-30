// netlify/functions/webhook.js

export async function handler(event, context) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  if (event.httpMethod === "GET") {
    const params = event.queryStringParameters;
    if (params["hub.verify_token"] === VERIFY_TOKEN) {
      return { statusCode: 200, body: params["hub.challenge"] };
    }
    return { statusCode: 403, body: "Forbidden" };
  }

  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body);

    if (body.object === "page") {
      for (const entry of body.entry) {
        const webhookEvent = entry.messaging[0];
        const senderId = webhookEvent.sender.id;

        if (webhookEvent.message && webhookEvent.message.text) {
          const userMsg = webhookEvent.message.text.trim().toLowerCase();
          console.log("📩 رسالة من العميل:", userMsg);

          // ✅ القائمة الرئيسية
          if (userMsg.includes("القائمة") || userMsg.includes("menu")) {
            await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN);
            return { statusCode: 200, body: "EVENT_RECEIVED" };
          }

          let reply = null;

          // ✅ عروض Twenty
          if (userMsg.includes("عروض") || userMsg.includes("internet") || userMsg.includes("🌐")) {
            await sendOffers(senderId, PAGE_ACCESS_TOKEN);
            return { statusCode: 200, body: "EVENT_RECEIVED" };
          }

          // ✅ تفاصيل العروض
          if (userMsg.includes("عرض 1")) {
            reply = "📦 *عرض 1*\n💰 السعر: 500 دج / 15 يوماً\n🌐 5 جيغا إنترنت\n📞 مكالمات ورسائل غير محدودة نحو موبيليس\n🎁 1000 دج للمكالمات نحو الشبكات الأخرى";
          } else if (userMsg.includes("عرض 2")) {
            reply = "📦 *عرض 2*\n💰 السعر: 100 دج / 24 ساعة\n🌐 1 جيغا إنترنت\n📞 مكالمات ورسائل غير محدودة نحو موبيليس\n🎁 200 دج للمكالمات نحو الشبكات الأخرى";
          } else if (userMsg.includes("عرض 3")) {
            reply = "📦 *عرض 3*\n💰 السعر: 50 دج / 24 ساعة\n🌐 500 ميغا إنترنت\n📞 مكالمات ورسائل غير محدودة نحو موبيليس\n🎁 50 دج للمكالمات نحو الشبكات الأخرى";
          } else if (userMsg.includes("عرض 4")) {
            reply = "📦 *عرض 4*\n💰 السعر: 1000 دج / شهرياً\n🌐 15 جيغا إنترنت\n📞 مكالمات ورسائل غير محدودة نحو موبيليس\n🎁 2000 دج للمكالمات نحو الشبكات الأخرى";
          }

          // ✅ ردود اجتماعية
          else if (userMsg.includes("مرحبا") || userMsg.includes("سلام")) {
            reply = "👋 أهلاً وسهلاً! كيف حالك اليوم؟";
          } else if (userMsg.includes("كيفك") || userMsg.includes("واش راك")) {
            reply = "😊 بخير الحمد لله، وانت؟";
          } else if (userMsg.includes("تمام") || userMsg.includes("بخير")) {
            reply = "🙌 الحمد لله! سررت بسماع ذلك.";
          } else if (userMsg.includes("😂") || userMsg.includes("ههه") || userMsg.includes("🤣")) {
            reply = "🤣 هاها! ضحكتني.";
          } else if (userMsg.includes("حزين") || userMsg.includes("زعلان")) {
            reply = "💙 ما تزعلش، ربي يفرجها عليك.";
          } else if (userMsg.includes("احبك") || userMsg.includes("نحبك")) {
            reply = "❤️ وأنا نحبك بزاف!";
          }

          // ✅ خدمات أساسية (مثال فقط - باقي الخدمات تبقى مثل النسخة السابقة)
          else if (userMsg.includes("الرصيد")) {
            reply = "📊 لمعرفة رصيدك: #222*";
          } else if (userMsg.includes("رقمي")) {
            reply = "📱 لمعرفة رقمك: #101* أو الاتصال بـ 505";
          }

          // رد افتراضي
          else {
            reply = "🤖 لم أفهم طلبك. جرب كتابة 'القائمة' لرؤية الخدمات أو 'عروض' لعرض الباقات.";
          }

          if (reply) {
            await sendMessage(senderId, reply, PAGE_ACCESS_TOKEN);
          }
        }
      }
      return { statusCode: 200, body: "EVENT_RECEIVED" };
    }
    return { statusCode: 404, body: "Not Found" };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
}

// 🔹 إرسال رسالة نصية
async function sendMessage(senderId, text, token) {
  await fetch(`https://graph.facebook.com/v16.0/me/messages?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: senderId },
      message: { text },
    }),
  });
}

// 🔹 القائمة الرئيسية
async function sendQuickReplies(senderId, token) {
  await fetch(`https://graph.facebook.com/v16.0/me/messages?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: senderId },
      message: {
        text: "📋 اختر الخدمة التي تحتاجها:",
        quick_replies: [
          { content_type: "text", title: "📱 رقمي", payload: "NUMBER" },
          { content_type: "text", title: "🔋 شحن", payload: "RECHARGE" },
          { content_type: "text", title: "🔄 فليكسي", payload: "FLEXI" },
          { content_type: "text", title: "🌐 عروض", payload: "INTERNET" },
          { content_type: "text", title: "📩 كلمني", payload: "CALLME" },
          { content_type: "text", title: "☎️ رونفوا", payload: "RONVOI" },
          { content_type: "text", title: "🚫 مغلق", payload: "OFFLINE" },
          { content_type: "text", title: "📞 فائتة", payload: "MISSED" },
          { content_type: "text", title: "🎵 خدمات إضافية", payload: "EXTRA" },
          { content_type: "text", title: "💡 كريدي", payload: "CREDILIS" },
          { content_type: "text", title: "📝 تسجيل", payload: "REGISTER" }
        ]
      }
    }),
  });
}

// 🔹 عروض Twenty
async function sendOffers(senderId, token) {
  await fetch(`https://graph.facebook.com/v16.0/me/messages?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: senderId },
      message: {
        text: "🌐 اختر عرض Twenty المناسب لك:",
        quick_replies: [
          { content_type: "text", title: "عرض 1", payload: "OFFER1" },
          { content_type: "text", title: "عرض 2", payload: "OFFER2" },
          { content_type: "text", title: "عرض 3", payload: "OFFER3" },
          { content_type: "text", title: "عرض 4", payload: "OFFER4" }
        ]
      }
    }),
  });
}
