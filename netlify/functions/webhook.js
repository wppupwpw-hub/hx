// netlify/functions/webhook.js

export async function handler(event, context) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  // ✅ التحقق من الربط مع فيسبوك
  if (event.httpMethod === "GET") {
    const params = event.queryStringParameters;
    if (params["hub.verify_token"] === VERIFY_TOKEN) {
      return {
        statusCode: 200,
        body: params["hub.challenge"],
      };
    }
    return { statusCode: 403, body: "Forbidden" };
  }

  // ✅ استقبال الرسائل من العملاء
  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body);

    if (body.object === "page") {
      for (const entry of body.entry) {
        const webhookEvent = entry.messaging[0];
        const senderId = webhookEvent.sender.id;

        if (webhookEvent.message && webhookEvent.message.text) {
          const userMsg = webhookEvent.message.text.trim().toLowerCase();
          console.log("📩 رسالة من العميل:", userMsg);

          let reply = "شكراً لتواصلك مع موبليس 😊 كيف نقدر نساعدك؟";

          // ✅ الردود الذكية
          if (userMsg.includes("مرحبا") || userMsg.includes("السلام")) {
            reply = "أهلاً وسهلاً 👋 مرحبا بك في خدمة عملاء موبليس. كيف نقدر نساعدك اليوم؟";
          } 
          else if (userMsg.includes("الرصيد")) {
            reply = "📱 لمعرفة رصيدك: اطلب #222* من هاتفك.";
          } 
          else if (userMsg.includes("الإنترنت") || userMsg.includes("النت")) {
            reply = "🌐 لعروض الإنترنت زور موقعنا: https://www.mobilis.dz أو اطلب *600#.";
          } 
          else if (userMsg.includes("العروض") || userMsg.includes("الباقات")) {
            reply = "📢 عروض موبليس متجددة! اطلب *600# لمشاهدة آخر العروض المتوفرة.";
          } 
          else if (userMsg.includes("خدمة العملاء") || userMsg.includes("اتصال")) {
            reply = "☎️ للتحدث مباشرة مع خدمة العملاء اتصل على الرقم 888 من خط موبليس.";
          } 
          else if (userMsg.includes("فاتورة") || userMsg.includes("الفاتورة")) {
            reply = "💳 لمعرفة تفاصيل فاتورتك اطلب #111* أو زر أقرب وكالة موبليس.";
          }
          else if (userMsg.includes("تحويل") || userMsg.includes("رصيد")) {
            reply = "🔄 لتحويل رصيد اطلب: *610*الرقم*المبلغ# ✔️";
          }
          else if (userMsg.includes("تغطية") || userMsg.includes("الشبكة")) {
            reply = "📡 للتأكد من تغطية الشبكة في منطقتك زور: https://www.mobilis.dz/coverage";
          }
          else if (userMsg.includes("بريد صوتي") || userMsg.includes("صوتي")) {
            reply = "📞 لتفعيل خدمة البريد الصوتي اطلب **2121#* ثم اتبع التعليمات.";
          }
          else if (userMsg.includes("القائمة")) {
            // عرض أزرار سريعة بدل النصوص
            await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN);
            continue; // نوقف هنا عشان ما يرسل رسالة نصية ثانية
          }
          else if (userMsg.includes("شكرا") || userMsg.includes("thanks")) {
            reply = "🌹 على الرحب والسعة، نحن دائماً في خدمتك.";
          }

          // ✅ إرسال الرد النصي
          await sendMessage(senderId, reply, PAGE_ACCESS_TOKEN);
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

// 🔹 إرسال أزرار سريعة (Quick Replies)
async function sendQuickReplies(senderId, token) {
  await fetch(`https://graph.facebook.com/v16.0/me/messages?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: senderId },
      message: {
        text: "اختر الخدمة التي تناسبك 👇:",
        quick_replies: [
          {
            content_type: "text",
            title: "📱 الرصيد",
            payload: "BALANCE"
          },
          {
            content_type: "text",
            title: "🌐 عروض الإنترنت",
            payload: "INTERNET"
          },
          {
            content_type: "text",
            title: "☎️ خدمة العملاء",
            payload: "CUSTOMER_SERVICE"
          },
          {
            content_type: "text",
            title: "💳 الفاتورة",
            payload: "BILL"
          }
        ]
      }
    }),
  });
}
