import { Router } from "express";
import { authenticate, emailVerified } from "../../shared/middlewares/auth";
import { createOrderSchema, updateStatusSchema } from "./order.validation";
import { orderController } from "./order.controller";
import { validate, validateObjectId } from "../../shared/middlewares/validation";
import { checkKycApproved } from "../../shared/middlewares/checkKyc";

const router = Router()

// tracking
router.get("/track/:trackingId", orderController.getTrackingDetails)

router.use(authenticate())
router.use(emailVerified)
router.use(checkKycApproved)

// Manual order creation and status update
router.post("/", validate(createOrderSchema), orderController.createOrder)
router.patch("/:id/status", validateObjectId('id'), validate(updateStatusSchema), orderController.updateOrderStatus)
router.get("/:id", validateObjectId('id'), orderController.getOrderDetails)


export const orderRoutes = router;