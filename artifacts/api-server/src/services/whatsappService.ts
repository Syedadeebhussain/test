import { logger } from "../lib/logger";

const WHATSAPP_TOKEN = process.env["WHATSAPP_TOKEN"];
const PHONE_NUMBER_ID = process.env["WHATSAPP_PHONE_NUMBER_ID"];
const GRAPH_API_URL = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

/**
 * Sends a WhatsApp text message to a recipient using the Cloud API.
 */
export async function sendWhatsAppMessage(
  to: string,
  text: string,
): Promise<void> {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    logger.error(
      "Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID env vars",
    );
    return;
  }

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  };

  const response = await fetch(GRAPH_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(
      { status: response.status, body: errorText },
      "Failed to send WhatsApp message",
    );
    return;
  }

  logger.info({ to }, "WhatsApp message sent successfully");
}

/**
 * Simple keyword-based chatbot logic.
 * Returns a reply string based on the incoming message content.
 * Extend this function to plug in AI (Gemini / OpenAI) later.
 */
export function getChatbotReply(message: string): string {
  const lower = message.toLowerCase().trim();

  if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
    return "Hello 👋 How can I help you today?";
  }

  if (lower.includes("price") || lower.includes("cost") || lower.includes("rate")) {
    return "Our price is ₹50 per kg. Would you like to place an order? Just type *order* to get started!";
  }

  if (lower.includes("order")) {
    return "✅ Your order has been placed! Our team will contact you shortly to confirm the details.";
  }

  if (lower.includes("help")) {
    return (
      "Here's what I can help you with:\n\n" +
      "• Type *hi* — greet me\n" +
      "• Type *price* — check our pricing\n" +
      "• Type *order* — place an order\n\n" +
      "Feel free to ask anything!"
    );
  }

  if (lower.includes("thank")) {
    return "You're welcome! 😊 Feel free to reach out anytime.";
  }

  return "Sorry, I didn't understand that. 🤔 Type *help* to see what I can do for you.";
}
