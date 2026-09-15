import bcrypt from 'bcrypt';
import User from '../models/User.js';
import PartnerProfile from '../models/PartnerProfile.js';
import { customerRegistrationSchema, loginSchema, partnerRegistrationSchema } from '../validators/auth.js';
import { clearAuthCookie, createToken, setAuthCookie } from '../utils/auth.js';

function normalizeEmail(email) { return email?.trim().toLowerCase() || undefined; }
function publicUser(user) { return { id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role, status: user.status, createdAt: user.createdAt }; }

async function existingAccount(mobile, email) {
  const conditions = [{ mobile }];
  if (email) conditions.push({ email });
  return User.findOne({ $or: conditions });
}

export async function registerCustomer(request, response, next) {
  try {
    const data = customerRegistrationSchema.parse(request.body);
    const email = normalizeEmail(data.email);
    if (await existingAccount(data.mobile, email)) return response.status(409).json({ success: false, message: 'An account already uses this mobile number or email.' });

    const user = await User.create({ name: data.name, mobile: data.mobile, email, passwordHash: await bcrypt.hash(data.password, 12), role: 'CUSTOMER', status: 'ACTIVE' });
    setAuthCookie(response, createToken(user));
    response.status(201).json({ success: true, message: 'Your account has been created.', user: publicUser(user) });
  } catch (error) { next(error); }
}

export async function registerPartner(request, response, next) {
  try {
    const data = partnerRegistrationSchema.parse(request.body);
    const email = normalizeEmail(data.email);
    if (await existingAccount(data.mobile, email)) return response.status(409).json({ success: false, message: 'An account already uses this mobile number or email.' });

    const user = await User.create({ name: data.name, mobile: data.mobile, email, passwordHash: await bcrypt.hash(data.password, 12), role: 'PARTNER', status: 'PENDING' });
    await PartnerProfile.create({ userId: user._id, businessName: data.businessName, address: data.address, city: data.city, state: data.state, partnerStatus: 'PENDING' });
    response.status(201).json({ success: true, message: 'Partner request submitted. An admin must approve it before you can log in.' });
  } catch (error) { next(error); }
}

async function authenticate(request, response, next, requiredRole) {
  try {
    const { identifier, password } = loginSchema.parse(request.body);
    const isEmail = identifier.includes('@');
    const user = await User.findOne(isEmail ? { email: identifier.toLowerCase() } : { mobile: identifier }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return response.status(401).json({ success: false, message: 'Incorrect mobile/email or password.' });
    if (requiredRole && user.role !== requiredRole) return response.status(403).json({ success: false, message: `This account must be accessed through the ${user.role.toLowerCase()} login page.` });
    if (user.role === 'PARTNER' && user.status === 'PENDING') return response.status(403).json({ success: false, message: 'Your partner account is awaiting admin approval.' });
    if (user.status === 'SUSPENDED' || user.status === 'REJECTED') return response.status(403).json({ success: false, message: 'This account is not active. Please contact eCafeHimachal.' });

    setAuthCookie(response, createToken(user));
    response.json({ success: true, message: 'Welcome back.', user: publicUser(user) });
  } catch (error) { next(error); }
}

// Retained for backwards-compatible API consumers. The website uses the role-specific
// handlers below, which enforce the account role before creating a session.
export async function login(request, response, next) { return authenticate(request, response, next); }
export async function loginCustomer(request, response, next) { return authenticate(request, response, next, 'CUSTOMER'); }
export async function loginPartner(request, response, next) { return authenticate(request, response, next, 'PARTNER'); }
export async function loginAdmin(request, response, next) { return authenticate(request, response, next, 'ADMIN'); }

export function logout(_request, response) {
  clearAuthCookie(response);
  response.json({ success: true, message: 'You have been logged out.' });
}

export function me(request, response) { response.json({ success: true, user: publicUser(request.user) }); }
