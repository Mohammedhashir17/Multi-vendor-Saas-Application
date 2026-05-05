import { UserModel } from './user.model.js';

/** Strip non-digits; used for storage and lookup. */
export function normalizeMobile(input) {
  return String(input || '').replace(/\D/g, '');
}

export async function findUserByEmail(email) {
  return UserModel.findOne({ email: email.toLowerCase().trim() });
}

export async function findUserByMobileNormalized(mobileDigits) {
  if (!mobileDigits || mobileDigits.length < 10) return null;
  return UserModel.findOne({ mobile: mobileDigits });
}

/** Login identifier: email if it contains @, otherwise treat as mobile (digits). */
export async function findUserByEmailOrMobile(identifier) {
  const raw = String(identifier || '').trim();
  if (!raw) return null;
  if (raw.includes('@')) {
    return findUserByEmail(raw);
  }
  const mobile = normalizeMobile(raw);
  return findUserByMobileNormalized(mobile);
}

export async function findUserByGoogleSub(sub) {
  if (!sub) return null;
  return UserModel.findOne({ googleSub: String(sub).trim() });
}

export async function findUserById(id) {
  return UserModel.findById(id);
}

export async function createUser(fields) {
  const {
    email,
    passwordHash,
    name,
    role,
    businessName,
    vendorTrialEndsAt,
    mobile,
    authProvider,
    googleSub,
  } = fields;
  return UserModel.create({
    email: email.toLowerCase().trim(),
    passwordHash: passwordHash ?? '',
    mobile: mobile || undefined,
    name: name || '',
    role: role || 'customer',
    businessName: businessName || '',
    vendorTrialEndsAt: vendorTrialEndsAt || undefined,
    authProvider: authProvider || 'local',
    googleSub: googleSub || undefined,
  });
}

export async function saveUser(doc) {
  return doc.save();
}

export async function updateUserCart(userId, cartItems) {
  return UserModel.findByIdAndUpdate(userId, { cartItems }, { new: true });
}
