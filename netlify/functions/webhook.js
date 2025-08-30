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

          // ✅ الذكاء: تحديد مقصد العميل وإرسال ردود سريعة
          else if (userMsg.includes("الرصيد") || userMsg.includes("solde") || userMsg.includes("فلوس")) {
            await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "ماذا تود أن تعرف عن الرصيد؟", [
              { title: "📊 الرصيد الحالي", payload: "CHECK_BALANCE_PAYLOAD" },
              { title: "🔋 شحن الرصيد", payload: "RECHARGE_PAYLOAD" },
              { title: "💰 رصيد بالدين (CridiLIS)", payload: "CRIDILIS_PAYLOAD" }
            ]);
            continue;
          }
          else if (userMsg.includes("انترنت") || userMsg.includes("النت") || userMsg.includes("data") || userMsg.includes("الباقات") || userMsg.includes("العروض")) {
            await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "ماذا تود أن تعرف عن الباقات والعروض؟", [
              { title: "🌐 باقات الإنترنت", payload: "INTERNET_PACKAGES_PAYLOAD" },
              { title: "☎️ باقات المكالمات", payload: "CALL_PACKAGES_PAYLOAD" },
              { title: "📢 كل العروض", payload: "ALL_OFFERS_PAYLOAD" }
            ]);
            continue;
          }
          else if (userMsg.includes("تحويل") || userMsg.includes("فليكسي") || userMsg.includes("transfert")) {
            await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "ماذا تود أن تعرف عن تحويل الرصيد؟", [
              { title: "🔄 طريقة التحويل", payload: "HOW_TO_TRANSFER_PAYLOAD" },
              { title: "💰 تفعيل الخدمة", payload: "ACTIVATE_TRANSFER_PAYLOAD" }
            ]);
            continue;
          }
          else if (userMsg.includes("خدمة العملاء") || userMsg.includes("contact") || userMsg.includes("اتصال") || userMsg.includes("مشكلة")) {
            await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "كيف يمكنني مساعدتك؟", [
              { title: "📞 رقم خدمة العملاء", payload: "CUSTOMER_SERVICE_NUMBER_PAYLOAD" },
              { title: "📡 مشاكل الشبكة", payload: "NETWORK_ISSUE_PAYLOAD" }
            ]);
            continue;
          }
          else if (userMsg.includes("القائمة")) {
            await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "اختر الخدمة التي تناسبك 👇:", [
              { title: "💰 الرصيد", payload: "BALANCE_MENU_PAYLOAD" },
              { title: "🌐 الباقات", payload: "PACKAGES_MENU_PAYLOAD" },
              { title: "🔄 تحويل الرصيد", payload: "TRANSFER_MENU_PAYLOAD" },
              { title: "📞 خدمات أخرى", payload: "OTHER_SERVICES_MENU_PAYLOAD" }
            ]);
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
          } else if (userMsg.includes("cridilis")) {
            reply = "💰 لطلب رصيد بالدين (CridiLIS) بقيمة 20، 50، أو 100 دج: اطلب *662*3*المبلغ#";
          }


          // ✅ إرسال الرد النصي
          await sendMessage(senderId, reply, PAGE_ACCESS_TOKEN);
        } else if (webhookEvent.postback) {
          const payload = webhookEvent.postback.payload;
          let replyText = "";
          
          switch (payload) {
            case "CHECK_BALANCE_PAYLOAD":
              replyText = "📊 لمعرفة رصيدك الحالي، اطلب الكود: *#222";
              break;
            case "RECHARGE_PAYLOAD":
              replyText = "🔋 لشحن رصيدك (كارت): اطلب *111*رقم الكارت#";
              break;
            case "CRIDILIS_PAYLOAD":
              replyText = "💰 لطلب رصيد بالدين (CridiLIS) بقيمة 20، 50، أو 100 دج: اطلب *662*3*المبلغ#";
              break;
            case "INTERNET_PACKAGES_PAYLOAD":
              replyText = "🌐 لمعرفة باقات الإنترنت، اطلب الكود: *600*";
              break;
            case "CALL_PACKAGES_PAYLOAD":
              replyText = "☎️ لمعرفة باقات المكالمات، اطلب الكود: *600*";
              break;
            case "ALL_OFFERS_PAYLOAD":
              replyText = "📢 لمعرفة كل العروض والباقات، اطلب الكود: #600*";
              break;
            case "HOW_TO_TRANSFER_PAYLOAD":
              replyText = "🔄 لتحويل الرصيد (فليكسي): اطلب #610*رقم الهاتف*المبلغ*الرقم السري#\n\n- ملاحظة: لتفعيل الخدمة أول مرة اطلب #610*";
              break;
            case "ACTIVATE_TRANSFER_PAYLOAD":
              replyText = "💰 لتفعيل خدمة تحويل الرصيد أول مرة، اطلب الكود: *#610";
              break;
            case "CUSTOMER_SERVICE_NUMBER_PAYLOAD":
              replyText = "📞 للتواصل مع خدمة العملاء، اتصل بالرقم 666 أو 888.";
              break;
            case "NETWORK_ISSUE_PAYLOAD":
              replyText = "📡 لمعالجة مشاكل الشبكة، يرجى إعادة تشغيل هاتفك أو تجربة شريحتك في هاتف آخر. إذا استمرت المشكلة، يرجى التواصل مع خدمة العملاء على الرقم 666.";
              break;
            case "BALANCE_MENU_PAYLOAD":
              await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "ماذا تود أن تعرف عن الرصيد؟", [
                { title: "📊 الرصيد الحالي", payload: "CHECK_BALANCE_PAYLOAD" },
                { title: "🔋 شحن الرصيد", payload: "RECHARGE_PAYLOAD" },
                { title: "💰 رصيد بالدين (CridiLIS)", payload: "CRIDILIS_PAYLOAD" }
              ]);
              continue;
            case "PACKAGES_MENU_PAYLOAD":
              await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "ماذا تود أن تعرف عن الباقات والعروض؟", [
                { title: "🌐 باقات الإنترنت", payload: "INTERNET_PACKAGES_PAYLOAD" },
                { title: "☎️ باقات المكالمات", payload: "CALL_PACKAGES_PAYLOAD" },
                { title: "📢 كل العروض", payload: "ALL_OFFERS_PAYLOAD" }
              ]);
              continue;
            case "TRANSFER_MENU_PAYLOAD":
              await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "ماذا تود أن تعرف عن تحويل الرصيد؟", [
                { title: "🔄 طريقة التحويل", payload: "HOW_TO_TRANSFER_PAYLOAD" },
                { title: "💰 تفعيل الخدمة", payload: "ACTIVATE_TRANSFER_PAYLOAD" }
              ]);
              continue;
            case "OTHER_SERVICES_MENU_PAYLOAD":
              await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "اختر من الخدمات الإضافية:", [
                { title: "📞 المكالمات الفائتة", payload: "MISSED_CALLS_PAYLOAD" },
                { title: "🚫 مغلق/خارج التغطية", payload: "OUT_OF_SERVICE_PAYLOAD" },
                { title: "☎️ تحويل المكالمات", payload: "CALL_FORWARDING_PAYLOAD" }
              ]);
              continue;
            case "MISSED_CALLS_PAYLOAD":
              replyText = "📞 لتفعيل خدمة المكالمات الفائتة، اطلب الكود: #21*644*";
              break;
            case "OUT_OF_SERVICE_PAYLOAD":
              replyText = "🚫 لتفعيل خدمة مغلق أو خارج التغطية، اطلب الكود: #644*21*";
              break;
            case "CALL_FORWARDING_PAYLOAD":
              replyText = "☎️ لتحويل المكالمات إلى رقم آخر، اطلب الكود: *21*الرقم المراد التحويل إليه#";
              break;
            default:
              replyText = "أهلاً بك! كيف يمكنني مساعدتك؟";
          }

          if (replyText) {
            await sendMessage(senderId, replyText, PAGE_ACCESS_TOKEN);
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

// 🔹 إرسال أزرار سريعة (Quick Replies)
async function sendQuickReplies(senderId, token, text, quickReplies) {
  await fetch(`https://graph.facebook.com/v16.0/me/messages?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: senderId },
      message: {
        text: text,
        quick_replies: quickReplies.map(qr => ({
          content_type: "text",
          title: qr.title,
          payload: qr.payload
        }))
      }
    }),
  });
}
