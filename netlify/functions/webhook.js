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

        // ✅ POSTBACK (الأزرار)
        if (webhookEvent.postback && webhookEvent.postback.payload) {
          const payload = webhookEvent.postback.payload;

          if (payload === "BALANCE") {
            await sendMessage(senderId, "📊 لمعرفة رصيدك: #222*", PAGE_ACCESS_TOKEN);
          }
          else if (payload === "INTERNET") {
            await sendOffers(senderId, PAGE_ACCESS_TOKEN); // عروض Twenty
          }
          else if (payload === "FLEXI") {
            await sendMessage(senderId, "🔄 تحويل رصيد: #610*", PAGE_ACCESS_TOKEN);
          }
          else if (payload === "CUSTOMER") {
            await sendMessage(senderId, "☎️ خدمة العملاء: اتصل بـ 888.", PAGE_ACCESS_TOKEN);
          }
          continue;
        }

        // ✅ الرسائل النصية
        if (webhookEvent.message && webhookEvent.message.text) {
          const userMsg = webhookEvent.message.text.trim().toLowerCase();
          console.log("📩 رسالة من العميل:", userMsg);

          let reply = "شكراً لتواصلك مع موبليس 😊 اكتب 'القائمة' إذا كنت تريد الأزرار.";

          // ✅ طلب القائمة
          if (userMsg.includes("القائمة") || userMsg.includes("نعم") || userMsg.includes("menu")) {
            await sendWelcomeButtons(senderId, PAGE_ACCESS_TOKEN);
            continue;
          }

          // 👥 ردود اجتماعية
          if (userMsg.includes("مرحبا") || userMsg.includes("السلام")) reply = "👋 أهلاً وسهلاً! كيف حالك؟";
          else if (userMsg.includes("كيفك") || userMsg.includes("واش راك")) reply = "😊 بخير الحمد لله، وانت؟";
          else if (userMsg.includes("تمام") || userMsg.includes("بخير")) reply = "🙌 رائع! يسعدني سماع ذلك.";
          else if (userMsg.includes("😂") || userMsg.includes("ههه")) reply = "🤣 هاها! ضحكتني.";
          else if (userMsg.includes("حزين") || userMsg.includes("زعلان")) reply = "💙 ما تزعلش، ربي يفرجها.";
          else if (userMsg.includes("احبك") || userMsg.includes("نحبك")) reply = "❤️ وأنا نحبك بزاف!";
          else if (userMsg.includes("صباح الخير")) reply = "☀️ صباح النور! يوم سعيد.";
          else if (userMsg.includes("مساء الخير")) reply = "🌆 مساء الورد والياسمين.";
          else if (userMsg.includes("نكتة")) reply = "😂 نكتة: واحد راح للطبيب قالو ما نسمعش مليح.. الطبيب: واش قلت؟ 🤣";

          // 📊 خدمات وأكواد موبيليس
          else if (userMsg.includes("الرصيد") || userMsg.includes("222")) {
            reply = "📊 لمعرفة رصيدك: #222*";
          }
          else if (userMsg.includes("رقمي") || userMsg.includes("معرفة الرقم") || userMsg.includes("505") || userMsg.includes("101")) {
            reply = "📱 لمعرفة رقمك: #101* أو اتصل بـ 505";
          }
          else if (userMsg.includes("شحن") || userMsg.includes("تعبئة") || userMsg.includes("كارت")) {
            reply = "🔋 لشحن رصيدك: *111*رقم الكارت# (يمكنك أيضاً شحن الباقات).";
          }
          else if (userMsg.includes("تحويل") || userMsg.includes("فليكسي") || userMsg.includes("610")) {
            reply = "🔄 خدمة تحويل الرصيد:\n- تسجيل: #610* واختار رقم سري.\n- رمز التسجيل: 9999.\n- شحن: *1*610*الكود*المبلغ*كلمة المرور#.\n- تحويل: *610*الرقم*المبلغ*الرقم السري#.";
          }
          else if (userMsg.includes("العروض") || userMsg.includes("باقات") || userMsg.includes("600")) {
            await sendOffers(senderId, PAGE_ACCESS_TOKEN); // 🔹 استدعاء عروض Twenty
            continue;
          }
          else if (userMsg.includes("كلمني") || userMsg.includes("606")) {
            reply = "📩 خدمة كلمني شكراً: *606*رقم الهاتف#";
          }
          else if (userMsg.includes("sms مجاني")) {
            reply = "✉️ لإرسال SMS مجاني: *606*رقم المرسل إليه#";
          }
          else if (userMsg.includes("رونفوا") || userMsg.includes("تحويل المكالمات")) {
            reply = "☎️ تحويل المكالمات: *21*الرقم المراد التحويل إليه# — إلغاء: #21#";
          }
          else if (userMsg.includes("المكالمات الفائتة")) {
            reply = "📞 المكالمات الفائتة: #21*644*";
          }
          else if (userMsg.includes("انتظار المكالمات")) {
            reply = "⏳ لتفعيل انتظار المكالمات: *21*#644";
          }
          else if (userMsg.includes("مغلق") || userMsg.includes("خارج التغطية")) {
            reply = "🚫 مغلق/خارج التغطية: #644*21*.\n❌ إلغاء: #002* أو #21#";
          }
          else if (userMsg.includes("فاتورة") || userMsg.includes("bill")) {
            reply = "💳 لمعرفة الفاتورة: *222# أو اتصل بـ 888";
          }

          // 🎵 خدمات إضافية
          else if (userMsg.includes("نغمتي") || userMsg.includes("نغمتي") || userMsg.includes("680")) {
            reply = "🎵 إلغاء رنتي: #680* أو SMS بكلمة DES إلى 680.";
          }
          else if (userMsg.includes("mob sound")) {
            reply = "🎶 إلغاء Mob Sound: SMS بكلمة DES إلى 4121.";
          }
          else if (userMsg.includes("من عندي") || userMsg.includes("men3andi")) {
            reply = "📵 إلغاء Men3andi: #4*618*";
          }
          else if (userMsg.includes("mobinfo")) {
            reply = "ℹ️ إلغاء Mobinfo: SMS بكلمة des + حرف الباقة إلى 620.";
          }
          else if (userMsg.includes("mobmic")) {
            reply = "🎤 إلغاء Mobmic: #682*";
          }
          // ✅ عروض Twenty (الرد على Quick Replies)
          else if (userMsg.includes("عرض 1") || userMsg.includes("offer 1")) {
            reply = "🎁 عرض 1:\nالسعر: 500 دج / 15 يوم\n5 جيغا إنترنت\nمكالمات ورسائل غير محدودة نحو موبيليس\n1000 دج للمكالمات نحو الشبكات الأخرى";
          }
          else if (userMsg.includes("عرض 2") || userMsg.includes("offer 2")) {
            reply = "🎁 عرض 2:\nالسعر: 100 دج / 24 ساعة\n1 جيغا إنترنت\nمكالمات ورسائل غير محدودة نحو موبيليس\n200 دج للمكالمات نحو الشبكات الأخرى";
          }
          else if (userMsg.includes("عرض 3") || userMsg.includes("offer 3")) {
            reply = "🎁 عرض 3:\nالسعر: 50 دج / 24 ساعة\n500 ميغا إنترنت\nمكالمات ورسائل غير محدودة نحو موبيليس\n50 دج للمكالمات نحو الشبكات الأخرى";
          }
          else if (userMsg.includes("عرض 4") || userMsg.includes("offer 4")) {
            reply = "🎁 عرض 4:\nالسعر: 1000 دج / شهرياً\n15 جيغا إنترنت\nمكالمات ورسائل غير محدودة نحو موبيليس\n2000 دج للمكالمات نحو الشبكات الأخرى";
          }

          // 🌍 ردود عامة
            else if (userMsg.includes("رونفوا") || userMsg.includes("تحويل المكالمات")) {
            reply = "☎️ لتحويل المكالمات: *21*الرقم#\n❌ إلغاء: #21#";
          }
            else if (userMsg.includes("مغلق") || userMsg.includes("خارج التغطية")) {
            reply = "🚫 لتفعيل خدمة مغلق: #644*21* \n❌ إلغاء: #002* أو #21#";
          }
            else if (userMsg.includes("فاتتني") || userMsg.includes("مكالمات فائتة")) {
            reply = "📞 المكالمات الفائتة: #21*644*";
          }
            else if (userMsg.includes("خدمات اضافية") || userMsg.includes("رنتي") || userMsg.includes("mob sound") || userMsg.includes("men3andi") || userMsg.includes("mobinfo") || userMsg.includes("mobmic")) {
            reply = "🎵 خدمات إضافية:\n- إلغاء رنتي: #680*\n- إلغاء Mob Sound: SMS بكلمة DES إلى 4121\n- إلغاء Men3andi: #4*618*\n- إلغاء Mobinfo: SMS بكلمة DES + حرف الباقة إلى 620\n- إلغاء Mobmic: #682*";
          }
            else if (userMsg.includes("كريدي") || userMsg.includes("cridilis") || userMsg.includes("662")) {
            reply = "💡 CridiLIS: اطلب *662*3*المبلغ# (20، 50 أو 100 دج).\n⚠️ تضاف 10 دج رسوم عند التعبئة.";
          }
            else if (userMsg.includes("تسجيل") || userMsg.includes("register")) {
            reply = "📝 تسجيل موبيليس:\n- أرسل بريد إلكتروني (email) في SMS إلى 666.\n- بعد 48 ساعة تتحصل على 2Go أو أكثر 🎉\n🌐 رابط: https://www.mobilis.dz/register";
            }
          else if (userMsg.includes("مساعدة") || userMsg.includes("help")) {
            reply = "💡 يمكنك كتابة: رصيد، شحن، فليكسي، عروض، رونفوا، مغلق، فاتورة، كلمني شكراً، كريدي، تسجيل...";
          }
          else if (userMsg.includes("موقع")) {
            reply = "🌐 موقع موبيليس: https://www.mobilis.dz";
          }
          else if (userMsg.includes("وكالة") || userMsg.includes("فرع")) {
            reply = "📍 أقرب وكالة: https://www.mobilis.dz/coverage";
          }
          else {
            reply = "⚠️ لم أفهم طلبك. جرب: رصيد، شحن، فليكسي، عروض، كريدي، تسجيل...";
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

// 🔹 إرسال أزرار البداية
async function sendWelcomeButtons(senderId, token) {
  await fetch(`https://graph.facebook.com/v16.0/me/messages?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: senderId },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: "اختر الخدمة التي تناسبك 👇",
            buttons: [
              { type: "postback", title: "📱 الرصيد", payload: "BALANCE" },
              { type: "postback", title: "🌐 العروض", payload: "INTERNET" },
              { type: "postback", title: "🔄 فليكسي", payload: "FLEXI" },
              { type: "postback", title: "☎️ خدمة العملاء", payload: "CUSTOMER" } 
              { content_type: "text", title: "☎️ رونفوا", payload: "RONVOI" },
              { content_type: "text", title: "🚫 مغلق", payload: "OFFLINE" },
              { content_type: "text", title: "📞 فائتة", payload: "MISSED" },
              { content_type: "text", title: "🎵 رنتي", payload: "EXTRA" },
              { content_type: "text", title: "💡 كريدي", payload: "CREDILIS" },
              { content_type: "text", title: "📝 تسجيل", payload: "REGISTER" }
            ]
          }
        }
      }
    }),
  });
}

// 🔹 إرسال عروض Twenty كـ Quick Replies
async function sendOffers(senderId, token) {
  await fetch(`https://graph.facebook.com/v16.0/me/messages?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: senderId },
      messaging_type: "RESPONSE",
      message: {
        text: "✨ اختر العرض المناسب لك من عروض Twenty 👇",
        quick_replies: [
          { content_type: "text", title: "🎁 عرض 1", payload: "OFFER_1" },
          { content_type: "text", title: "🎁 عرض 2", payload: "OFFER_2" },
          { content_type: "text", title: "🎁 عرض 3", payload: "OFFER_3" },
          { content_type: "text", title: "🎁 عرض 4", payload: "OFFER_4" }
        ]
      }
    }),
  });
}
