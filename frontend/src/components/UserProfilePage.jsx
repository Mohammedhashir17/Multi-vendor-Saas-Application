import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Page from '../layouts/Page';
import { MaterialIcon } from '../common/shared';
import { useAuth } from '../contexts/AuthContext/AuthContext';
import { useNotify } from '../contexts/NotifyContext';
import { img } from '../utils/img';

const AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA2d9ru-f0IQpdOUQNO27yMhobcHfi66BNK-ZjRAFoJsxFrj8h773vFMV7oEicTA1o7jcfseorJ4ZjQ6zADpiB4p4RzSmtwj-PM0bdC9thuXgl2OKSAoQshg7uyKaix6mtQtXIjRozO5U2uu1OpG6yimagQ_uLcHyBXj6E_R_XGsyv9HtX8Xv3EjNr_kidh15JqWQeYfJEuTiaSSaRK64YzAaFgumaFaU40BbgzubAfjIY3sPV5lwhJ0Mxi8pj47rMtXXcx0UKDcro';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notify } = useNotify();
  const name = user?.name || 'Arjun Sharma';
  const email = user?.email || 'arjun.sharma@example.in';
  const mobile = user?.mobile
    ? user.mobile.length === 10
      ? `+91 ${user.mobile}`
      : user.mobile.startsWith('91') && user.mobile.length > 10
        ? `+${user.mobile}`
        : user.mobile
    : '+91 98765 43210';

  function handleLogout() {
    logout();
    navigate('/');
    notify({ type: 'success', title: 'Signed out', message: 'You have been logged out.' });
  }

  return (
    <Page navActive="profile" headerVariant="profile">
      <main className="layout-main py-8 lg:py-12 pb-28 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          <div className="lg:col-span-4 space-y-lg relative z-[60]">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-md border border-slate-100">
              <div className="flex flex-col items-center text-center space-y-md">
                <div className="relative group">
                  <img alt="Profile Avatar" className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-primary-container shadow-lg" src={img(AVATAR)} />
                  <button
                    type="button"
                    className="absolute bottom-1 right-1 bg-primary text-white rounded-full shadow-md border-2 border-white w-8 h-8 flex items-center justify-center"
                  >
                    <MaterialIcon name="edit" className="text-[16px] text-white" />
                  </button>
                </div>
                <div>
                  <h1 className="font-h2 text-h2 text-on-surface">{name}</h1>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{email}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{mobile}</p>
                </div>
                <div className="flex gap-xs w-full pt-md">
                  <div className="flex-1 bg-surface-container rounded-lg p-sm">
                    <p className="font-label-md text-label-md text-on-surface-variant">TOTAL ORDERS</p>
                    <p className="font-h3 text-h3 text-primary">24</p>
                  </div>
                  <div className="flex-1 bg-surface-container rounded-lg p-sm">
                    <p className="font-label-md text-label-md text-on-surface-variant">WALLET</p>
                    <p className="font-h3 text-h3 text-primary">₹1,250</p>
                  </div>
                </div>
              </div>
            </div>
            <nav className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 relative z-[60]">
              <div className="divide-y divide-outline-variant/10">
                <Link className="flex items-center justify-between p-md hover:bg-surface-container-low transition-colors group" to="/orders">
                  <div className="flex items-center gap-md">
                    <MaterialIcon name="shopping_bag" className="text-primary" />
                    <span className="font-body-md text-body-md text-on-surface">My Orders</span>
                  </div>
                  <MaterialIcon name="chevron_right" className="text-outline group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link className="flex items-center justify-between p-md hover:bg-surface-container-low transition-colors group" to="/wishlist">
                  <div className="flex items-center gap-md">
                    <MaterialIcon name="favorite" className="text-primary" />
                    <span className="font-body-md text-body-md text-on-surface">Wishlist</span>
                  </div>
                  <MaterialIcon name="chevron_right" className="text-outline group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  className="flex items-center justify-between p-md hover:bg-surface-container-low transition-colors group"
                  to="/profile/addresses"
                >
                  <div className="flex items-center gap-md">
                    <MaterialIcon name="location_on" className="text-primary" />
                    <span className="font-body-md text-body-md text-on-surface">Saved Addresses</span>
                  </div>
                  <MaterialIcon name="chevron_right" className="text-outline group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  className="flex items-center justify-between p-md hover:bg-surface-container-low transition-colors group"
                  to="/profile/settings"
                >
                  <div className="flex items-center gap-md">
                    <MaterialIcon name="settings" className="text-primary" />
                    <span className="font-body-md text-body-md text-on-surface">Settings</span>
                  </div>
                  <MaterialIcon name="chevron_right" className="text-outline group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-md hover:bg-error-container/5 transition-colors group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-md">
                    <MaterialIcon name="logout" className="text-error" />
                    <span className="font-body-md text-body-md text-error font-semibold">Logout</span>
                  </div>
                  <MaterialIcon name="chevron_right" className="text-error/50" />
                </button>
              </div>
            </nav>
          </div>
          <div className="lg:col-span-8 relative z-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-lg gap-2">
                <h2 className="font-h2 text-h2 text-on-surface">Edit Profile</h2>
                <span className="font-label-md text-label-md bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full uppercase tracking-wider w-fit">
                  Public Profile
                </span>
              </div>
              <form
                className="space-y-lg"
                onSubmit={(e) => {
                  e.preventDefault();
                  notify({
                    type: 'success',
                    title: 'Profile saved',
                    message: 'Your changes were recorded (demo — connect PUT /profile when ready).',
                  });
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant block uppercase">Full Name</label>
                    <input className="w-full bg-surface-container border-0 rounded-lg p-md focus:ring-2 focus:ring-primary text-on-surface font-body-md" type="text" defaultValue={name} />
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant block uppercase">Mobile Number</label>
                    <input className="w-full bg-surface-container border-0 rounded-lg p-md focus:ring-2 focus:ring-primary text-on-surface font-body-md" type="tel" defaultValue={mobile} />
                  </div>
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block uppercase">Email Address</label>
                  <input className="w-full bg-surface-container border-0 rounded-lg p-md focus:ring-2 focus:ring-primary text-on-surface font-body-md" type="email" defaultValue={email} />
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block uppercase">Bio</label>
                  <textarea
                    className="w-full bg-surface-container border-0 rounded-lg p-md focus:ring-2 focus:ring-primary text-on-surface font-body-md resize-none"
                    placeholder="Tell us about yourself..."
                    rows={4}
                    defaultValue="Tech enthusiast and occasional chef. Love shopping for the latest gadgets on Bazario!"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant block uppercase">Language Preference</label>
                    <select className="w-full bg-surface-container border-0 rounded-lg p-md focus:ring-2 focus:ring-primary text-on-surface font-body-md">
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Bengali</option>
                      <option>Telugu</option>
                    </select>
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant block uppercase">Currency</label>
                    <select className="w-full bg-surface-container border-0 rounded-lg p-md focus:ring-2 focus:ring-primary text-on-surface font-body-md">
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                    </select>
                  </div>
                </div>
                <div className="pt-md border-t border-outline-variant/10 flex justify-end gap-md">
                  <button type="button" className="px-md py-sm rounded-lg border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-lg py-sm rounded-lg bg-primary text-on-primary font-bold shadow-md hover:brightness-110 active:scale-95 transition-all">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </Page>
  );
}
