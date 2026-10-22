/** Where the payment provider lives. Read once, when the module loads. */
export const PAYMENT_API_URL = process.env.PAYMENT_API_URL ?? 'https://payments.paper-lantern.example';
