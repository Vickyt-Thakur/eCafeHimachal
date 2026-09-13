import mongoose from 'mongoose';

export const ORDER_STATUSES = ['PENDING_PAYMENT', 'PAID', 'IN_PROGRESS', 'WAITING', 'COMPLETED', 'CANCELLED'];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyerType: { type: String, enum: ['CUSTOMER', 'PARTNER'], required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    orderStatus: { type: String, enum: ORDER_STATUSES, default: 'PENDING_PAYMENT' },
    adminNote: { type: String, trim: true, maxlength: 1000, default: '' },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model('Order', orderSchema);
