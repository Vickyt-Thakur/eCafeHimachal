import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { cookieName } from '../utils/auth.js';

export async function requireAuth(request, response, next) {
  try {
    const cookies = Object.fromEntries((request.headers.cookie || '').split(';').filter(Boolean).map((item) => {
      const index = item.indexOf('=');
      return [decodeURIComponent(item.slice(0, index).trim()), decodeURIComponent(item.slice(index + 1).trim())];
    }));
    const token = cookies[cookieName];
    if (!token) return response.status(401).json({ success: false, message: 'Please log in to continue.' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return response.status(401).json({ success: false, message: 'Your account no longer exists.' });
    if (user.status === 'SUSPENDED' || user.status === 'REJECTED') return response.status(403).json({ success: false, message: 'This account is not active.' });

    request.user = user;
    next();
  } catch (_error) {
    return response.status(401).json({ success: false, message: 'Your session has expired. Please log in again.' });
  }
}

export function allowRoles(...roles) {
  return (request, response, next) => {
    if (!roles.includes(request.user.role)) return response.status(403).json({ success: false, message: 'You are not allowed to access this resource.' });
    next();
  };
}
