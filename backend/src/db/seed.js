import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserModel } from './user.model.js';
import { normalizeMobile } from './user-repository.js';
import { ShopModel } from './shop.model.js';
import { ProductModel } from './product.model.js';
import { CouponModel } from './coupon.model.js';
import { slugify } from '../common/shared.js';

async function main() {
  if (String(process.env.SEED_DB).toLowerCase() !== 'true') {
    console.log('Set SEED_DB=true to run seed');
    process.exit(0);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI required');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected. Seeding...');

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@bazario.local').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  let admin = await UserModel.findOne({ email: adminEmail });
  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    admin = await UserModel.create({
      email: adminEmail,
      passwordHash,
      mobile: normalizeMobile(process.env.ADMIN_MOBILE || '9999900001'),
      name: 'Platform Admin',
      role: 'admin',
    });
    console.log('Created admin:', adminEmail);
  }

  const vendorEmail = 'vendor-demo@bazario.local';
  let vendor = await UserModel.findOne({ email: vendorEmail });
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + Number(process.env.VENDOR_TRIAL_DAYS || 14));

  if (!vendor) {
    const passwordHash = await bcrypt.hash('vendor123', 10);
    vendor = await UserModel.create({
      email: vendorEmail,
      passwordHash,
      mobile: normalizeMobile(process.env.VENDOR_DEMO_MOBILE || '9999900002'),
      name: 'Demo Vendor',
      role: 'vendor',
      businessName: 'Demo Traders',
      vendorTrialEndsAt: trialEnd,
    });
    console.log('Created vendor:', vendorEmail, '/ vendor123');
  }

  let shop = await ShopModel.findOne({ vendorUserId: vendor._id });
  if (!shop) {
    shop = await ShopModel.create({
      vendorUserId: vendor._id,
      name: 'Demo Traders',
      description: 'Seeded shop for local testing',
      status: 'approved',
    });
    console.log('Created approved shop');
  } else if (shop.status !== 'approved') {
    shop.status = 'approved';
    await shop.save();
    console.log('Updated shop to approved');
  }

  const sampleProducts = [
    { title: 'Wireless Earbuds Pro', price: 2999, category: 'electronics', inventory: 50 },
    { title: 'Cotton Kurti Set', price: 899, category: 'fashion', inventory: 30 },
    { title: 'Stainless Steel Cookware', price: 2499, category: 'home', inventory: 20 },
  ];

  for (const sp of sampleProducts) {
    const slug = slugify(sp.title);
    const exists = await ProductModel.findOne({ slug });
    if (exists) continue;
    await ProductModel.create({
      shopId: shop._id,
      vendorUserId: vendor._id,
      title: sp.title,
      slug,
      description: `Demo listing: ${sp.title}`,
      price: sp.price,
      category: sp.category,
      inventory: sp.inventory,
      active: true,
      moderationStatus: 'approved',
      images: [],
    });
    console.log('Created product:', sp.title);
  }

  const code = 'WELCOME10';
  const cup = await CouponModel.findOne({ code });
  if (!cup) {
    await CouponModel.create({
      code,
      discountType: 'percent',
      value: 10,
      active: true,
      maxRedemptions: 1000,
    });
    console.log('Created coupon', code);
  }

  console.log('Seed done.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
