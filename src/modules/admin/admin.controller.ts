import { asyncHandler } from "../../shared/middlewares/asyncHandler";
import { Request, Response } from "express";
import { adminService } from "./admin.service";

const loginAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.loginAdmin(req.body);
    res.status(200).json(result);
});

const getPendingKyc = asyncHandler(async (_req: Request, res: Response) => {
    const result = await adminService.getPendingKyc();
    res.json({ success: true, data: result });
});

const approveKyc = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = (req as any).admin.id;

    const result = await adminService.approveKyc(id as string, adminId);
    res.json({
        success: true,
        message: result.message,
        data: {
            webhookSecret: result.webhookSecret
        }
    });
});

const rejectKyc = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = (req as any).admin.id;
    const { reason } = req.body;

    const result = await adminService.rejectKyc(id as string, adminId, reason);
    res.json({ success: true, message: result.message });
});

export const adminController = {
    loginAdmin,
    getPendingKyc,
    approveKyc,
    rejectKyc,
};