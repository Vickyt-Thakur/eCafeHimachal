import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import Setting from '../models/Setting.js';
import { z } from 'zod';

const whatsappSchema = z.object({ whatsappNumber: z.string().trim().regex(/^\d{10,15}$/, 'Enter a valid WhatsApp number with country code.') });

export async function dashboard(request, response, next) {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [totalOrders, pendingOrders, inProgress, completed, customers, partners, todayOrders, successfulPayments, recentOrders] = await Promise.all([
      Order.countDocuments(), Order.countDocuments({ orderStatus: 'PENDING_PAYMENT' }), Order.countDocuments({ orderStatus: 'IN_PROGRESS' }), Order.countDocuments({ orderStatus: 'COMPLETED' }), User.countDocuments({ role: 'CUSTOMER' }), User.countDocuments({ role: 'PARTNER' }), Order.countDocuments({ createdAt: { $gte: today } }), Payment.find({ status: 'SUCCESS' }).populate('orderId', 'buyerType').select('amount orderId'), Order.find().sort({ createdAt: -1 }).limit(8).populate('buyerId', 'name').populate('serviceId', 'name'),
    ]);
    const customerRevenue = successfulPayments.filter((payment) => payment.orderId?.buyerType === 'CUSTOMER').reduce((sum, payment) => sum + payment.amount, 0);
    const partnerRevenue = successfulPayments.filter((payment) => payment.orderId?.buyerType === 'PARTNER').reduce((sum, payment) => sum + payment.amount, 0);
    response.json({ success: true, metrics: { totalOrders, pendingOrders, inProgress, completed, customers, partners, todayOrders, customerRevenue, partnerRevenue, totalRevenue: customerRevenue + partnerRevenue }, recentOrders: recentOrders.map((order) => ({ id: order._id, orderNumber: order.orderNumber, buyer: order.buyerId?.name, service: order.serviceId?.name, amount: order.amount, paymentStatus: order.paymentStatus, orderStatus: order.orderStatus, createdAt: order.createdAt })) });
  } catch (error) { next(error); }
}

export async function listCustomers(_request, response, next) { try { const customers = await User.find({ role: 'CUSTOMER' }).select('name email mobile status createdAt').sort({ createdAt: -1 }); response.json({ success: true, customers: customers.map((customer) => ({ id: customer._id, name: customer.name, email: customer.email, mobile: customer.mobile, status: customer.status, createdAt: customer.createdAt })) }); } catch (error) { next(error); } }

export async function getSettings(_request, response, next) { try { const setting = await Setting.findOne({ key: 'ADMIN_WHATSAPP_NUMBER' }); response.json({ success: true, whatsappNumber: setting?.value || process.env.ADMIN_WHATSAPP_NUMBER || '' }); } catch (error) { next(error); } }
export async function updateSettings(request, response, next) { try { const { whatsappNumber } = whatsappSchema.parse(request.body); await Setting.findOneAndUpdate({ key: 'ADMIN_WHATSAPP_NUMBER' }, { value: whatsappNumber }, { upsert: true, new: true }); response.json({ success: true, message: 'WhatsApp number updated.' }); } catch (error) { next(error); } }
