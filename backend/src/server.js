import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { connectDb } from './db/db-operations.js';
import authRoutes from './routes/auth-routes.js';
import catalogRoutes from './routes/catalog-routes.js';
import cartRoutes from './routes/cart-routes.js';
import orderRoutes from './routes/order-routes.js';
import couponRoutes from './routes/coupon-routes.js';
import paymentRoutes from './routes/payment-routes.js';
import reviewRoutes from './routes/review-routes.js';
import vendorRoutes from './routes/vendor-routes.js';
import adminRoutes from './routes/admin-routes.js';

const app = express();
const PORT = process.env.PORT || 5050;
const apiPrefix = `/api/${process.env.API_VERSION || 'v1'}`;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use(apiPrefix, authRoutes);
app.use(apiPrefix, catalogRoutes);
app.use(apiPrefix, reviewRoutes);
app.use(apiPrefix, cartRoutes);
app.use(apiPrefix, orderRoutes);
app.use(apiPrefix, couponRoutes);
app.use(apiPrefix, paymentRoutes);
app.use(apiPrefix, vendorRoutes);
app.use(apiPrefix, adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ status: 'failure', message: err.message || 'Internal server error' });
});

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed', err.message);
    process.exit(1);
  });
