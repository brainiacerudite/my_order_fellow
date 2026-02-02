import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import { adminController } from "./admin.controller";

const router = Router()

router.post('/login', adminController.loginAdmin);

// admin protected routes
router.use(authenticate('admin'));

router.get('/kyc/pending', adminController.getPendingKyc);
router.post('/kyc/:id/approve', adminController.approveKyc);
router.post('/kyc/:id/reject', adminController.rejectKyc);

export const adminRoutes = router;