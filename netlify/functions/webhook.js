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

          let reply = "شكراً لتواصلك مع موبليس 😊 كيف نقدر نساعدك؟"; // Default reply, might be overwritten

          // ✅ الردود الذكية
          if (userMsg.includes("مرحبا") || userMsg.includes("السلام")) {
            reply = "أهلاً وسهلاً 👋 مرحبا بك في خدمة عملاء موبليس. كيف نقدر نساعدك اليوم؟";
          }
          else if (userMsg.includes("الرصيد")) {
            reply = "📱 لمعرفة رصيدك الحالي، اطلب #222* من هاتفك. يمكنك أيضاً الاطلاع على تفاصيل الرصيد وتعبئته أونلاين عبر الرابط التالي: https://www.mobilis.dz/particuliers/recharge-paiement";
          }
          else if (userMsg.includes("عروض الإنترنت") || userMsg.includes("النت") || userMsg.includes("انترنت") || userMsg.includes("جيجا")) {
            reply = "🌐 استكشف مجموعة واسعة من عروض الإنترنت والباقات المتنوعة من موبليس! سواء كنت تبحث عن إنترنت منزلي، إنترنت للموبايل، أو باقات 4G، كل ما تحتاجه متوفر هنا: https://www.mobilis.dz/particuliers/internet أو اطلب *600# للمزيد من التفاصيل.";
          }
          else if (userMsg.includes("العروض") || userMsg.includes("باقات") || userMsg.includes("باقة") || userMsg.includes("برومو")) {
            reply = "📢 عروض موبليس متجددة باستمرار لتناسب جميع احتياجاتك! لا تفوت فرصة اكتشاف آخر العروض على المكالمات، الرسائل، والإنترنت. تفضل بزيارة صفحة العروض لدينا: https://www.mobilis.dz/particuliers/promotions أو اطلب *600# من هاتفك.";
          }
          else if (userMsg.includes("خدمة العملاء") || userMsg.includes("اتصال") || userMsg.includes("تواصل") || userMsg.includes("تكلم")) {
            reply = "☎️ للتحدث مباشرة مع أحد ممثلي خدمة العملاء، يرجى الاتصال على الرقم 888 من أي خط موبليس. إذا كنت تتصل من شبكة أخرى، يمكنك الاتصال على 0660 600 888. نحن هنا لمساعدتك على مدار الساعة.";
          }
          else if (userMsg.includes("فاتورة") || userMsg.includes("الفاتورة") || userMsg.includes("دفع") || userMsg.includes("الدفع")) {
            reply = "💳 لمعرفة تفاصيل فاتورتك الشهرية أو لدفعها، اطلب #111* من هاتفك أو تفضل بزيارة أقرب وكالة موبليس. يمكنك أيضاً الدفع بأمان وسهولة عبر الإنترنت من خلال بوابتنا الإلكترونية: https://www.mobilis.dz/particuliers/recharge-paiement";
          }
          else if (userMsg.includes("تحويل رصيد") || userMsg.includes("تحويل") || userMsg.includes("سلفني") || userMsg.includes("إهداء رصيد")) {
            reply = "🔄 لخدمة تحويل الرصيد (سلفني)، اطلب: *610*الرقم*المبلغ# ✔️. يجب أن يكون المبلغ من 50 دينار جزائري فما فوق. لمزيد من التفاصيل حول شروط الخدمة: https://www.mobilis.dz/particuliers/services/transfert-de-credit";
          }
          else if (userMsg.includes("تغطية") || userMsg.includes("الشبكة") || userMsg.includes("تغطية الشبكة") || userMsg.includes("4G")) {
            reply = "📡 للتأكد من مدى تغطية شبكة موبليس (2G, 3G, 4G LTE) في منطقتك، يرجى زيارة صفحة التغطية الخاصة بنا حيث يمكنك إدخال ولايتك ومدينتك: https://www.mobilis.dz/coverage. نحن نسعى لتوفير أفضل تغطية في جميع أنحاء الوطن.";
          }
          else if (userMsg.includes("بريد صوتي") || userMsg.includes("صوتي") || userMsg.includes("الرسائل الصوتية")) {
            reply = "📞 لتفعيل خدمة البريد الصوتي الخاصة بك أو لإدارتها، اطلب **2121#* ثم اتبع التعليمات الصوتية. هذه الخدمة تتيح لك استقبال الرسائل عندما تكون خارج التغطية أو خطك مشغولاً. لمزيد من المعلومات: https://www.mobilis.dz/particuliers/services/messagerie-vocale";
          }
          else if (userMsg.includes("خدمات")) {
            reply = "موبليس تقدم مجموعة واسعة من الخدمات المبتكرة التي تلبي احتياجاتك اليومية. اكتشف جميع خدماتنا مثل تحويل الرصيد، البريد الصوتي، وخدمات التجوال هنا: https://www.mobilis.dz/particuliers/services";
          }
          else if (userMsg.includes("جيل رابع") || userMsg.includes("4G")) {
            reply = "استمتع بسرعة فائقة وتجربة إنترنت مميزة مع شبكة الجيل الرابع 4G LTE من موبليس! للتحقق من تغطية 4G في منطقتك، زر: https://www.mobilis.dz/coverage. يمكنك أيضاً ترقية شريحتك إلى 4G في أقرب وكالة موبليس.";
          }
          else if (userMsg.includes("تعبئة") || userMsg.includes("شحن رصيد") || userMsg.includes("كارت تعبئة")) {
            reply = "يمكنك تعبئة رصيدك بسهولة عبر بطاقات التعبئة المتوفرة في جميع نقاط البيع، أو اختر الشحن الإلكتروني الآمن والسريع عبر موقعنا: https://www.mobilis.dz/particuliers/recharge-paiement";
          }
          else if (userMsg.includes("شركات") || userMsg.includes("أعمال") || userMsg.includes("حلول مهنية")) {
            reply = "موبليس تقدم حلولاً اتصالاتية مبتكرة ومخصصة للشركات والمؤسسات. اكتشف باقاتنا وخدماتنا الاحترافية التي تساعد أعمالك على النمو والتواصل الفعال: https://www.mobilis.dz/entreprises";
          }
          else if (userMsg.includes("الهواتف") || userMsg.includes("اجهزة") || userMsg.includes("جوالات")) {
            reply = "اكتشف أحدث الهواتف الذكية والأجهزة اللوحية المتوفرة مع عروض موبليس الحصرية. احصل على جهازك الجديد مع باقة تناسبك: https://www.mobilis.dz/particuliers/telephones";
          }
          else if (userMsg.includes("تجوال") || userMsg.includes("روامينغ") || userMsg.includes("سفر")) {
            reply = "استمتع بخدمة التجوال الدولي مع موبليس أينما ذهبت! للاطلاع على الأسعار وتفعيل الخدمة، يرجى زيارة صفحة التجوال: https://www.mobilis.dz/particuliers/services/roaming. نتمنى لك رحلة ممتعة!";
          }
          else if (userMsg.includes("الشبكات الاجتماعية") || userMsg.includes("فيسبوك") || userMsg.includes("إنستغرام")) {
            reply = "تواصل معنا عبر صفحاتنا الرسمية على الشبكات الاجتماعية! \nفيسبوك: https://www.facebook.com/MobilisOfficielle \nإنستغرام: https://www.instagram.com/mobilis_officielle \nتويتر: https://twitter.com/MobilisOfficiel \nلينكدإن: https://www.linkedin.com/company/mobilis-officielle/";
          }
          else if (userMsg.includes("وكالات") || userMsg.includes("فروع") || userMsg.includes("أين أجدكم")) {
            reply = "ابحث عن أقرب وكالة أو نقطة بيع لموبليس إليك! استخدم محدد الوكالات على موقعنا للعثور على أقرب فرع يقدم لك خدماتنا: https://www.mobilis.dz/particuliers/points-de-vente";
          }
          else if (userMsg.includes("شريحة") || userMsg.includes("SIM") || userMsg.includes("خط جديد")) {
            reply = "للحصول على شريحة SIM جديدة أو استبدال شريحة مفقودة، يرجى زيارة أقرب وكالة موبليس مع وثيقة هوية سارية المفعول. يمكننا مساعدتك في اختيار الخط المناسب لاحتياجاتك.";
          }
          else if (userMsg.includes("إعدادات الإنترنت") || userMsg.includes("ضبط الإنترنت") || userMsg.includes("APN")) {
            reply = "إذا واجهت مشاكل في إعدادات الإنترنت، تأكد من أن نقطة الوصول (APN) مضبوطة على 'internet'. إذا استمرت المشكلة، يرجى التواصل مع خدمة العملاء للحصول على مساعدة فنية.";
          }
          else if (userMsg.includes("الشكاوى") || userMsg.includes("مشكلة") || userMsg.includes("بلاغ")) {
            reply = "نحن آسفون لسماع أنك تواجه مشكلة. يمكنك تقديم شكوى أو بلاغ عبر الاتصال بخدمة العملاء على 888، أو زيارة أقرب وكالة، أو ملء نموذج الاتصال على موقعنا: https://www.mobilis.dz/contact";
          }
          else if (userMsg.includes("القائمة") || userMsg.includes("خيارات") || userMsg.includes("ماذا يمكنني أن أفعل")) {
            // عرض أزرار سريعة بدل النصوص
            await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN);
            return { statusCode: 200, body: "EVENT_RECEIVED" }; // نوقف هنا عشان ما يرسل رسالة نصية ثانية
          }
          else if (userMsg.includes("شكرا") || userMsg.includes("thanks") || userMsg.includes("شكراً")) {
            reply = "🌹 على الرحب والسعة! يسعدنا دائماً خدمتك. لا تتردد في التواصل معنا مرة أخرى إذا احتجت لأي مساعدة.";
          }
          else if (userMsg.includes("مساعدة")) {
            reply = "يسعدنا دائماً مساعدتك! يمكنك سؤالي عن الرصيد، عروض الإنترنت، الفواتير، خدمات التجوال، أو أي خدمة أخرى. يمكنك أيضاً كتابة 'القائمة' لرؤية جميع الخيارات السريعة المتاحة.";
          }
          // ✅ الرد الافتراضي (Fallback) لجميع الأسئلة الأخرى غير المحددة
          else {
            reply = "عذراً، لم أفهم سؤالك تماماً. هل يمكنك إعادة صياغة سؤالك أو اختيار أحد الخيارات التالية للمساعدة؟\n\n📱 الرصيد\n🌐 عروض الإنترنت\n☎️ خدمة العملاء\n📢 العروض والباقات\n\nأو يمكنك كتابة 'القائمة' لرؤية جميع الخيارات المتاحة.";
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
            title: "📢 العروض والباقات",
            payload: "PROMOTIONS"
          },
          {
            content_type: "text",
            title: "☎️ خدمة العملاء",
            payload: "CUSTOMER_SERVICE"
          },
          {
            content_type: "text",
            title: "💳 الفاتورة والدفع",
            payload: "BILL_PAYMENT"
          },
          {
            content_type: "text",
            title: "🔄 تحويل رصيد",
            payload: "CREDIT_TRANSFER"
          },
          {
            content_type: "text",
            title: "📡 تغطية الشبكة",
            payload: "NETWORK_COVERAGE"
          },
          {
            content_type: "🌍 التجوال الدولي",
            title: "🌍 التجوال الدولي",
            payload: "ROAMING"
          },
          {
            content_type: "text",
            title: "🔗 جميع الخدمات",
            payload: "ALL_SERVICES"
          },
          {
            content_type: "text",
            title: "❓ مساعدة",
            payload: "HELP"
          }
        ]
      }
    }),
  });
}
