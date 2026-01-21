import { z } from 'zod';

export const registerCompanySchema = z.object({
    businessName: z.string().min(2, "Business name is required"),
    email: z.email("Invalid email format"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginCompanySchema = z.object({
    email: z.email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

export const verifyOtpSchema = z.object({
    email: z.email("Invalid email format"),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
});

export const resendOtpSchema = z.object({
    email: z.email(),
});

export const forgotPasswordSchema = z.object({
    email: z.email(),
});

export const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});

export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;
export type LoginCompanyInput = z.infer<typeof loginCompanySchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;