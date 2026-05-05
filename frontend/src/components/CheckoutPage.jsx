import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Page from '../layouts/Page';
import { MaterialIcon, useCart } from '../common/shared';
import { img } from '../utils/img';

const UPI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBGsUGqJ0ldLeO9A41C8ugSXt_O562tC-HJNM_ibIEM0kzr7lqJl4hOWOHo-0g5Pdp7K7XRFqVS2hQwTVlZ080N6L5CAKSdmC9X5qbbnaMPA8jqOEkKcArau0ivd9YLnQQMsf-CF3wmYbjH3AdtET43Vq0WG10XQ86xbsG6DCUEoehHJUfoNlrO-gr5YZORvbVTJX51P_j818f8gKgFXGxHJqfFVecPB9A2nmPssRQwqPr0CZTXoWTVH8lQLIJXuy3JDI5Fw5XGJSo';
const CK1 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBm2Qojw21zh-KSyTSBmgxtfSAzND6SitZIuBAw6e3dhNx-lzcj_yz5fOL_JCQKNmDxQVz2z7wieiHAHArcB_XWv6UcJZztGCkYrczT_z-Bng3K6nVERceTfEFs_icAREdyLroTUTkXRM9NCpDUuJ6E0-xxHZ6STWSop3h8SwNxPDYoYec1lpW1oY0FFHeyzTjrDIKdRInNCTWjp5Ozzvy5_g-G5JfXa0VGcZXtclC8s-XxtShj2fwWx2gGi-ncAc6NbdwzEsxWwVo';
const CK2 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBoEYhfrQ1mfC9oXtgWAU5e6uoa7g9LsPHldLRxWkEw4ScMD3lbxE6eCjQchonWCruaYtCTHdV4UtAXMCabV-jZs8KQYHFsOL-ZSyWCJWrqIoijOYrn4oYQeBX41feI8PTlYuFVTw78dnLU27NSRdJu4pxU9DMxZaHiRF6VYlEz8p_chJHCDYBB8i0Vv8j85BGraC1XCKH6xIErkZd2uPesP1jLbAbJh52uAdMzfxbs6GrGn3S_CVPTvlltFqpMJ-OaFkl58kegaKU';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const line1 = items[0] || { title: 'Speedster Pro Running Shoes', price: 2499, qty: 1, vendor: 'Cloudtail India', image: CK1 };
  const line2 = items[1] || { title: 'Classic Silver Analog Watch', price: 1850, qty: 1, vendor: 'RetailEZ', image: CK2 };
  const sub = items.length ? subtotal : line1.price * line1.qty + line2.price * line2.qty;
  const tax = Math.round(sub * 0.18 * 100) / 100;
  const total = sub + tax;

  return (
    <Page navActive="cart" headerVariant="checkout">
      <main className="layout-main py-lg md:py-xl pb-28 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
          <div className="lg:col-span-8 space-y-lg min-w-0">
            <section className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-md md:p-lg">
              <div className="flex items-center justify-between mb-md flex-wrap gap-2">
                <div className="flex items-center gap-sm">
                  <span className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold">1</span>
                  <h2 className="font-h2 text-h2 text-on-surface">Delivery Address</h2>
                </div>
                <button type="button" className="text-primary font-label-md uppercase tracking-wider hover:underline">
                  Add New Address
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg">
                <div className="border-2 border-primary-container bg-surface-container-low p-md rounded-xl relative">
                  <div className="absolute top-2 right-2 text-primary">
                    <MaterialIcon name="check_circle" filled />
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-primary-container text-white text-[10px] font-bold rounded mb-2">HOME</span>
                  <h4 className="font-h3 text-body-md font-bold mb-1">Rajesh Kumar</h4>
                  <p className="text-body-sm text-on-surface-variant">
                    45, Green Park Main, Opp. Metro Station
                    <br />
                    New Delhi, Delhi 110016
                  </p>
                  <p className="text-body-sm text-on-surface-variant mt-2 font-semibold">Phone: +91 98765 43210</p>
                </div>
                <div className="border border-outline-variant p-md rounded-xl hover:border-primary transition-colors cursor-pointer group">
                  <span className="inline-block px-2 py-0.5 bg-surface-container-highest text-on-surface-variant text-[10px] font-bold rounded mb-2">OFFICE</span>
                  <h4 className="font-h3 text-body-md font-bold mb-1">Rajesh Kumar (Work)</h4>
                  <p className="text-body-sm text-on-surface-variant">
                    Wing B, Tech Hub Towers, Sector 62
                    <br />
                    Noida, Uttar Pradesh 201301
                  </p>
                  <p className="text-body-sm text-on-surface-variant mt-2">Phone: +91 98765 00000</p>
                </div>
              </div>
              <div className="mt-md p-md border border-dashed border-outline-variant rounded-xl flex items-center justify-center gap-sm text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer">
                <MaterialIcon name="add_location" />
                <span className="font-body-md text-center">Use current location or enter a new address</span>
              </div>
            </section>
            <section className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-md md:p-lg">
              <div className="flex items-center gap-sm mb-md">
                <span className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold">2</span>
                <h2 className="font-h2 text-h2 text-on-surface">Payment Method</h2>
              </div>
              <div className="space-y-md">
                <label className="flex flex-col sm:flex-row sm:items-center gap-sm p-md border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                  <input className="w-5 h-5 text-primary border-outline-variant focus:ring-primary shrink-0" name="payment" type="radio" />
                  <div className="ml-0 sm:ml-md flex flex-col flex-1 min-w-0">
                    <span className="font-body-md font-bold">UPI (GPay, PhonePe, Paytm)</span>
                    <span className="text-body-sm text-on-surface-variant">Instant payment using your UPI ID</span>
                  </div>
                  <img alt="UPI" className="h-6 opacity-80 self-start sm:self-center" src={img(UPI)} />
                </label>
                <label className="flex flex-col sm:flex-row sm:items-center gap-sm p-md border-2 border-primary-container bg-surface-container-low rounded-xl cursor-pointer">
                  <input defaultChecked className="w-5 h-5 text-primary border-outline-variant focus:ring-primary shrink-0" name="payment" type="radio" />
                  <div className="ml-0 sm:ml-md flex flex-col flex-1">
                    <span className="font-body-md font-bold">Credit / Debit Card</span>
                    <span className="text-body-sm text-on-surface-variant">All major Indian and international cards accepted</span>
                  </div>
                  <MaterialIcon name="credit_card" className="text-on-surface-variant self-start sm:self-center" />
                </label>
                <div className="ml-0 md:ml-10 p-md bg-white border border-outline-variant rounded-lg space-y-md">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1">CARD NUMBER</label>
                    <input className="w-full border-outline-variant rounded-lg p-md focus:border-primary focus:ring-1 focus:ring-primary" placeholder="XXXX XXXX XXXX 4455" type="text" />
                  </div>
                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-1">EXPIRY DATE</label>
                      <input className="w-full border-outline-variant rounded-lg p-md focus:border-primary focus:ring-1 focus:ring-primary" placeholder="MM / YY" type="text" />
                    </div>
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-1">CVV</label>
                      <input className="w-full border-outline-variant rounded-lg p-md focus:border-primary focus:ring-1 focus:ring-primary" placeholder="***" type="password" />
                    </div>
                  </div>
                </div>
                <label className="flex flex-col sm:flex-row sm:items-center gap-sm p-md border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                  <input className="w-5 h-5 text-primary border-outline-variant focus:ring-primary shrink-0" name="payment" type="radio" />
                  <div className="ml-0 sm:ml-md flex flex-col flex-1">
                    <span className="font-body-md font-bold">Net Banking</span>
                    <span className="text-body-sm text-on-surface-variant">Select from over 50+ banks</span>
                  </div>
                  <MaterialIcon name="account_balance" className="text-on-surface-variant self-start sm:self-center" />
                </label>
              </div>
            </section>
            <div className="flex flex-wrap justify-center gap-lg py-md">
              <div className="flex items-center gap-xs text-on-surface-variant">
                <MaterialIcon name="verified_user" className="text-green-600" />
                <span className="text-label-md">100% SECURE PAYMENTS</span>
              </div>
              <div className="flex items-center gap-xs text-on-surface-variant">
                <MaterialIcon name="local_shipping" className="text-blue-600" />
                <span className="text-label-md">FAST NATIONWIDE DELIVERY</span>
              </div>
              <div className="flex items-center gap-xs text-on-surface-variant">
                <MaterialIcon name="shield_with_heart" className="text-orange-600" />
                <span className="text-label-md">BAZARIO TRUST PROMISE</span>
              </div>
            </div>
          </div>
          <aside className="lg:col-span-4 min-w-0">
            <div className="lg:sticky lg:top-24 space-y-lg">
              <section className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
                <div className="bg-surface-container-high px-md py-sm">
                  <h3 className="font-h3 text-body-md font-bold text-secondary">Order Summary</h3>
                </div>
                <div className="p-md space-y-md">
                  <div className="flex gap-md">
                    <div className="w-16 h-16 bg-surface-container rounded-lg border border-outline-variant overflow-hidden flex-shrink-0">
                      <img alt="" className="w-full h-full object-cover" src={img(line1.image)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-body-sm font-bold line-clamp-2">{line1.title}</h4>
                      <p className="text-[12px] text-on-surface-variant">Sold by: {line1.vendor}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[12px]">Qty: {line1.qty || 1}</span>
                        <span className="font-bold text-body-sm">₹{line1.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-md">
                    <div className="w-16 h-16 bg-surface-container rounded-lg border border-outline-variant overflow-hidden flex-shrink-0">
                      <img alt="" className="w-full h-full object-cover" src={img(line2.image)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-body-sm font-bold line-clamp-2">{line2.title}</h4>
                      <p className="text-[12px] text-on-surface-variant">Sold by: {line2.vendor}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[12px]">Qty: {line2.qty || 1}</span>
                        <span className="font-bold text-body-sm">₹{line2.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                  <hr className="border-outline-variant/50" />
                  <div className="space-y-sm text-body-sm">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Subtotal</span>
                      <span>₹{sub.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Delivery Charges</span>
                      <span className="text-green-600 font-bold uppercase text-[10px]">Free</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Tax (GST 18%)</span>
                      <span>₹{tax.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant pt-2 border-t border-dashed border-outline-variant">
                      <span className="text-body-md font-bold">Total Amount</span>
                      <span className="text-h3 font-h3 text-primary">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full bg-primary text-white font-bold py-md rounded-xl shadow-lg active:scale-[0.98] transition-transform hover:bg-primary-container flex items-center justify-center gap-sm"
                    onClick={() => {
                      clear();
                      navigate('/order-confirmation');
                    }}
                  >
                    <span>Place Order</span>
                    <MaterialIcon name="arrow_forward" />
                  </button>
                  <p className="text-[10px] text-center text-on-surface-variant px-md">
                    By placing this order, you agree to Bazario&apos;s <span className="underline cursor-pointer">Terms of Service</span> and{' '}
                    <span className="underline cursor-pointer">Privacy Policy</span>.
                  </p>
                </div>
              </section>
              <section className="bg-[#D9D5A9]/30 border border-[#D9D5A9] rounded-xl p-md">
                <div className="flex items-center gap-sm mb-sm text-secondary">
                  <MaterialIcon name="sell" />
                  <span className="font-bold text-body-sm">Apply Coupon</span>
                </div>
                <div className="flex gap-sm flex-col sm:flex-row">
                  <input className="flex-1 bg-white border-outline-variant rounded-lg px-md text-body-sm focus:ring-primary focus:border-primary min-h-[44px]" placeholder="Enter code" type="text" />
                  <button type="button" className="px-md py-sm bg-secondary text-white font-bold rounded-lg text-body-sm hover:opacity-90 min-h-[44px]">
                    Apply
                  </button>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </main>
    </Page>
  );
}
