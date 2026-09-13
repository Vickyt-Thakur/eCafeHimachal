import mongoose from 'mongoose';

export const USER_ROLES = ['CUSTOMER', 'PARTNER', 'ADMIN'];
export const USER_STATUSES = ['ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    mobile: { type: String, required: true, trim: true, unique: true, match: /^[0-9]{10}$/ },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, required: true, default: 'CUSTOMER' },
    status: { type: String, enum: USER_STATUSES, required: true, default: 'ACTIVE' },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
