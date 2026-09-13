import PartnerProfile from '../models/PartnerProfile.js';
import User from '../models/User.js';
import { z } from 'zod';

const statusSchema = z.object({ status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING']) });

export async function listPartners(_request, response, next) {
  try {
    const partners = await PartnerProfile.find().sort({ createdAt: -1 }).populate('userId', 'name email mobile status createdAt');
    response.json({ success: true, partners: partners.map((partner) => ({ id: partner._id, businessName: partner.businessName, city: partner.city, state: partner.state, status: partner.partnerStatus, user: partner.userId })) });
  } catch (error) { next(error); }
}

export async function updatePartnerStatus(request, response, next) {
  try {
    const { status } = statusSchema.parse(request.body);
    const partner = await PartnerProfile.findById(request.params.id);
    if (!partner) return response.status(404).json({ success: false, message: 'Partner request not found.' });
    partner.partnerStatus = status;
    await partner.save();
    const userStatus = status === 'APPROVED' ? 'ACTIVE' : status;
    await User.findByIdAndUpdate(partner.userId, { status: userStatus });
    response.json({ success: true, message: `Partner marked ${status.toLowerCase()}.` });
  } catch (error) { next(error); }
}
