// netlify/functions/webhook.js

export async function handler(event, context) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  // ✅ Facebook verification
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

  // ✅ Handle incoming messages and postbacks
  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body);

    if (body.object === "page") {
      for (const entry of body.entry) {
        const webhookEvent = entry.messaging[0];
        const senderId = webhookEvent.sender.id;

        if (webhookEvent.message) {
          const userMsg = webhookEvent.message.text ? webhookEvent.message.text.trim().toLowerCase() : '';
          const quickReplyPayload = webhookEvent.message.quick_reply ? webhookEvent.message.quick_reply.payload : null;

          console.log("📩 User message:", userMsg);
          console.log("💬 Quick reply payload:", quickReplyPayload);
          
          let replyText = "";
          
          if (quickReplyPayload) {
            // Handle quick reply payloads
            switch (quickReplyPayload) {
              case "CHECK_BALANCE":
                replyText = "📊 لمعرفة رصيدك الحالي، اطلب الكود: #222*";
                break;
              case "CHECK_NUMBER":
                replyText = "📱 لمعرفة رقمك في موبيليس، اطلب الكود: #101*";
                break;
              case "RECHARGE_CARD":
                replyText = "🔋 لشحن رصيدك باستعمال البطاقة: اطلب الكود #رقم الكارت*111*";
                break;
              case "RECHARGE_VOICE":
                replyText = "🔋 لشحن رصيدك عبر المكالمة: اتصل على الرقم 111 ثم اختر 1 بعدها أدخل الأرقام.";
                break;
              case "CRIDILIS":
                replyText = "💰 لطلب رصيد بالدين (CridiLIS) بقيمة 20، 50، أو 100 دج: اطلب الكود #المبلغ*3*662*";
                break;
              case "HOW_TO_TRANSFER":
                replyText = "🔄 لتحويل رصيد (فليكسي): اطلب الكود #الرقم السري*المبلغ*رقم الهاتف*610*";
                break;
              case "ACTIVATE_TRANSFER":
                replyText = "🔗 لتفعيل خدمة تحويل الرصيد (فليكسي) أول مرة: اطلب الكود *#610";
                break;
              case "PACKAGES_AND_OFFERS":
                replyText = "🌐 لمعرفة كل العروض والباقات اليومية، الأسبوعية، والشهرية، اطلب الكود #600*";
                break;
              case "CALL_ME_BACK":
                replyText = "💬 لإرسال رسالة 'كلمني شكراً'، اطلب الكود #رقم المرسل إليه*606*";
                break;
              case "OUT_OF_COVERAGE":
                replyText = "🚫 لتفعيل خدمة 'مغلق أو خارج التغطية'، اطلب الكود #0662*21*";
                break;
              case "OUT_OF_COVERAGE_CANCEL":
                replyText = "❌ لإلغاء خدمة 'مغلق أو خارج التغطية'، اطلب الكود #002* أو #21#";
                break;
              case "WRONG_NUMBER":
                replyText = "❌ لتفعيل خدمة 'الرقم خاطئ أو غير موجود'، اطلب الكود #0000*21*";
                break;
              case "CALL_FORWARDING":
                replyText = "➡️ لتحويل المكالمات إلى رقم آخر، اطلب الكود #الرقم المراد التحويل إليه*21*";
                break;
              case "CALL_FORWARDING_CANCEL":
                replyText = "❌ لإلغاء خدمة تحويل المكالمات، اطلب الكود #21#";
                break;
              case "MISSED_CALLS":
                replyText = "☎️ لتفعيل خدمة المكالمات الفائتة، اطلب الكود #644*21*";
                break;
              case "MASK_NUMBER":
                replyText = "😎 لإخفاء رقمك (ماسك)، اطلب الكود #31# قبل الرقم المراد الاتصال به.";
                break;
              case "CALL_WAITING":
                replyText = "⏳ لتفعيل خدمة انتظار المكالمات، اطلب الكود #644*21*";
                break;
              case "CANCEL_RANATI":
                replyText = "🎵 لإلغاء خدمة 'رنتي'، أرسل كلمة DES عبر رسالة SMS إلى الرقم 680.";
                break;
              case "CUSTOMER_SERVICE_NUMBER":
                replyText = "📞 للتواصل مع خدمة الزبائن، اتصل على الرقم 666 أو 888.";
                break;
              case "MOBILIS_REGISTER":
                replyText = "📝 للتسجيل في موبيليس والحصول على 2Go أو أكثر: أرسل رسالة SMS ببريدك الإلكتروني إلى الرقم 666. ستحصل على الباقة بعد 48 ساعة. يمكنك أيضاً زيارة الرابط: https://www.mobilis.dz/register";
                break;
              case "BALANCE_MENU":
                await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "ماذا تود أن تعرف عن الرصيد؟", [
                  { title: "📊 الرصيد الحالي", payload: "CHECK_BALANCE" },
                  { title: "📱 معرفة الرقم", payload: "CHECK_NUMBER" },
                  { title: "🔋 شحن الرصيد", payload: "RECHARGE_MENU" },
                  { title: "💰 رصيد بالدين", payload: "CRIDILIS" }
                ]);
                continue;
              case "RECHARGE_MENU":
                await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "اختر طريقة شحن الرصيد:", [
                  { title: "💳 باستعمال البطاقة", payload: "RECHARGE_CARD" },
                  { title: "📞 بالاتصال", payload: "RECHARGE_VOICE" }
                ]);
                continue;
              case "TRANSFER_MENU":
                await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "ماذا تود أن تعرف عن تحويل الرصيد (فليكسي)؟", [
                  { title: "🔄 طريقة التحويل", payload: "HOW_TO_TRANSFER" },
                  { title: "🔗 تفعيل الخدمة", payload: "ACTIVATE_TRANSFER" }
                ]);
                continue;
              case "PACKAGES_MENU":
                await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "اختر ما يناسبك:", [
                  { title: "🌐 العروض والباقات", payload: "PACKAGES_AND_OFFERS" },
                  { title: "📝 تسجيل موبيليس", payload: "MOBILIS_REGISTER" }
                ]);
                continue;
              case "ADDITIONAL_SERVICES_MENU":
                await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "اختر من الخدمات الإضافية:", [
                  { title: "💬 كلمني شكراً", payload: "CALL_ME_BACK" },
                  { title: "🚫 مغلق / خارج التغطية", payload: "OUT_OF_COVERAGE" },
                  { title: "❌ إلغاء خدمات", payload: "CANCEL_SERVICES_MENU" }
                ]);
                continue;
              case "CANCEL_SERVICES_MENU":
                await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "اختر الخدمة التي تريد إلغاءها:", [
                  { title: "➡️ تحويل المكالمات", payload: "CALL_FORWARDING_CANCEL" },
                  { title: "🚫 مغلق", payload: "OUT_OF_COVERAGE_CANCEL" },
                  { title: "🎵 رنتي", payload: "CANCEL_RANATI" }
                ]);
                continue;
              default:
                replyText = "أهلاً بك! كيف يمكنني مساعدتك؟";
            }
          } else {
            // ✅ الردود الاجتماعية والإنسانية
            if (userMsg.includes("كيفك") || userMsg.includes("واش راك") || userMsg.includes("عامل ايه")) {
              replyText = "😊 الحمد لله بخير، شكراً لسؤالك. وانت كيف حالك؟";
            } else if (userMsg.includes("صباح الخير")) {
              replyText = "☀️ صباح النور! أتمنى لك يوماً جميلاً ومباركاً.";
            } else if (userMsg.includes("مساء الخير")) {
              replyText = "🌆 مساء الورد والياسمين.";
            } else if (userMsg.includes("تصبح على خير")) {
              replyText = "🌙 تصبح على خير وأحلام سعيدة.";
            } else if (userMsg.includes("تمام") || userMsg.includes("بخير") || userMsg.includes("الحمد لله")) {
              replyText = "🙌 رائع! يسعدني سماع ذلك.";
            } else if (userMsg.includes("شكراً") || userMsg.includes("عفواً") || userMsg.includes("thanks")) {
              replyText = "🌹 على الرحب والسعة، نحن دائماً في خدمتك.";
            } else if (userMsg.includes("أحبك") || userMsg.includes("نحبك")) {
              replyText = "❤️ وأنا نحبك بزاف! شكراً على كلامك الطيب.";
            } else if (userMsg.includes("😂") || userMsg.includes("ههه") || userMsg.includes("lol")) {
              replyText = "🤣 هاها! ضحكتني والله.";
            } else if (userMsg.includes("🥺") || userMsg.includes("حزين") || userMsg.includes("زعلان")) {
              replyText = "💙 لا تزعل، إن شاء الله كل شيء يتصلح.";
            } else if (userMsg.includes("غبي") || userMsg.includes("لا تفهم")) {
              replyText = "😔 أنا مجرد روبوت أحاول المساعدة. سأحاول أن أفهمك بشكل أفضل في المرة القادمة.";
            } else if (userMsg.includes("من انت") || userMsg.includes("من تكون")) {
              replyText = "أنا روبوت موبيليس، مهمتي هي مساعدتك في كل ما يخص خدمات الشركة. 😊";
            }
            // ✅ الردود الخاصة بالخدمات
            else if (userMsg.includes("القائمة") || userMsg.includes("خدمات")) {
              await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "اختر الخدمة التي تناسبك 👇:", [
                { title: "💰 الرصيد ومعرفة الرقم", payload: "BALANCE_MENU" },
                { title: "🔄 تحويل الرصيد (فليكسي)", payload: "TRANSFER_MENU" },
                { title: "🌐 العروض والباقات", payload: "PACKAGES_MENU" },
                { title: "📞 خدمات إضافية", payload: "ADDITIONAL_SERVICES_MENU" }
              ]);
              continue;
            } else if (userMsg.includes("معرفة الرصيد") || userMsg.includes("رصيد") || userMsg.includes("solde")) {
              replyText = "📊 لمعرفة رصيدك الحالي، اطلب الكود: #222*";
            } else if (userMsg.includes("شحن الرصيد") || userMsg.includes("تعبئة") || userMsg.includes("recharge")) {
              replyText = "🔋 لشحن رصيدك باستعمال الكارت: اطلب الكود #رقم الكارت*111*";
            } else if (userMsg.includes("تحويل الرصيد") || userMsg.includes("فليكسي") || userMsg.includes("transfert")) {
              replyText = "🔄 لتحويل رصيد (فليكسي): اطلب #الرقم السري*المبلغ*رقم الهاتف*610*";
            } else if (userMsg.includes("الباقات") || userMsg.includes("العروض")) {
              replyText = "🌐 لمعرفة كل العروض والباقات، اطلب الكود #600*";
            } else if (userMsg.includes("كلمني شكراً") || userMsg.includes("call me back")) {
              replyText = "💬 لإرسال رسالة 'كلمني شكراً'، اطلب الكود #رقم الهاتف*606*";
            } else if (userMsg.includes("تحويل المكالمات") || userMsg.includes("رونفوا")) {
              replyText = "➡️ لتحويل المكالمات إلى رقم آخر، اطلب الكود #الرقم*21*";
            } else if (userMsg.includes("معرفة الرقم")) {
              replyText = "📱 لمعرفة رقمك، اطلب الكود #101*";
            } else if (userMsg.includes("خدمة الزبائن")) {
              replyText = "📞 للتواصل مع خدمة الزبائن، اتصل على الرقم 666 أو 888.";
            } else {
              replyText = "أهلاً بك في خدمة عملاء موبيليس 👋، كيف يمكنني مساعدتك؟";
            }
          }

          if (replyText) {
            await sendMessage(senderId, replyText, PAGE_ACCESS_TOKEN);
          }
        } else if (webhookEvent.postback && webhookEvent.postback.payload === "GET_STARTED_PAYLOAD") {
            const welcomeText = "أهلاً بك في روبوت موبيليس! 👋 كيف يمكنني مساعدتك اليوم؟";
            await sendMessage(senderId, welcomeText, PAGE_ACCESS_TOKEN);
        }
      }
      return { statusCode: 200, body: "EVENT_RECEIVED" };
    }
    return { statusCode: 404, body: "Not Found" };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
}

// 🔹 Function to send a regular text message
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

// 🔹 Function to send quick replies
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
