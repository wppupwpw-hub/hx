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

          // ✅ الردود الاجتماعية
          if (userMsg.includes("كيفك") || userMsg.includes("واش راك") || userMsg.includes("عامل ايه")) {
            reply = "😊 الحمد لله بخير، شكراً لسؤالك. وانت كيف حالك؟";
          }
          else if (userMsg.includes("تمام") || userMsg.includes("بخير")) {
            reply = "🙌 رائع! يسعدني سماع ذلك.";
          }
          else if (userMsg.includes("😂") || userMsg.includes("ههه") || userMsg.includes("lol")) {
            reply = "🤣 هاها! ضحكتني والله.";
          }
          else if (userMsg.includes("🥺") || userMsg.includes("حزين")) {
            reply = "💙 لا تزعل، إن شاء الله كل شيء يتصلح.";
          }
          else if (userMsg.includes("احبك") || userMsg.includes("نحبك")) {
            reply = "❤️ وأنا نحبك بزاف! شكراً على كلامك الطيب.";
          }
          else if (userMsg.includes("تصبح على خير")) {
            reply = "🌙 تصبح على خير وأحلام سعيدة.";
          }
          else if (userMsg.includes("صباح الخير")) {
            reply = "☀️ صباح النور! نتمنى لك يوماً جميلاً.";
          }
          else if (userMsg.includes("مساء الخير")) {
            reply = "🌆 مساء الورد والياسمين.";
          }

          // ✅ الردود الذكية الأساسية (موبليس)
          else if (userMsg.includes("مرحبا") || userMsg.includes("السلام")) {
            reply = "أهلاً وسهلاً 👋 مرحبا بك في خدمة عملاء موبليس. كيف نقدر نساعدك اليوم؟";
          } 
          else if (userMsg.includes("العروض") || userMsg.includes("الباقات")) {
            reply = "📢 عروض موبليس متجددة! اطلب *600# لمشاهدة آخر العروض المتوفرة.";
          } 
          else if (userMsg.includes("خدمة العملاء") || userMsg.includes("اتصال")) {
            reply = "☎️ للتحدث مباشرة مع خدمة العملاء اتصل على الرقم 888 من خط موبليس.";
          } 
          else if (userMsg.includes("تغطية") || userMsg.includes("الشبكة")) {
            reply = "📡 للتأكد من تغطية الشبكة في منطقتك زور: https://www.mobilis.dz/coverage";
          }
          else if (userMsg.includes("بريد صوتي") || userMsg.includes("صوتي")) {
            reply = "📞 لتفعيل خدمة البريد الصوتي اطلب **2121#* ثم اتبع التعليمات.";
          }
          else if (userMsg.includes("القائمة")) {
            await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN);
            continue; 
          }
          else if (userMsg.includes("شكرا") || userMsg.includes("thanks")) {
            reply = "🌹 على الرحب والسعة، نحن دائماً في خدمتك.";
          }

          // ✅ الأكواد المهمة MOBILIS CODES
          else if (userMsg.includes("تعبئة") || userMsg.includes("recharge")) {
            reply = "🔋 لتعبئة رصيدك باستعمال البطاقة: اطلب *111*الأرقام 14# أو اتصل بـ 111 ثم اختر 1 وأدخل الأرقام.";
          }
          else if (userMsg.includes("رقمي") || userMsg.includes("معرفة الرقم")) {
            reply = "📱 لمعرفة رقمك في موبيليس اطلب: *101#";
          }
          else if (userMsg.includes("مغلق") || userMsg.includes("خارج التغطية")) {
            reply = "🚫 لتفعيل تحويل المكالمات عند انشغال الخط أو خارج التغطية: *21*#0662";
          }
          else if (userMsg.includes("تفعيل تحويل الرصيد")) {
            reply = "💰 لتفعيل خدمة تحويل الرصيد اطلب: *#610";
          }
          else if (userMsg.includes("تحويل الرصيد") || userMsg.includes("فليكسي")) {
            reply = "🔄 لتحويل رصيد من موبيليس لموبيليس: *610*الرقم*المبلغ*0000#";
          }
          else if (userMsg.includes("رسائل مجانية") || userMsg.includes("sms gratuit")) {
            reply = "✉️ لإرسال رسالة مجانية بدون رصيد: *606*رقم المرسل إليه#";
          }
          else if (userMsg.includes("عروض") || userMsg.includes("انترنت")) {
            reply = "🌐 للاطلاع على عروض الإنترنت والاتصال: اطلب *#600";
          }
          else if (userMsg.includes("الرصيد") || userMsg.includes("solde")) {
            reply = "📊 لمعرفة رصيدك اطلب: *#222";
          }
          else if (userMsg.includes("الرقم خاطئ") || userMsg.includes("غير موجود")) {
            reply = "❌ لتفعيل تحويل المكالمات عند الرقم خاطئ أو غير موجود: *21*#0000";
          }
          else if (userMsg.includes("رونفوا") || userMsg.includes("تحويل المكالمات")) {
            reply = "☎️ لتحويل المكالمات إلى رقم آخر: *21*الرقم المراد التحويل إليه#";
          }
          else if (userMsg.includes("ماسك") || userMsg.includes("مخفي")) {
            reply = "😎 لإخفاء رقمك (ماسك): اطلب #31# قبل الرقم.";
          }
          else if (userMsg.includes("انتظار المكالمات")) {
            reply = "⏳ لتفعيل خدمة انتظار المكالمات: *21*#644";
          }
          else if (userMsg.includes("إلغاء رونفوا") || userMsg.includes("إلغاء تحويل")) {
            reply = "❌ لإلغاء تحويل المكالمات (رونفوا): اطلب #21#";
          }
          else if (userMsg.includes("رنتي") || userMsg.includes("نغمة")) {
            reply = "🎵 لإلغاء خدمة رنتي: أرسل رسالة SMS بكلمة DES إلى الرقم 680.";
          }
          else if (userMsg.includes("خدمة الزبائن") || userMsg.includes("contact")) {
            reply = "📞 خدمة الزبائن: اتصل بالرقم 666 أو 888.";
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
