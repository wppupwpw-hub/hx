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

        if (webhookEvent.message && webhookEvent.message.text) {
          const userMsg = webhookEvent.message.text.trim().toLowerCase();
          console.log("📩 رسالة من العميل:", userMsg);

          // ✅ طلب القائمة
          if (userMsg.includes("القائمة") || userMsg.includes("menu")) {
            await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN);
            return { statusCode: 200, body: "EVENT_RECEIVED" };
          }

          let reply = null;

          // 👋 ردود اجتماعية
          if (userMsg.includes("مرحبا") || userMsg.includes("سلام")) {
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
          } else if (userMsg.includes("صباح الخير")) {
            reply = "☀️ صباح النور والسرور! يومك سعيد.";
          } else if (userMsg.includes("مساء الخير")) {
            reply = "🌆 مساء الورد والياسمين.";
          } else if (userMsg.includes("نكتة")) {
            reply = "😂 نكتة: واحد راح للطبيب قالو: ما نسمعش مليح. الطبيب قالو: واش قلت؟ 🤣";
          }

          // 📊 خدمات موبيليس (حسب الجدول)
          else if (userMsg.includes("الرصيد") || userMsg.includes("222")) {
            reply = "📊 لمعرفة رصيدك: #222*";
          } else if (userMsg.includes("رقمي") || userMsg.includes("معرفة الرقم") || userMsg.includes("505") || userMsg.includes("101")) {
            reply = "📱 لمعرفة رقمك: #101* أو الاتصال بـ 505";
          } else if (userMsg.includes("شحن") || userMsg.includes("كارت")) {
            reply = "🔋 لشحن رصيدك: *111*رقم الكارت#";
          } else if (userMsg.includes("فليكسي") || userMsg.includes("تحويل") || userMsg.includes("610")) {
            reply = "🔄 خدمة فليكسي: #610*رقم الهاتف*المبلغ*الرقم السري#\nℹ️ للتفعيل أول مرة اطلب #610* وأدخل رقم سري.";
          } else if (userMsg.includes("العروض") || userMsg.includes("باقات") || userMsg.includes("600")) {
            reply = "🌐 عروض وباقات موبيليس: #600*";
          } else if (userMsg.includes("كلمني") || userMsg.includes("606")) {
            reply = "📩 خدمة كلمني شكراً: *606*رقم الهاتف#";
          } else if (userMsg.includes("رونفوا") || userMsg.includes("تحويل المكالمات")) {
            reply = "☎️ لتحويل المكالمات: *21*الرقم#\n❌ إلغاء: #21#";
          } else if (userMsg.includes("مغلق") || userMsg.includes("خارج التغطية")) {
            reply = "🚫 لتفعيل خدمة مغلق: #644*21* \n❌ إلغاء: #002* أو #21#";
          } else if (userMsg.includes("فاتتني") || userMsg.includes("مكالمات فائتة")) {
            reply = "📞 المكالمات الفائتة: #21*644*";
          } else if (userMsg.includes("خدمات اضافية") || userMsg.includes("رنتي") || userMsg.includes("mob sound") || userMsg.includes("men3andi") || userMsg.includes("mobinfo") || userMsg.includes("mobmic")) {
            reply = "🎵 خدمات إضافية:\n- إلغاء رنتي: #680*\n- إلغاء Mob Sound: SMS بكلمة DES إلى 4121\n- إلغاء Men3andi: #4*618*\n- إلغاء Mobinfo: SMS بكلمة DES + حرف الباقة إلى 620\n- إلغاء Mobmic: #682*";
          } else if (userMsg.includes("كريدي") || userMsg.includes("cridilis") || userMsg.includes("662")) {
            reply = "💡 CridiLIS: اطلب *662*3*المبلغ# (20، 50 أو 100 دج).\n⚠️ تضاف 10 دج رسوم عند التعبئة.";
          } else if (userMsg.includes("تسجيل") || userMsg.includes("register")) {
            reply = "📝 تسجيل موبيليس:\n- أرسل بريد إلكتروني (email) في SMS إلى 666.\n- بعد 48 ساعة تتحصل على 2Go أو أكثر 🎉\n🌐 رابط: https://www.mobilis.dz/register";
          }

          // 🌍 روابط عامة
          else if (userMsg.includes("موقع")) {
            reply = "🌐 موقع موبيليس: https://www.mobilis.dz";
          } else if (userMsg.includes("وكالة") || userMsg.includes("فرع")) {
            reply = "📍 أقرب وكالة: https://www.mobilis.dz/coverage";
          } else if (userMsg.includes("مساعدة") || userMsg.includes("help")) {
            reply = "💡 يمكنك كتابة: رصيد، رقم، شحن، فليكسي، عروض، كلمني، رونفوا، مغلق، كريدي، تسجيل...";
          }

          // ✅ رد افتراضي
          else {
            reply = "🤖 لم أفهم طلبك. جرب كتابة 'القائمة' لرؤية الخدمات المتاحة.";
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

// 🔹 إرسال Quick Replies (قائمة خدمات)
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
