import { Router } from "express";
import { validate } from "../../shared/middlewares/validation";
import { loginCompanySchema, registerCompanySchema } from "./auth.validation";
import { authController } from "./auth.controller";

const router = Router()

router.post("/register", validate(registerCompanySchema), authController.registerCompany);

router.post("/login", validate(loginCompanySchema), authController.loginCompany);

export const authRoutes = router;