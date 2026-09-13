import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  { key: { type: String, required: true, unique: true }, value: { type: String, required: true, trim: true, maxlength: 300 } },
  { timestamps: true },
);

export default mongoose.model('Setting', settingSchema);
