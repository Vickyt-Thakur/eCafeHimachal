function credentials() {
  const { RAZORPAY_KEY_ID: keyId, RAZORPAY_KEY_SECRET: keySecret } = process.env;
  if (!keyId || !keySecret) {
    const error = new Error('Razorpay Test Mode is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env.');
    error.statusCode = 503;
    throw error;
  }
  return { keyId, keySecret };
}

export async function createRazorpayOrder({ amount, receipt, notes }) {
  const { keyId, keySecret } = credentials();
  const authorization = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: Math.round(amount * 100), currency: 'INR', receipt, notes }),
  });
  const body = await response.json();
  if (!response.ok) {
    const error = new Error(body.error?.description || 'Razorpay could not create the payment order.');
    error.statusCode = 502;
    throw error;
  }
  return { razorpayOrder: body, keyId };
}
