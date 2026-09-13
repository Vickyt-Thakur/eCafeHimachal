import './config/env.js';
import app from './app.js';
import { connectDatabase } from './config/db.js';

const port = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, () => console.log(`API ready at http://localhost:${port}`));
    console.log(`Razorpay Test Mode configured: ${Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)}`);
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
}

startServer();
