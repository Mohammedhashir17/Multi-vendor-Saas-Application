export function jsonError(res, status, message) {
  return res.status(status).json({ status: 'failure', message });
}

/** Support both `{ data: { ... } }` and flat body (matches cluster-builder style + CRA axios). */
export function getRequestPayload(req) {
  return req.body?.data ?? req.body ?? {};
}

/** Shallow clone with password fields redacted for logs. */
export function redactForLog(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = { ...obj };
  if ('password' in out) out.password = '[REDACTED]';
  if ('newPassword' in out) out.newPassword = '[REDACTED]';
  if ('otp' in out) out.otp = '[REDACTED]';
  if ('confirmPassword' in out) out.confirmPassword = '[REDACTED]';
  if ('passwordHash' in out) out.passwordHash = '[REDACTED]';
  return out;
}

export function toPublicUser(doc) {
  if (!doc) return null;
  const o = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: o._id?.toString?.() ?? o.id,
    email: o.email,
    name: o.name,
    role: o.role || 'customer',
    businessName: o.businessName || undefined,
    mobile: o.mobile || undefined,
  };
}

/** Vendor flow: trial still active OR paid subscription active (see Flow diagram). */
export function isVendorEntitled(user) {
  if (!user || user.role !== 'vendor') return false;
  const now = new Date();
  if (user.vendorTrialEndsAt && new Date(user.vendorTrialEndsAt) > now) return true;
  if (user.subscriptionActive && user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > now) return true;
  return false;
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const CATEGORIES = [
  { id: 'electronics', name: 'Electronics' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'home', name: 'Home & Kitchen' },
  { id: 'beauty', name: 'Beauty & Care' },
  { id: 'sports', name: 'Sports' },
  { id: 'general', name: 'General' },
];

export function toPublicProduct(p) {
  if (!p) return null;
  const shop = p.shopId;
  const shopName = shop && typeof shop === 'object' ? shop.name : undefined;
  const shopOk = shop && typeof shop === 'object' ? shop.status === 'approved' : false;
  return {
    id: p._id?.toString(),
    title: p.title,
    slug: p.slug,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images || [],
    category: p.category,
    inventory: p.inventory,
    shopId: p.shopId?._id?.toString?.() ?? p.shopId?.toString?.(),
    shopName: shopOk ? shopName : undefined,
    vendorUserId: p.vendorUserId?.toString?.(),
  };
}
