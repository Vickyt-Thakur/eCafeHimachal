import mongoose from 'mongoose';

const taskStatusHistorySchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    oldStatus: { type: String, default: null },
    newStatus: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('TaskStatusHistory', taskStatusHistorySchema);
