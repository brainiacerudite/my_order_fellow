import config from "../../config";
import { prisma } from "../../shared/database/prisma";
import { createError } from "../../shared/middlewares/errorHandler";
import { comparePassword, hashPassword, signAccessToken, signRefreshToken, verifyToken } from "../../shared/utils/auth";
import { generateOtp } from "../../shared/utils/otp";
import { ForgotPasswordInput, LoginCompanyInput, RefreshTokenInput, RegisterCompanyInput, ResendOtpInput, ResetPasswordInput, VerifyOtpInput } from "./auth.validation";

export class AuthService {
    async registerCompany(data: RegisterCompanyInput) {
        const { businessName, email, password } = data

        // check if user already exists
        const existingCompany = await prisma.company.findUnique({
            where: { email }
        });

        if (existingCompany) {
            throw createError('Company with this email already exists', 400);
        }

        // hash password
        const hashedPassword = await hashPassword(password);

        // generate otp and its hash and expiry (for email verification)
        const otp = generateOtp()
        const otpHash = await hashPassword(otp);
        const otpExpiresAt = new Date(Date.now() + 1000 * 60 * config.otp.expiryMinutes);

        // TODO: send the OTP via email here
        console.log(`OTP for ${email}: ${otp}`);

        // save to db
        const company = await prisma.company.create({
            data: {
                businessName,
                email,
                password: hashedPassword,
                otpHash,
                otpExpiresAt,
            },
            omit: {
                password: true,
                otpHash: true,
                otpExpiresAt: true,
                webhookSecret: true,
            }
        });

        return {
            message: 'Company registered successfully',
            company,
        };
    }

    async login(data: LoginCompanyInput) {
        const { email, password } = data

        // check user by email
        const company = await prisma.company.findUnique({
            where: { email }
        });

        if (!company) {
            throw createError('Credentials does not match our records', 400);
        }

        // verify password
        const isPasswordValid = await comparePassword(password, company.password);

        if (!isPasswordValid) {
            throw createError('Invalid password', 400);
        }

        // generate tokens
        const accessToken = signAccessToken({
            userId: company.id,
            type: 'company',
        });
        const refreshToken = signRefreshToken({
            userId: company.id,
            type: 'company',
        });

        return {
            message: 'Company logged in successfully',
            data: {
                tokens: {
                    access: accessToken,
                    refresh: refreshToken,
                }
            },
        }
    }

    async refreshToken(data: RefreshTokenInput) {
        const { refreshToken } = data

        // verify refresh token
        const decoded = verifyToken(refreshToken);

        // check user active
        const company = await prisma.company.findUnique({
            where: { id: decoded.userId }
        });
        if (!company) throw createError('Company not found', 404);

        // generate new tokens
        const newAccessToken = signAccessToken({
            userId: decoded.userId,
            type: 'company',
        });
        const newRefreshToken = signRefreshToken({
            userId: decoded.userId,
            type: 'company',
        });

        return {
            message: 'Token refreshed successfully',
            data: {
                tokens: {
                    access: newAccessToken,
                    refresh: newRefreshToken,
                }
            },
        }
    }

    async verifyOtp(data: VerifyOtpInput) {
        const { email, otp } = data

        // find company by email
        const company = await prisma.company.findUnique({
            where: { email }
        });

        if (!company) throw createError('Company not found', 404);

        // check if already verified
        if (company.isEmailVerified) throw createError('Email is already verified', 400);

        // validate otp existence and expiry
        if (!company.otpHash || !company.otpExpiresAt) {
            throw createError('OTP not found. Please request a new one.', 400);
        }

        if (company.otpExpiresAt < new Date()) {
            throw createError('OTP has expired. Please request a new one.', 400);
        }

        // verify otp
        const isOtpValid = await comparePassword(otp, company.otpHash);
        if (!isOtpValid) throw createError('Invalid OTP', 400);

        // mark email as verified and remove otp fields
        await prisma.company.update({
            where: { id: company.id },
            data: {
                isEmailVerified: true,
                emailVerifiedAt: new Date(),
                otpHash: null,
                otpExpiresAt: null,
            }
        });

        return {
            message: 'Email verified successfully',
        }
    }

    async resendOtp(data: ResendOtpInput) {
        const { email } = data

        // find company by email
        const company = await prisma.company.findUnique({
            where: { email }
        });
        if (!company) throw createError('Company not found', 404);

        // check if already verified
        if (company.isEmailVerified) throw createError('Email is already verified', 400);

        // generate new otp and its hash and expiry
        const otp = generateOtp()
        const otpHash = await hashPassword(otp);
        const otpExpiresAt = new Date(Date.now() + 1000 * 60 * config.otp.expiryMinutes);

        // save new otp to db
        await prisma.company.update({
            where: { id: company.id },
            data: {
                otpHash,
                otpExpiresAt,
            }
        })

        // TODO: send the OTP via email here
        console.log(`Resent OTP for ${email}: ${otp}`);

        return {
            message: 'OTP resent successfully',
        }
    }

    async forgotPassword(data: ForgotPasswordInput) {
        const { email } = data

        // find company by email
        const company = await prisma.company.findUnique({
            where: { email }
        });
        if (!company) throw createError('Company not found', 404);

        // generate otp and its hash and expiry
        const otp = generateOtp()
        const otpHash = await hashPassword(otp);
        const otpExpiresAt = new Date(Date.now() + 1000 * 60 * config.otp.expiryMinutes);

        // save otp to db
        await prisma.company.update({
            where: { id: company.id },
            data: {
                otpHash,
                otpExpiresAt,
            }
        })

        // TODO: send the OTP via email here
        console.log(`Password reset OTP for ${email}: ${otp}`);

        return {
            message: 'Password reset OTP has been sent to your email',
        }
    }

    async verifyResetOtp(data: VerifyOtpInput) {
        const { email, otp } = data

        // find company by email
        const company = await prisma.company.findUnique({
            where: { email }
        });
        if (!company) throw createError('Company not found', 404);

        // validate otp existence and expiry
        if (!company.otpHash || !company.otpExpiresAt) {
            throw createError('OTP not found. Please request a new one.', 400);
        }

        if (company.otpExpiresAt < new Date()) {
            throw createError('OTP has expired. Please request a new one.', 400);
        }

        // verify otp
        const isOtpValid = await comparePassword(otp, company.otpHash);
        if (!isOtpValid) throw createError('Invalid OTP', 400);

        // clear otp fields
        await prisma.company.update({
            where: { id: company.id },
            data: {
                otpHash: null,
                otpExpiresAt: null,
            }
        });

        // generate a one-time token for password reset
        const resetToken = signAccessToken({
            userId: company.id,
            type: 'password_reset',
        });

        return {
            message: 'OTP verified successfully',
            data: {
                resetToken,
            }
        }
    }

    async resetPassword(userId: string, data: ResetPasswordInput) {
        const { password } = data

        // hash new password
        const hashedPassword = await hashPassword(password);

        // update password in db
        await prisma.company.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            }
        });

        return {
            message: 'Password has been reset successfully',
        }
    }
}

export const authService = new AuthService();