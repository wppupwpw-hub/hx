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

  // ✅ Handle incoming messages
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
              case "BALANCE_MENU":
                await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "ماذا تود أن تعرف عن الرصيد؟", [
                  { title: "📊 الرصيد الحالي", payload: "CHECK_BALANCE" },
                  { title: "🔋 شحن الرصيد (كارت)", payload: "RECHARGE" },
                  { title: "💰 رصيد بالدين (CridiLIS)", payload: "CRIDILIS" }
                ]);
                continue;
              case "CHECK_BALANCE":
                replyText = "📊 لمعرفة رصيدك الحالي، اطلب الكود: #222*";
                break;
              case "RECHARGE":
                replyText = "🔋 لشحن رصيدك باستعمال الكارت: اطلب الكود #رقم الكارت*111*";
                break;
              case "CRIDILIS":
                replyText = "💰 لطلب رصيد بالدين (CridiLIS) بقيمة 20، 50، أو 100 دج: اطلب الكود #المبلغ*3*662*";
                break;
              case "TRANSFER_MENU":
                await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "ماذا تود أن تعرف عن تحويل الرصيد (فليكسي)؟", [
                  { title: "🔄 طريقة التحويل", payload: "HOW_TO_TRANSFER" },
                  { title: "🔗 تفعيل الخدمة", payload: "ACTIVATE_TRANSFER" }
                ]);
                continue;
              case "HOW_TO_TRANSFER":
                replyText = "🔄 لتحويل رصيد (فليكسي): اطلب #الرقم السري*المبلغ*رقم الهاتف*610*";
                break;
              case "ACTIVATE_TRANSFER":
                replyText = "🔗 لتفعيل خدمة تحويل الرصيد (فليكسي) أول مرة: اطلب الكود *#610";
                break;
              case "PACKAGES_MENU":
                replyText = "🌐 لمعرفة كل العروض والباقات، اطلب الكود #600*";
                break;
              case "CONTACT_MENU":
                await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "كيف يمكنني مساعدتك؟", [
                  { title: "📞 رقم خدمة العملاء", payload: "CUSTOMER_SERVICE_NUMBER" },
                  { title: "💬 كلمني شكراً", payload: "CALL_ME_BACK" }
                ]);
                continue;
              case "CUSTOMER_SERVICE_NUMBER":
                replyText = "📞 يمكنك التواصل مع خدمة العملاء بالاتصال على الرقم 505 أو 666.";
                break;
              case "CALL_ME_BACK":
                replyText = "💬 لإرسال رسالة 'كلمني شكراً'، اطلب الكود #رقم الهاتف*606*";
                break;
              case "ADDITIONAL_SERVICES_MENU":
                await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "ماذا تود أن تعرف عن الخدمات الإضافية؟", [
                  { title: "☎️ المكالمات الفائتة", payload: "MISSED_CALLS" },
                  { title: "🚫 مغلق / خارج التغطية", payload: "OUT_OF_COVERAGE" },
                  { title: "➡️ تحويل المكالمات (رونفوا)", payload: "CALL_FORWARDING" }
                ]);
                continue;
              case "MISSED_CALLS":
                replyText = "☎️ لتفعيل خدمة المكالمات الفائتة، اطلب الكود #644*21*";
                break;
              case "OUT_OF_COVERAGE":
                replyText = "🚫 لتفعيل خدمة مغلق أو خارج التغطية، اطلب الكود #644*21*";
                break;
              case "CALL_FORWARDING":
                replyText = "➡️ لتحويل المكالمات إلى رقم آخر، اطلب الكود #الرقم*21*";
                break;
              default:
                replyText = "أهلاً بك! كيف يمكنني مساعدتك؟";
            }
          }
          else {
            // Handle regular text messages
            if (userMsg.includes("كيفك") || userMsg.includes("واش راك") || userMsg.includes("عامل ايه")) {
              replyText = "😊 الحمد لله بخير، شكراً لسؤالك. وانت كيف حالك؟";
            }
            else if (userMsg.includes("القائمة") || userMsg.includes("خدمات")) {
              await sendQuickReplies(senderId, PAGE_ACCESS_TOKEN, "اختر الخدمة التي تناسبك 👇:", [
                { title: "💰 الرصيد", payload: "BALANCE_MENU" },
                { title: "🔄 تحويل الرصيد", payload: "TRANSFER_MENU" },
                { title: "🌐 العروض والباقات", payload: "PACKAGES_MENU" },
                { title: "📞 خدمات إضافية", payload: "ADDITIONAL_SERVICES_MENU" }
              ]);
              continue;
            }
            else if (userMsg.includes("معرفة الرصيد") || userMsg.includes("رصيد") || userMsg.includes("solde")) {
              replyText = "📊 لمعرفة رصيدك الحالي، اطلب الكود: #222*";
            }
            else if (userMsg.includes("شحن الرصيد") || userMsg.includes("تعبئة") || userMsg.includes("recharge")) {
              replyText = "🔋 لشحن رصيدك باستعمال الكارت: اطلب الكود #رقم الكارت*111*";
            }
            else if (userMsg.includes("تحويل الرصيد") || userMsg.includes("فليكسي") || userMsg.includes("transfert")) {
              replyText = "🔄 لتحويل رصيد (فليكسي): اطلب #الرقم السري*المبلغ*رقم الهاتف*610*";
            }
            else if (userMsg.includes("الباقات") || userMsg.includes("العروض")) {
              replyText = "🌐 لمعرفة كل العروض والباقات، اطلب الكود #600*";
            }
            else if (userMsg.includes("كلمني شكراً") || userMsg.includes("call me back")) {
              replyText = "💬 لإرسال رسالة 'كلمني شكراً'، اطلب الكود #رقم الهاتف*606*";
            }
            else if (userMsg.includes("تحويل المكالمات") || userMsg.includes("رونفوا")) {
              replyText = "➡️ لتحويل المكالمات إلى رقم آخر، اطلب الكود #الرقم*21*";
            }
            else if (userMsg.includes("معرفة الرقم")) {
              replyText = "📱 لمعرفة رقمك، اطلب الكود #101*";
            }
            else if (userMsg.includes("شكراً")) {
                replyText = "🌹 على الرحب والسعة، نحن دائماً في خدمتك.";
            }
            else {
              replyText = "أهلاً بك في خدمة عملاء موبليس 👋، كيف يمكنني مساعدتك؟";
            }
          }

          if (replyText) {
            await sendMessage(senderId, replyText, PAGE_ACCESS_TOKEN);
          }
        } else if (webhookEvent.postback && webhookEvent.postback.payload === "GET_STARTED_PAYLOAD") {
            const welcomeText = "أهلاً بك في روبوت موبليس! 👋 كيف يمكنني مساعدتك اليوم؟";
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
