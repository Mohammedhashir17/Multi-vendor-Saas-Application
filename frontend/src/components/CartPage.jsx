import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Page from '../layouts/Page';
import { MaterialIcon, useCart } from '../common/shared';
import { img } from '../utils/img';

const DEMO_ROWS = [
  {
    id: 'cart-demo-1',
    title: 'Velocity Pro Sneakers',
    meta: 'Sold by SportX India • Red / Size 10',
    price: 4999,
    qty: 1,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAGc8JHxPrAXglxf0tKfN9UQZ5Lb5t9NpnoFH_GDgj49xlfKADyjZJiwpIiOyeccULERDKge8_to4cn1POJlCg3oPEwlFHOvjdB7VVthbKkhQkwB6_A8Aq7nwEJfwRrg-A2bAFtUjugkM74wSSVx_l8UKG9VbdVjFPtM_4UmDOWbXTrliwesV4tirrKmLnV8-YlwficNMkJl0Db4pO_rULlpvxBXcCEfhljz9RLteY0z1U7DQVFVbOXDyqlEvSKeNNAk7QBQRoJpXY',
  },
  {
    id: 'cart-demo-2',
    title: 'SonicWave Noise Cancelling Headphones',
    meta: 'Sold by TechHub Audio • Midnight Black',
    price: 8999,
    qty: 1,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA3UNMbDOFJafOWKApQCadTrXp_dxp3HcmnOadKH612PhOgKTmVSiXlvYkGmB0564KMZr0MCYcJCspDlUcKOcTnINg7r5Af7ZMdySN8ElXNflX4RxZ9S8L5cIsipp2oSMkWgwn3DBJDNlBzTgEmnyOFJVXMfBcFtoCU166ZFQ7SZ1Ttn-Ya5tsD5YpeNcX_ayGt_hfl_cTB56KiM9a7o6Apqi0po15ETF_HnTMqkqs_PHirjYfoZIE_nzshDk_Zu13SvA1AEyhOdps',
  },
  {
    id: 'cart-demo-3',
    title: 'Chronos Heritage Watch',
    meta: 'Sold by TimeKeepers • Brown Leather',
    price: 5999,
    qty: 1,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBKgJeH0G73flm6AT_tyRaf01XQpXFFg_h3z5Z1KLGjYQ9k4EIjfsuv2hTaXazZB0X5cDogIFlLTDlNLt5eFacTaydisEuKk4U73cfTf4kDe0UIcFPe_BtrQakQResNmzdg9_pETy3N2yYeZsPAxG1yffDR_YDCi_QKXoFVzyYOoa04-WU4CLm-36XVaQMYBgUPJfNWl8pf2mMHir7s3dt49kDKwpCU-YXVZhc6k_IIBPNEpY2_7hubYc5Jq-NPaVAOOE8HxGwZrsc',
  },
];

export default function CartPage() {
  const navigate = useNavigate();
  const { items, updateQty, removeItem, clear, subtotal } = useCart();
  const rows = items.length ? items : DEMO_ROWS;
  const total = items.length ? subtotal : DEMO_ROWS.reduce((s, r) => s + r.price * r.qty, 0);

  return (
    <Page navActive="cart" headerVariant="cart">
      <main className="layout-main py-xl pb-28 md:pb-12">
        <div className="flex flex-col lg:flex-row gap-lg">
          <div className="flex-1 space-y-lg min-w-0">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <h1 className="font-h1 text-h1 text-on-surface">
                Your Cart{' '}
                <span className="font-normal text-outline text-h3">
                  ({rows.reduce((s, r) => s + (r.qty || 1), 0)} items)
                </span>
              </h1>
              <button type="button" onClick={clear} className="text-primary font-label-md flex items-center gap-xs hover:underline">
                <MaterialIcon name="delete_sweep" className="text-sm" />
                Clear Cart
              </button>
            </div>
            <div className="space-y-md">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="bg-white rounded-xl shadow-[0_4px_12px_rgba(126,116,125,0.08)] p-md flex flex-col sm:flex-row gap-md border border-slate-50"
                >
                  <div className="w-full sm:w-32 h-32 rounded-lg bg-surface-container-low overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                    <img alt="" className="w-full h-full object-cover" src={img(row.image)} />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="font-h3 text-h3 text-on-surface">{row.title}</h3>
                        <p className="font-body-sm text-outline mt-1">{row.meta || `Sold by ${row.vendor || 'Bazario'}`}</p>
                      </div>
                      {items.length > 0 && (
                        <button type="button" className="text-outline hover:text-error transition-colors p-1 shrink-0" onClick={() => removeItem(row.id)}>
                          <MaterialIcon name="close" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-end justify-between mt-4 flex-wrap gap-2">
                      <div className="flex items-center border border-outline-variant rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          className="p-2 hover:bg-surface-container-low active:scale-90 transition-transform"
                          onClick={() => items.length && updateQty(row.id, (row.qty || 1) - 1)}
                        >
                          <MaterialIcon name="remove" className="text-sm" />
                        </button>
                        <span className="px-4 font-bold text-body-md">{row.qty || 1}</span>
                        <button
                          type="button"
                          className="p-2 hover:bg-surface-container-low active:scale-90 transition-transform"
                          onClick={() => items.length && updateQty(row.id, (row.qty || 1) + 1)}
                        >
                          <MaterialIcon name="add" className="text-sm" />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="font-price text-price text-on-surface">₹{((row.price || 0) * (row.qty || 1)).toLocaleString('en-IN')}.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {items.length === 0 && (
              <p className="text-body-sm text-on-surface-variant text-center md:text-left">
                Showing sample items. Add products from the{' '}
                <Link className="text-primary font-semibold underline" to="/products">
                  catalog
                </Link>{' '}
                to replace these with your cart.
              </p>
            )}
          </div>
          <aside className="w-full lg:w-96 shrink-0 space-y-lg lg:sticky lg:top-24 self-start">
            <div className="bg-white rounded-xl p-md shadow-sm border border-slate-100">
              <h3 className="font-h3 text-h3 mb-md border-b border-slate-50 pb-md">Order Summary</h3>
              <div className="space-y-md">
                <div className="flex justify-between font-body-md">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-bold">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-body-md">
                  <span className="text-on-surface-variant">Delivery</span>
                  <span className="text-green-600 font-bold text-label-md">FREE</span>
                </div>
                <div className="flex justify-between font-body-md">
                  <span className="text-on-surface-variant">GST (Est.)</span>
                  <span className="font-bold">₹{Math.round(total * 0.18).toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-100 pt-md flex justify-between items-center">
                  <span className="font-h3 text-h3">Total</span>
                  <span className="font-price text-2xl text-primary">₹{(total + Math.round(total * 0.18)).toLocaleString('en-IN')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-primary-container text-white py-4 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 hover:brightness-110"
                >
                  Proceed to Checkout
                  <MaterialIcon name="arrow_forward" />
                </button>
                <div className="flex justify-center gap-4 opacity-30 grayscale">
                  <MaterialIcon name="credit_card" className="text-3xl" />
                  <MaterialIcon name="account_balance" className="text-3xl" />
                </div>
              </div>
            </div>
            <div className="bg-secondary-container/10 rounded-xl p-md border border-primary/5">
              <div className="flex gap-md">
                <MaterialIcon name="verified_user" className="text-primary text-3xl" />
                <div>
                  <p className="font-bold text-body-sm text-on-surface">100% Purchase Protection</p>
                  <p className="text-xs text-on-surface-variant mt-1">Full refund if you don&apos;t receive your order</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </Page>
  );
}
