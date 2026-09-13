import Order from '../models/Order.js';
import Service from '../models/Service.js';
import TaskStatusHistory from '../models/TaskStatusHistory.js';
import Setting from '../models/Setting.js';
import { serverPriceForRole } from '../utils/orderPricing.js';
import { buildWhatsAppUrl } from '../utils/whatsapp.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.js';

async function createOrderNumber() {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const number = `ECH-ORD-${year}-${String(Math.floor(100000 + Math.random() * 900000))}`;
    if (!(await Order.exists({ orderNumber: number }))) return number;
  }
  throw new Error('Could not generate a unique order number. Please try again.');
}

function orderView(order) {
  const service = order.serviceId?.name ? { id: order.serviceId._id, name: order.serviceId.name, description: order.serviceId.description } : null;
  const buyer = order.buyerId?.name ? { id: order.buyerId._id, name: order.buyerId.name, mobile: order.buyerId.mobile, email: order.buyerId.email } : null;
  const whatsappNumber = String(process.env.ADMIN_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const whatsappUrl = order.paymentStatus === 'SUCCESS' ? buildWhatsAppUrl(whatsappNumber, { buyerType: order.buyerType, orderNumber: order.orderNumber, serviceName: service?.name || '' }) : null;
  return { id: order._id, orderNumber: order.orderNumber, buyerType: order.buyerType, amount: order.amount, paymentStatus: order.paymentStatus, orderStatus: order.orderStatus, adminNote: order.adminNote, createdAt: order.createdAt, updatedAt: order.updatedAt, completedAt: order.completedAt, service, buyer, whatsappUrl };
}

export async function createOrder(request, response, next) {
  try {
    const { serviceId } = createOrderSchema.parse(request.body);
    const service = await Service.findOne({ _id: serviceId, isActive: true });
    if (!service) return response.status(404).json({ success: false, message: 'This service is unavailable.' });
    const buyerType = request.user.role;
    const amount = serverPriceForRole(service, buyerType);
    const order = await Order.create({ orderNumber: await createOrderNumber(), buyerId: request.user._id, buyerType, serviceId: service._id, amount });
    await TaskStatusHistory.create({ orderId: order._id, oldStatus: null, newStatus: 'PENDING_PAYMENT', changedBy: request.user._id, note: 'Order created. Awaiting payment.' });
    await order.populate('serviceId', 'name description');
    response.status(201).json({ success: true, message: 'Order created. Continue to payment when it becomes available.', order: orderView(order) });
  } catch (error) { next(error); }
}

export async function listMyOrders(request, response, next) {
  try {
    const orders = await Order.find({ buyerId: request.user._id }).populate('serviceId', 'name description').sort({ createdAt: -1 });
    response.json({ success: true, orders: orders.map(orderView) });
  } catch (error) { next(error); }
}

export async function getMyOrder(request, response, next) {
  try {
    const order = await Order.findOne({ _id: request.params.id, buyerId: request.user._id }).populate('serviceId', 'name description');
    if (!order) return response.status(404).json({ success: false, message: 'Order not found.' });
    const history = await TaskStatusHistory.find({ orderId: order._id }).sort({ createdAt: 1 }).populate('changedBy', 'name role');
    const setting = await Setting.findOne({ key: 'ADMIN_WHATSAPP_NUMBER' });
    const result = orderView(order); if (setting?.value && order.paymentStatus === 'SUCCESS') result.whatsappUrl = buildWhatsAppUrl(setting.value, { buyerType: order.buyerType, orderNumber: order.orderNumber, serviceName: order.serviceId.name });
    response.json({ success: true, order: result, history });
  } catch (error) { next(error); }
}

export async function listAdminOrders(_request, response, next) {
  try {
    const orders = await Order.find().populate('serviceId', 'name description').populate('buyerId', 'name mobile email').sort({ createdAt: -1 });
    response.json({ success: true, orders: orders.map(orderView) });
  } catch (error) { next(error); }
}

export async function getAdminOrder(request, response, next) {
  try {
    const order = await Order.findById(request.params.id).populate('serviceId', 'name description').populate('buyerId', 'name mobile email');
    if (!order) return response.status(404).json({ success: false, message: 'Order not found.' });
    const history = await TaskStatusHistory.find({ orderId: order._id }).sort({ createdAt: 1 }).populate('changedBy', 'name role');
    response.json({ success: true, order: orderView(order), history });
  } catch (error) { next(error); }
}

export async function updateAdminOrderStatus(request, response, next) {
  try {
    const { status, adminNote } = updateOrderStatusSchema.parse(request.body);
    const order = await Order.findById(request.params.id);
    if (!order) return response.status(404).json({ success: false, message: 'Order not found.' });
    const oldStatus = order.orderStatus;
    order.orderStatus = status;
    if (adminNote !== undefined) order.adminNote = adminNote;
    if (status === 'COMPLETED' && !order.completedAt) order.completedAt = new Date();
    if (status !== 'COMPLETED') order.completedAt = null;
    await order.save();
    await TaskStatusHistory.create({ orderId: order._id, oldStatus, newStatus: status, changedBy: request.user._id, note: adminNote || '' });
    response.json({ success: true, message: 'Order status updated.' });
  } catch (error) { next(error); }
}
