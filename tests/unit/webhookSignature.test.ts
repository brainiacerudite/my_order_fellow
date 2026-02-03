import crypto from 'crypto';
import { verifyWebhookSignature } from '../../src/shared/utils/webhookSignature';

describe('Unit: Webhook Signature Verification', () => {
    const secret = 'my-super-secret-key';
    const payload = JSON.stringify({ event: 'test', data: 123 });
    const payloadBuffer = Buffer.from(payload);

    it('should return TRUE for a valid signature', () => {
        // generate a valid signature
        const signature = crypto.createHmac('sha256', secret).update(payloadBuffer).digest('hex');

        // test the utility function
        const isValid = verifyWebhookSignature(payloadBuffer, signature, secret);

        expect(isValid).toBe(true);
    });

    it('should return FALSE for an invalid signature', () => {
        const validSignature = crypto.createHmac('sha256', secret).update(payloadBuffer).digest('hex');

        // tamper with the signature
        const invalidSignature = validSignature.replace('a', 'b');

        const isValid = verifyWebhookSignature(payloadBuffer, invalidSignature, secret);

        expect(isValid).toBe(false);
    });

    it('should return FALSE if the payload was tampered with', () => {
        // generate signature for the ORIGINAL payload
        const signature = crypto.createHmac('sha256', secret).update(payloadBuffer).digest('hex');

        // pass a DIFFERENT payload
        const tamperedBuffer = Buffer.from(JSON.stringify({ event: 'test', data: 999 }));

        const isValid = verifyWebhookSignature(tamperedBuffer, signature, secret);

        expect(isValid).toBe(false);
    });

    it('should return FALSE if secret is wrong', () => {
        const signature = crypto.createHmac('sha256', secret).update(payloadBuffer).digest('hex');

        const isValid = verifyWebhookSignature(payloadBuffer, signature, 'wrong-secret');

        expect(isValid).toBe(false);
    });
});