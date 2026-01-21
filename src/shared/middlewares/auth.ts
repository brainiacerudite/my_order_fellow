import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';
import { verifyToken } from '../utils/auth';
import { prisma } from '../database/prisma';

type AuthType = 'company' | 'admin';

// auth middleware
export const authenticate = (authType: AuthType = 'company') => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw createError('Authentication required. Please login.', 401);
            }

            // verify token
            const token = authHeader.split(' ')[1];
            const decoded = verifyToken(token);

            // token type check
            if (decoded.type !== authType) {
                throw createError('Invalid token type for this resource', 403);
            }

            if (authType === 'company') {
                const company = await prisma.company.findUnique({
                    where: { id: decoded.userId },
                });

                if (!company) {
                    throw createError('Company account not found', 401);
                }

                // attach to req
                req.company = company;
            } else if (authType === 'admin') {
                const admin = await prisma.admin.findUnique({
                    where: { id: decoded.userId },
                });

                if (!admin) {
                    throw createError('Admin account not found', 401);
                }

                // attach to req
                req.admin = admin;
            }

            next();
        } catch (error: any) {
            // Handle JWT specific errors cleanly
            if (error.name === 'TokenExpiredError') {
                next(createError('Session expired. Please login again.', 401));
            } else if (error.name === 'JsonWebTokenError') {
                next(createError('Invalid token.', 401));
            } else {
                next(error);
            }
        }
    }
}

// email verified middleware
export const emailVerified = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (req.company && !req.company.isEmailVerified) {
        return next(createError('Email verification required.', 403));
    }
    next();
};