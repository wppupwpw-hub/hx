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

          // ✅ الذكاء: تحديد مقصد العميل
          else if (userMsg.includes("الرصيد") || userMsg.includes("solde") || userMsg.includes("فلوس")) {
            await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN);
            continue;
          }
          else if (userMsg.includes("تحويل") || userMsg.includes("فليكسي") || userMsg.includes("transfert")) {
            await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN);
            continue;
          }
          else if (userMsg.includes("انترنت") || userMsg.includes("النت") || userMsg.includes("data") || userMsg.includes("عرض") || userMsg.includes("الباقات")) {
            await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN);
            continue;
          }
          else if (userMsg.includes("خدمة العملاء") || userMsg.includes("contact") || userMsg.includes("اتصال")) {
            await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN);
            continue;
          }

          // ✅ الأكواد المهمة MOBILIS CODES
          else if (userMsg.includes("تعبئة") || userMsg.includes("recharge")) {
            reply = "🔋 لتعبئة رصيدك باستعمال البطاقة: اطلب *111*الأرقام 14# أو اتصل بـ 111 ثم اختر 1 وأدخل الأرقام.";
          }
          else if (userMsg.includes("رقمي") || userMsg.includes("معرفة الرقم")) {
            reply = "📱 لمعرفة رقمك في موبيليس اطلب: *101# أو اتصل بـ 505";
          }
          else if (userMsg.includes("الرصيد") || userMsg.includes("solde")) {
            reply = "📊 لمعرفة رصيدك اطلب: *222#";
          }
          else if (userMsg.includes("تحويل الرصيد") || userMsg.includes("فليكسي")) {
            reply = "🔄 لتحويل رصيد من موبيليس لموبيليس: اطلب #610*رقم الهاتف*المبلغ*الرقم السري#";
          }
          else if (userMsg.includes("العروض") || userMsg.includes("الباقات")) {
            reply = "📢 لمعرفة العروض والباقات، اطلب #600*";
          }
          else if (userMsg.includes("كلمني شكرا")) {
            reply = "✉️ لإرسال رسالة "كلمني شكراً" اطلب: *606* رقم الهاتف #";
          }
          else if (userMsg.includes("رونفوا") || userMsg.includes("تحويل المكالمات")) {
            reply = "☎️ لتحويل المكالمات إلى رقم آخر: اطلب *21*الرقم #. للإلغاء: #21#";
          }
          else if (userMsg.includes("مغلق") || userMsg.includes("خارج التغطية")) {
            reply = "🚫 لتفعيل خدمة مغلق/خارج التغطية: اطلب #644*21*. للإلغاء: #002# أو #21#";
          }
          else if (userMsg.includes("المكالمات الفائتة")) {
            reply = "📞 لتفعيل خدمة المكالمات الفائتة: اطلب #21*644*";
          }
          else if (userMsg.includes("CridiLIS") || userMsg.includes("رصيد بالدين")) {
            reply = "💰 لطلب رصيد بالدين (CridiLIS) بقيمة 20، 50، أو 100 دج: اطلب *662*3*المبلغ#";
          }
          else if (userMsg.includes("شكرا") || userMsg.includes("thanks")) {
            reply = "🌹 على الرحب والسعة، نحن دائماً في خدمتك.";
          }
          else if (userMsg.includes("رنتي") || userMsg.includes("نغمة")) {
            reply = "🎵 لإلغاء خدمة رنتي، أرسل رسالة نصية بكلمة 'DES' إلى الرقم 680.";
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
            title: "💰 معرفة الرصيد",
            payload: "CHECK_BALANCE"
          },
          {
            content_type: "text",
            title: "🔄 تحويل الرصيد",
            payload: "TRANSFER_BALANCE"
          },
          {
            content_type: "text",
            title: "🌐 الباقات والعروض",
            payload: "PACKAGES"
          },
          {
            content_type: "text",
            title: "📞 خدمات إضافية",
            payload: "ADDITIONAL_SERVICES"
          },
          {
            content_type: "text",
            title: "☎️ كلمني شكراً",
            payload: "CALL_ME_BACK"
          }
        ]
      }
    }),
  });
}
