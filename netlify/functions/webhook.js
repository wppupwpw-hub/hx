// netlify/functions/webhook.js

export async function handler(event, context) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  // ✅ تحقق الربط مع فيسبوك
  if (event.httpMethod === "GET") {
    const params = event.queryStringParameters;
    if (params["hub.verify_token"] === VERIFY_TOKEN) {
      return { statusCode: 200, body: params["hub.challenge"] };
    }
    return { statusCode: 403, body: "Forbidden" };
  }

  // ✅ استقبال الرسائل
  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body);

    if (body.object === "page") {
      for (const entry of body.entry) {
        const webhookEvent = entry.messaging[0];
        const senderId = webhookEvent.sender.id;

        // ✅ استقبال الرسائل النصية
        if (webhookEvent.message && webhookEvent.message.text) {
          const userMsg = webhookEvent.message.text.trim().toLowerCase();
          console.log("📩 رسالة من العميل:", userMsg);

          // ✅ طلب القائمة (Quick Replies)
          if (userMsg.includes("القائمة") || userMsg.includes("menu")) {
            await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN);
            return { statusCode: 200, body: "EVENT_RECEIVED" };
          }

          let reply = null;

          // 👋 تحيات
          if (userMsg.includes("مرحبا") || userMsg.includes("سلام")) {
            reply = "👋 أهلاً وسهلاً! اكتب 'القائمة' لرؤية الخيارات.";
          }
          else if (userMsg.includes("كيفك") || userMsg.includes("واش راك")) {
            reply = "😊 بخير الحمد لله، وانت؟";
          }
          else if (userMsg.includes("تمام") || userMsg.includes("بخير")) {
            reply = "🙌 رائع! يسعدني سماع ذلك.";
          }

          // 📊 أكواد وخدمات
          else if (userMsg.includes("الرصيد") || userMsg.includes("222")) {
            reply = "📊 لمعرفة رصيدك: #222*";
          }
          else if (userMsg.includes("شحن") || userMsg.includes("كارت")) {
            reply = "🔋 لشحن رصيدك: *111*رقم الكارت#";
          }
          else if (userMsg.includes("فليكسي") || userMsg.includes("610")) {
            reply = "🔄 تحويل الرصيد: *610*الرقم*المبلغ*الرقم السري#";
          }
          else if (userMsg.includes("العروض") || userMsg.includes("600")) {
            reply = "🌐 عروض موبيليس: #600*";
          }
          else if (userMsg.includes("كريدي") || userMsg.includes("662")) {
            reply = "💡 خدمة CridiLIS: اطلب *662*3*المبلغ#";
          }

          // 🌍 روابط ومساعدة
          else if (userMsg.includes("موقع")) {
            reply = "🌐 موقع موبيليس: https://www.mobilis.dz";
          }
          else if (userMsg.includes("وكالة") || userMsg.includes("فرع")) {
            reply = "📍 أقرب وكالة: https://www.mobilis.dz/coverage";
          }
          else if (userMsg.includes("مساعدة") || userMsg.includes("help")) {
            reply = "💡 يمكنك كتابة: رصيد، شحن، فليكسي، عروض، كريدي، أو 'القائمة' لرؤية الخيارات.";
          }

          // ✅ رد افتراضي
          else {
            reply = "🤖 لم أفهم تمامًا. جرب كتابة 'القائمة' لرؤية الخيارات المتاحة.";
          }

          // ✅ إرسال الرد
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

// 🔹 إرسال رسالة نصية عادية
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

// 🔹 إرسال Quick Replies
async function sendQuickReplies(senderId, token) {
  await fetch(`https://graph.facebook.com/v16.0/me/messages?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: senderId },
      message: {
        text: "📋 اختر الخدمة التي تحتاجها:",
        quick_replies: [
          { content_type: "text", title: "📱 الرصيد", payload: "BALANCE" },
          { content_type: "text", title: "🔋 شحن", payload: "RECHARGE" },
          { content_type: "text", title: "🔄 فليكسي", payload: "FLEXI" },
          { content_type: "text", title: "🌐 عروض", payload: "INTERNET" },
          { content_type: "text", title: "💡 كريدي", payload: "CREDILIS" },
          { content_type: "text", title: "☎️ خدمة العملاء", payload: "CUSTOMER" }
        ]
      }
    }),
  });
}
