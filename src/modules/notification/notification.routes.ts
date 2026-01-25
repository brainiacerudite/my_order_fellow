import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import { notificationController } from "./notification.controller";

const router = Router()

router.use(authenticate)

router.get("/", notificationController.getLogs)

export const notificationRoutes = router