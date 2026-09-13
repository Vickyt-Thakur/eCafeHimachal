import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 180 },
    category: { type: String, required: true, trim: true, default: 'Digital Services', maxlength: 80 },
    customerPrice: { type: Number, required: true, min: 0 },
    partnerPrice: { type: Number, required: true, min: 0 },
    icon: { type: String, trim: true, default: 'FileText', maxlength: 40 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('Service', serviceSchema);
