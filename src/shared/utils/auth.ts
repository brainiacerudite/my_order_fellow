import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../../config';
import bcrypt from 'bcrypt';
import { AuthPayload } from '../types';

export const signAccessToken = (payload: AuthPayload): string => {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiry
    } as SignOptions);
};

export const signRefreshToken = (payload: AuthPayload): string => {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.refreshTokenExpiry
    } as SignOptions);
};

export const verifyToken = (token: string): AuthPayload => {
    return jwt.verify(token, config.jwt.secret) as AuthPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const comparePassword = async (candidate: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(candidate, hash);
};