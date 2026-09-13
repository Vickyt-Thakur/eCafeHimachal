import crypto from 'crypto';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import TaskStatusHistory from '../models/TaskStatusHistory.js';
import Receipt from '../models/Receipt.js';
import { createReceiptNumber } from '../services/receipt.js';
import { createRazorpayOrder } from '../services/razorpay.js';
import { createPaymentSchema, verifyPaymentSchema } from '../validators/payment.js';

export async function createPaymentOrder(request, response, next) {
  try {
    const { orderId } = createPaymentSchema.parse(request.body);
    const order = await Order.findOne({ _id: orderId, buyerId: request.user._id }).populate('serviceId', 'name');
    if (!order) return response.status(404).json({ success: false, message: 'Order not found.' });
    if (order.paymentStatus === 'SUCCESS') return response.status(409).json({ success: false, message: 'This order has already been paid.' });
    if (order.orderStatus === 'CANCELLED') return response.status(409).json({ success: false, message: 'Cancelled orders cannot be paid.' });

    const existingPayment = await Payment.findOne({ orderId: order._id, status: 'PENDING' });
    if (existingPayment) return response.json({ success: true, keyId: process.env.RAZORPAY_KEY_ID, payment: { razorpayOrderId: existingPayment.razorpayOrderId, amount: existingPayment.amount, currency: existingPayment.currency }, order: { id: order._id, orderNumber: order.orderNumber, serviceName: order.serviceId.name } });

    const { razorpayOrder, keyId } = await createRazorpayOrder({ amount: order.amount, receipt: order.orderNumber, notes: { ecafeOrderId: order._id.toString(), orderNumber: order.orderNumber } });
    const payment = await Payment.create({ orderId: order._id, razorpayOrderId: razorpayOrder.id, amount: order.amount, currency: 'INR', status: 'PENDING' });
    response.status(201).json({ success: true, keyId, payment: { razorpayOrderId: payment.razorpayOrderId, amount: payment.amount, currency: payment.currency }, order: { id: order._id, orderNumber: order.orderNumber, serviceName: order.serviceId.name } });
  } catch (error) { next(error); }
}

export async function verifyPayment(request, response, next) {
  try {
    const data = verifyPaymentSchema.parse(request.body);
    const order = await Order.findOne({ _id: data.orderId, buyerId: request.user._id });
    if (!order) return response.status(404).json({ success: false, message: 'Order not found.' });
    const payment = await Payment.findOne({ orderId: order._id, razorpayOrderId: data.razorpayOrderId });
    if (!payment) return response.status(400).json({ success: false, message: 'Payment reference does not match this order.' });
    if (payment.status === 'SUCCESS') return response.json({ success: true, message: 'Payment is already verified.' });

    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`).digest('hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(data.razorpaySignature, 'utf8');
    if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) return response.status(400).json({ success: false, message: 'Payment verification failed. Do not retry payment until you check its status.' });

    payment.razorpayPaymentId = data.razorpayPaymentId;
    payment.razorpaySignature = data.razorpaySignature;
    payment.status = 'SUCCESS';
    payment.verifiedAt = new Date();
    await payment.save();
    await Receipt.findOneAndUpdate({ orderId: order._id }, { $setOnInsert: { receiptNumber: await createReceiptNumber(), orderId: order._id, paymentId: payment._id } }, { upsert: true, new: true });
    const oldStatus = order.orderStatus;
    order.paymentStatus = 'SUCCESS';
    order.orderStatus = 'PAID';
    await order.save();
    await TaskStatusHistory.create({ orderId: order._id, oldStatus, newStatus: 'PAID', changedBy: request.user._id, note: 'Razorpay payment verified.' });
    response.json({ success: true, message: 'Payment verified successfully.', order: { id: order._id, orderNumber: order.orderNumber, paymentStatus: order.paymentStatus, orderStatus: order.orderStatus } });
  } catch (error) { next(error); }
}
