// netlify/functions/webhook.js

export async function handler(event, context) {
  // التوكنات يتم جلبها من Netlify Environment Variables
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  // ✅ التحقق من الربط (GET)
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

  // ✅ استقبال الرسائل (POST)
  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body);

    if (body.object === "page") {
      for (const entry of body.entry) {
        const event = entry.messaging[0];
        const senderId = event.sender.id;

        if (event.message && event.message.text) {
          const userMsg = event.message.text.trim().toLowerCase();
          console.log("📩 رسالة من العميل:", userMsg);

          // ✅ ردود خدمة عملاء موبليس
          let reply = "شكراً لتواصلك مع موبليس 😊 كيف نقدر نساعدك؟";

          if (userMsg.includes("مرحبا") || userMsg.includes("السلام")) {
            reply = "أهلاً وسهلاً 👋 مرحبا بك في خدمة عملاء موبليس. كيف نقدر نساعدك اليوم؟";
          } 
          else if (userMsg.includes("الرصيد")) {
            reply = "لمعرفة رصيدك: اطلب #222* من هاتفك 📱.";
          } 
          else if (userMsg.includes("الإنترنت") || userMsg.includes("النت")) {
            reply = "لعروض الإنترنت زور موقعنا: https://www.mobilis.dz أو اطلب *600#.";
          } 
          else if (userMsg.includes("العروض") || userMsg.includes("الباقات")) {
            reply = "📢 عروض موبليس متجددة! اطلب *600# لمشاهدة آخر العروض المتوفرة.";
          } 
          else if (userMsg.includes("خدمة العملاء") || userMsg.includes("اتصال")) {
            reply = "للتحدث مباشرة مع خدمة العملاء اتصل على الرقم 888 من خط موبليس.";
          } 
          else if (userMsg.includes("شكرا") || userMsg.includes("thanks")) {
            reply = "على الرحب والسعة 🌹 نحن دائماً في خدمتك.";
          }

          // ✅ إرسال الرد
          await sendMessage(senderId, reply, PAGE_ACCESS_TOKEN);
        }
      }
      return { statusCode: 200, body: "EVENT_RECEIVED" };
    }
    return { statusCode: 404, body: "Not Found" };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
}

// 🔹 دالة إرسال رسالة إلى Facebook Messenger
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
