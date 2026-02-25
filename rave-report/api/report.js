export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).send("Method Not Allowed");

  try {
    const { type, location, urgency, description, contact } = req.body || {};

    if (!type || !location || !urgency || !description) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return res.status(500).json({ ok: false, error: "Server configuration missing" });
    }

    const message =
`🚨 *NEW SAFETY REPORT*

*Type:* ${escapeMarkdown(type)}
*Location:* ${escapeMarkdown(location)}
*Urgency:* ${escapeMarkdown(urgency)}

*Description:*
${escapeMarkdown(description)}

${contact ? `*Contact:* ${escapeMarkdown(contact)}` : "*Contact:* Anonymous"}
`;

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "MarkdownV2",
          disable_web_page_preview: true
        })
      }
    );

    const telegramData = await telegramResponse.json();

    if (!telegramData.ok) {
      return res.status(502).json({ ok: false, error: "Telegram error" });
    }

    return res.status(200).json({ ok: true });

  } catch (error) {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}

function escapeMarkdown(text) {
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}