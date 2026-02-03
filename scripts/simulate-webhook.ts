import axios from 'axios';
import crypto from 'crypto';

// CONFIG (Replace these after you register a company in DB)
const COMPANY_ID = "YOUR_COMPANY_UUID_HERE";
const WEBHOOK_SECRET = "YOUR_SECRET_KEY_HERE";
const URL = "http://localhost:8000/api/v1/webhooks/incoming";

// mode switch
const MODE: 'order.created' | 'order.updated' = "order.created";

// the external order ID
const EXTERNAL_ORDER_ID = `ORD-${Date.now()}`; // or use an existing one for 'order.updated'

async function run() {
    let payload: any;

    if (MODE === 'order.created') {
        payload = {
            event_type: 'order.created',
            data: {
                external_order_id: EXTERNAL_ORDER_ID,
                customer_email: "test@example.com",
                customer_phonse: "123-456-7890",
                delivery_address: "123 Tech Street",
                item_summary: [{ name: "Test Item", quantity: 1 }],
            }
        };
    } else if (MODE === 'order.updated') {
        payload = {
            event_type: "order.updated",
            data: {
                external_order_id: EXTERNAL_ORDER_ID,
                new_status: "DELIVERED",
                additional_note: "Left at front door",
            }
        };
    }

    // Generate Signature
    const signature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

    try {
        await axios.post(URL, payload, {
            headers: {
                'x-company-id': COMPANY_ID,
                'x-webhook-signature': signature,
                'Content-Type': 'application/json',
            }
        });
        console.log("Webhook sent successfully!", payload);
    } catch (e: any) {
        console.error("Error:", e.response?.data || e.message);
    }
}

run();