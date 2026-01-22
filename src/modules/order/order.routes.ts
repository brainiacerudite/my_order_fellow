import { Router } from "express";
import { authenticate, emailVerified } from "../../shared/middlewares/auth";
import { createOrderSchema, updateStatusSchema } from "./order.validation";
import { orderController } from "./order.controller";
import { validate, validateObjectId } from "../../shared/middlewares/validation";

const router = Router()

router.use(authenticate)
router.use(emailVerified)

router.post("/", validate(createOrderSchema), orderController.createOrder)
router.patch("/:id/status", validateObjectId('id'), validate(updateStatusSchema), orderController.updateOrderStatus)
router.get("/:id", validateObjectId('id'), orderController.getOrderDetails)

export const orderRoutes = router;