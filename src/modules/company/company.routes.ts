import { Router } from "express";
import { authenticate, emailVerified } from "../../shared/middlewares/auth";
import { companyController } from "./company.controller";
import { validate } from "../../shared/middlewares/validation";
import { submitKycSchema } from "./company.validation";

const router = Router()

router.use(authenticate())

router.get("/profile", companyController.getCompanyProfile);
router.post("/kyc/submit", emailVerified, validate(submitKycSchema), companyController.submitKyc);

export const companyRoutes = router;