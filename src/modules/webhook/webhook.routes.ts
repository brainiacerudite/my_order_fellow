import { Router } from "express";
import { webhookController } from "./webhook.controller";
import { webhookParser } from "../../shared/middlewares/webhookParser";

const router = Router()

router.post('/incoming', webhookParser, webhookController.handleIncomingWebhook);

export const webhookRoutes = router;