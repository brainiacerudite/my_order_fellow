import express from 'express';

export const webhookParser = express.json({
    verify: (req: any, _res, buf) => {
        // keep the raw buffer for signature verification
        req.rawBody = buf;
    }
})