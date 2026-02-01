import crypto from 'crypto';

/**
 * Verifies that the incoming webhook signature matches the payload.
 * Uses HMAC-SHA256.
 */
export const verifyWebhookSignature = (payload: Buffer, signature: string, secret: string): boolean => {
    if (!payload || !signature || !secret) return false;

    // create the expected signature with the secret
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    // definitely invalid if lengths differ
    if (signature.length !== expectedSignature.length) return false;

    // compare signatures
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}