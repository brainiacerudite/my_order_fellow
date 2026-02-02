import { KycStatus } from "@prisma/client";
import { prisma } from "../../shared/database/prisma";
import { createError } from "../../shared/middlewares/errorHandler";
import { comparePassword, signAccessToken } from "../../shared/utils/auth";
import { LoginCompanyInput } from "../auth/auth.validation";
import crypto from "crypto";

export class AdminService {
    async loginAdmin(data: LoginCompanyInput) {
        const { email, password } = data;

        // find admin by email
        const admin = await prisma.admin.findUnique({
            where: { email }
        });

        if (!admin) throw createError('Invalid admin credetials', 401);

        // verify password
        const isPasswordValid = await comparePassword(password, admin.password);
        if (!isPasswordValid) throw createError('Invalid admin credetials', 401);

        // generate token 
        const accessToken = signAccessToken({
            userId: admin.id,
            type: 'admin',
            role: admin.role,
        })

        return {
            success: true,
            message: 'Admin logged in successfully',
            accessToken,
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role,
            }
        }
    }

    async getPendingKyc() {
        const pendingKycs = await prisma.kycDocument.findMany({
            where: { status: KycStatus.PENDING },
            include: {
                company: {
                    select: {
                        id: true,
                        businessName: true,
                        email: true,
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        return pendingKycs;
    }

    async approveKyc(kycDocumentId: string, adminId: string) {
        // find KYC document
        const kycDocument = await prisma.kycDocument.findUnique({
            where: { id: kycDocumentId },
            include: { company: true }
        });

        if (!kycDocument) throw createError('KYC document not found', 404);
        if (kycDocument.status === KycStatus.APPROVED) throw createError('KYC is already approved', 400);

        // generate webhook secret
        const webhookSecret = crypto.randomBytes(32).toString('hex');

        await prisma.$transaction([
            prisma.kycDocument.update({
                where: { id: kycDocumentId },
                data: {
                    status: KycStatus.APPROVED,
                    reviewedAt: new Date(),
                    reviewedBy: adminId,
                }
            }),
            prisma.company.update({
                where: { id: kycDocument.companyId },
                data: { webhookSecret: webhookSecret }
            })
        ])

        return {
            message: 'KYC approved successfully',
            webhookSecret,
        }
    }

    async rejectKyc(kycDocumentId: string, adminId: string, reason: string) {
        // find KYC document
        const kycDocument = await prisma.kycDocument.findUnique({
            where: { id: kycDocumentId },
        });

        if (!kycDocument) throw createError('KYC document not found', 404);
        if (kycDocument.status === KycStatus.APPROVED) throw createError('Cannot reject an already approved KYC', 400);

        await prisma.kycDocument.update({
            where: { id: kycDocumentId },
            data: {
                status: KycStatus.REJECTED,
                rejectionReason: reason,
                reviewedAt: new Date(),
                reviewedBy: adminId,
            }
        })

        return {
            message: 'KYC rejected successfully',
        }
    }
}

export const adminService = new AdminService();