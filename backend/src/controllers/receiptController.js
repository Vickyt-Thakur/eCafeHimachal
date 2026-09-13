import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Receipt from '../models/Receipt.js';
import PartnerProfile from '../models/PartnerProfile.js';
import { streamReceiptPdf } from '../services/receipt.js';

async function hydrateReceipt(receiptId, buyerId = null) {
  const receipt = await Receipt.findById(receiptId).populate({ path: 'orderId', populate: [{ path: 'buyerId', select: 'name email mobile role' }, { path: 'serviceId', select: 'name' }] }).populate('paymentId');
  if (!receipt || !receipt.orderId || (buyerId && receipt.orderId.buyerId._id.toString() !== buyerId.toString())) return null;
  const profile = receipt.orderId.buyerType === 'PARTNER' ? await PartnerProfile.findOne({ userId: receipt.orderId.buyerId._id }).select('businessName') : null;
  return { id: receipt._id, receiptNumber: receipt.receiptNumber, orderNumber: receipt.orderId.orderNumber, buyerName: receipt.orderId.buyerId.name, buyerType: receipt.orderId.buyerType, businessName: profile?.businessName, serviceName: receipt.orderId.serviceId.name, amount: receipt.paymentId.amount, paymentStatus: receipt.paymentId.status, razorpayPaymentId: receipt.paymentId.razorpayPaymentId, date: receipt.createdAt, orderId: receipt.orderId._id };
}

export async function listMyReceipts(request, response, next) { try { const orders = await Order.find({ buyerId: request.user._id, paymentStatus: 'SUCCESS' }).select('_id'); const receipts = await Receipt.find({ orderId: { $in: orders.map((order) => order._id) } }).sort({ createdAt: -1 }); const data = await Promise.all(receipts.map((receipt) => hydrateReceipt(receipt._id, request.user._id))); response.json({ success: true, receipts: data.filter(Boolean) }); } catch (error) { next(error); } }
export async function listAdminReceipts(_request, response, next) { try { const receipts = await Receipt.find().sort({ createdAt: -1 }); const data = await Promise.all(receipts.map((receipt) => hydrateReceipt(receipt._id))); response.json({ success: true, receipts: data.filter(Boolean) }); } catch (error) { next(error); } }
export async function downloadMyReceipt(request, response, next) { try { const receipt = await hydrateReceipt(request.params.id, request.user._id); if (!receipt) return response.status(404).json({ success: false, message: 'Receipt not found.' }); streamReceiptPdf(response, receipt); } catch (error) { next(error); } }
export async function downloadAdminReceipt(request, response, next) { try { const receipt = await hydrateReceipt(request.params.id); if (!receipt) return response.status(404).json({ success: false, message: 'Receipt not found.' }); streamReceiptPdf(response, receipt); } catch (error) { next(error); } }
