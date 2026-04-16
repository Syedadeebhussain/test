import { Router, type IRouter } from "express";
import {
  verifyWebhook,
  receiveMessage,
} from "../controllers/whatsappController";

const router: IRouter = Router();

/**
 * GET /api/webhook/whatsapp
 * Meta calls this to verify the webhook URL during setup.
 */
router.get("/webhook/whatsapp", verifyWebhook);

/**
 * POST /api/webhook/whatsapp
 * Meta sends incoming messages here.
 */
router.post("/webhook/whatsapp", receiveMessage);

export default router;
