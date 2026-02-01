import axios from 'axios';
import crypto from 'crypto';

// CONFIG (Replace these after you register a company in DB)
const COMPANY_ID = "YOUR_COMPANY_UUID_HERE";
const WEBHOOK_SECRET = "YOUR_SECRET_KEY_HERE";
const URL = "http://localhost:3000/api/v1/webhooks/incoming";

const payload = {
    event_type: "ORDER_CREATED",
    data: {
        external_order_id: `ORD-${Date.now()}`,
        customer_email: "test@example.com",
        delivery_address: "123 Tech Street",
        item_summary: [{ name: "Test Item", quantity: 1 }],
        initial_status: "PENDING"
    }
};

// Generate Signature
const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

async function run() {
    try {
        await axios.post(URL, payload, {
            headers: {
                'x-company-id': COMPANY_ID,
                'x-webhook-signature': signature
            }
        });
        console.log("Webhook sent successfully!");
    } catch (e: any) {
        console.error("Error:", e.response?.data || e.message);
    }
}

run();