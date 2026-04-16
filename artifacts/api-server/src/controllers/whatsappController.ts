import { type Request, type Response } from "express";
import { getChatbotReply, sendWhatsAppMessage } from "../services/whatsappService";

const VERIFY_TOKEN = process.env["WHATSAPP_VERIFY_TOKEN"];

/**
 * GET /api/webhook/whatsapp
 * Handles Meta's webhook verification handshake.
 * Meta sends a challenge that we must echo back if the token matches.
 */
export function verifyWebhook(req: Request, res: Response): void {
  const mode = req.query["hub.mode"] as string | undefined;
  const token = req.query["hub.verify_token"] as string | undefined;
  const challenge = req.query["hub.challenge"] as string | undefined;

  req.log.info({ mode, token }, "Webhook verification attempt");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    req.log.info("Webhook verified successfully");
    res.status(200).send(challenge);
    return;
  }

  req.log.warn("Webhook verification failed — token mismatch");
  res.sendStatus(403);
}

/**
 * POST /api/webhook/whatsapp
 * Receives incoming WhatsApp messages from Meta and sends an automatic reply.
 */
export async function receiveMessage(
  req: Request,
  res: Response,
): Promise<void> {
  const body = req.body as Record<string, unknown>;

  // Acknowledge receipt immediately — Meta expects a 200 quickly
  res.sendStatus(200);

  // Validate it's a WhatsApp message event
  if (body.object !== "whatsapp_business_account") {
    return;
  }

  try {
    const entries = body.entry as Array<Record<string, unknown>>;
    for (const entry of entries ?? []) {
      const changes = entry.changes as Array<Record<string, unknown>>;
      for (const change of changes ?? []) {
        const value = change.value as Record<string, unknown>;
        const messages = value.messages as Array<Record<string, unknown>>;

        for (const message of messages ?? []) {
          const type = message.type as string;

          // Only handle text messages for now
          if (type !== "text") {
            req.log.info({ type }, "Skipping non-text message");
            continue;
          }

          const from = message.from as string;
          const textObj = message.text as { body: string };
          const incomingText = textObj?.body ?? "";

          req.log.info({ from, text: incomingText }, "Received WhatsApp message");

          // Get chatbot reply and send it
          const reply = getChatbotReply(incomingText);
          await sendWhatsAppMessage(from, reply);
        }
      }
    }
  } catch (err) {
    req.log.error({ err }, "Error processing WhatsApp message");
  }
}
