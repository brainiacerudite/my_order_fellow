import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler";
import { ApiResponse } from "../../shared/types";
import { authService } from "./auth.service";

const registerCompany = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.registerCompany(req.body);

    const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result.company,
    };

    res.status(201).json(response);
});

const loginCompany = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result.data,
    };

    res.status(200).json(response);
});

const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.refreshToken(req.body);

    const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result.data,
    };

    res.status(200).json(response);
});

const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.verifyOtp(req.body);

    const response: ApiResponse = {
        success: true,
        message: result.message,
    }

    res.status(200).json(response);
})

const resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.resendOtp(req.body);

    const response: ApiResponse = {
        success: true,
        message: result.message,
    };

    res.status(200).json(response);
})

const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(req.body);

    const response: ApiResponse = {
        success: true,
        message: result.message,
    };

    res.status(200).json(response);
});

const verifyResetOtp = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.verifyResetOtp(req.body);

    const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result.data,
    };

    res.status(200).json(response);
});

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req?.authPayload?.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await authService.resetPassword(userId, req.body);

    const response: ApiResponse = {
        success: true,
        message: result.message,
    };

    res.status(200).json(response);
});

export const authController = {
    registerCompany,
    loginCompany,
    verifyEmail,
    refreshToken,
    resendOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
};