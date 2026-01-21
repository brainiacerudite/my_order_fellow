import { Router } from "express";
import { validate } from "../../shared/middlewares/validation";
import { forgotPasswordSchema, loginCompanySchema, refreshTokenSchema, registerCompanySchema, resendOtpSchema, resetPasswordSchema, verifyOtpSchema } from "./auth.validation";
import { authController } from "./auth.controller";
import { passwordResetToken } from "../../shared/middlewares/auth";

const router = Router()

router.post("/register", validate(registerCompanySchema), authController.registerCompany);
router.post("/login", validate(loginCompanySchema), authController.loginCompany);
router.post("/refresh-token", validate(refreshTokenSchema), authController.refreshToken);
router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyEmail);
router.post("/resend-otp", validate(resendOtpSchema), authController.resendOtp);

router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/verify-reset-otp", validate(verifyOtpSchema), authController.verifyResetOtp);
router.post("/reset-password", validate(resetPasswordSchema), passwordResetToken, authController.resetPassword);

export const authRoutes = router;