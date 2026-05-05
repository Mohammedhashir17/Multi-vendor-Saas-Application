import React from 'react';
import { Link } from 'react-router-dom';
import Page from '../layouts/Page';
import { MaterialIcon } from '../common/shared';
import { img } from '../utils/img';

const SHOE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCWwcMU8l3pL99m0LAa1j8ZROAir8LzvMH3KG5OftW1ehgKp6LmzGbGiQYYGES29tMnho-l19a2TBSaJwR4QHYxRrAckTmEZCVlh1webpu4YBeaAiYVOGRE78LPM3lRJ1f4RYaNOwLnuCntIyylaYol1xequnFJpmJPCe5lrMKJw-6HmBEKJS6NMF1IUXEaqsDn2S-Xtv_31pKNEMopY219Wx4lqFo3zocYqobM-7GP1zcssLmd2iB-dK8lMqU57akCCRUKImKZ-1A';

export default function OrderConfirmationPage() {
  return (
    <Page navActive="categories">
      <main className="layout-main py-12 pb-24 md:pb-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <MaterialIcon name="check_circle" className="text-5xl" filled />
          </div>
          <h1 className="font-h1 text-h1 text-on-surface mb-2">Order Confirmed!</h1>
          <p className="text-on-surface-variant font-body-lg mb-8">Thank you for shopping with Bazario.</p>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-md text-left max-w-md mx-auto">
            <p className="text-label-md text-on-surface-variant uppercase mb-2">Order ID</p>
            <p className="font-h3 text-on-surface mb-4">#BHM-829104-IND</p>
            <div className="flex gap-md items-center border-t border-slate-50 pt-4">
              <img alt="" className="w-20 h-20 rounded-lg object-cover bg-surface-container" src={img(SHOE)} />
              <div>
                <p className="font-bold">Velocity Pro Sneakers</p>
                <p className="text-body-sm text-outline">Qty 1 • ₹4,999</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link to="/orders" className="bg-primary-container text-white px-8 py-3 rounded-xl font-bold hover:brightness-110">
              Track Order
            </Link>
            <Link to="/products" className="border-2 border-brand-frame text-brand-frame px-8 py-3 rounded-xl font-bold hover:bg-brand-frame/5">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </Page>
  );
}
