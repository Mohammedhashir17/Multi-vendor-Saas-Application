import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { MaterialIcon, useCart, useWishlist } from '../common/shared';
import { useNotify } from '../contexts/NotifyContext';

/** Main marketplace chrome: header, optional bottom nav, FAB — matches Stitch breakpoints. */
export function AppHeader({ navActive = 'home', headerVariant = 'default' }) {
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notify } = useNotify();
  const qFromUrl = searchParams.get('q') ?? '';
  const [searchText, setSearchText] = useState(qFromUrl);

  useEffect(() => {
    setSearchText(qFromUrl);
  }, [qFromUrl]);

  const runSearch = () => {
    const t = searchText.trim();
    if (t) navigate(`/products?q=${encodeURIComponent(t)}`);
    else navigate('/products');
  };

  const navCls = (key) =>
    navActive === key
      ? 'text-brand-action font-bold border-b-2 border-brand-action'
      : 'text-brand-neutral font-medium hover:text-brand-frame dark:hover:text-white transition-colors duration-200';

  const desktopNav = () => {
    if (headerVariant === 'cart') {
      return (
        <>
          <Link className={navCls('home')} to="/">
            Home
          </Link>
          <Link className={navCls('categories')} to="/products">
            Categories
          </Link>
          <Link className={navCls('cart')} to="/cart">
            Cart
          </Link>
          <Link className={navCls('profile')} to="/profile">
            Profile
          </Link>
        </>
      );
    }
    if (headerVariant === 'checkout') {
      return (
        <>
          <Link className={navCls('home')} to="/">
            Home
          </Link>
          <Link className={navCls('categories')} to="/products">
            Categories
          </Link>
          <span className="text-brand-action font-bold border-b-2 border-brand-action">Checkout</span>
        </>
      );
    }
    if (headerVariant === 'product') {
      return (
        <>
          <Link className={navCls('home')} to="/">
            Home
          </Link>
          <Link className={navCls('products')} to="/products">
            Products
          </Link>
        </>
      );
    }
    if (headerVariant === 'listing') {
      return (
        <>
          <Link className={navCls('home')} to="/">
            Home
          </Link>
          <Link className={navCls('categories')} to="/products">
            Categories
          </Link>
          <Link className={navCls('orders')} to="/orders">
            Orders
          </Link>
        </>
      );
    }
    if (headerVariant === 'profile') {
      return (
        <>
          <Link className={navCls('home')} to="/">
            Home
          </Link>
          <Link className={navCls('categories')} to="/products">
            Categories
          </Link>
          <Link className={navCls('profile')} to="/profile">
            Profile
          </Link>
        </>
      );
    }
    return (
      <>
        <Link className={navCls('home')} to="/">
          Home
        </Link>
        <Link className={navCls('categories')} to="/products">
          Categories
        </Link>
        <Link className={navCls('deals')} to="/products">
          Deals
        </Link>
      </>
    );
  };

  return (
    <header className="w-full bg-white dark:bg-slate-900 shadow-sm border-b border-slate-100 dark:border-slate-800 docked top-0 sticky z-50 font-['Plus_Jakarta_Sans'] antialiased">
      <div className="flex items-center justify-between gap-2 md:gap-4 w-full px-4 md:px-6 lg:px-10 xl:px-12 py-3">
        <div className="flex items-center gap-4 md:gap-8 min-w-0 shrink-0">
          <Link to="/" className="text-2xl font-black text-brand-frame dark:text-purple-300 shrink-0">
            Bazario
          </Link>
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 flex-wrap">{desktopNav()}</nav>
        </div>
        <div className="flex-1 min-w-0 mx-2 md:mx-4 lg:mx-8">
          <div className="relative flex items-center">
            <input
              className="w-full bg-surface-container-low border-none rounded-xl py-2 pl-10 pr-10 focus:ring-2 focus:ring-primary-container text-body-sm"
              placeholder="Search for products, brands and more"
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  runSearch();
                }
              }}
              aria-label="Search products"
            />
            <MaterialIcon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none"
            />
            <button
              type="button"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-on-surface-variant hover:bg-black/5 hover:text-primary"
              onClick={runSearch}
              aria-label="Run search"
            >
              <MaterialIcon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
          <button
            type="button"
            className="active:scale-95 transition-transform text-brand-neutral hover:text-brand-frame p-2 relative"
            onClick={() =>
              notify({
                type: 'info',
                title: 'Notifications',
                message: 'You have no new alerts. Order updates will appear here.',
              })
            }
            aria-label="Notifications"
          >
            <MaterialIcon name="notifications" className="text-[24px]" />
          </button>
          <button
            type="button"
            className="active:scale-95 transition-transform text-brand-neutral hover:text-brand-frame p-2 relative"
            onClick={() => navigate('/wishlist')}
            aria-label="Wishlist"
          >
            <MaterialIcon name="favorite" className="text-[24px]" />
            {wishCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-[10px] font-bold bg-rose-600 text-white rounded-full flex items-center justify-center px-1">
                {wishCount > 9 ? '9+' : wishCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className="active:scale-95 transition-transform text-brand-neutral hover:text-brand-frame p-2 relative"
            onClick={() => navigate('/cart')}
            aria-label="Cart"
          >
            <MaterialIcon name="shopping_cart" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-[10px] font-bold bg-primary-container text-white rounded-full flex items-center justify-center px-1">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
          <button
            type="button"
            className="active:scale-95 transition-transform text-brand-neutral hover:text-brand-frame p-2"
            onClick={() => navigate('/profile')}
            aria-label="Account"
          >
            <MaterialIcon name="account_circle" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ active = 'home' }) {
  const item = (key, icon, label, to) => (
    <Link
      key={key}
      to={to}
      className={`flex flex-col items-center justify-center px-1.5 sm:px-2 py-1.5 rounded-xl transition-all duration-150 active:scale-90 flex-1 min-w-0 max-w-[4.75rem] sm:max-w-[5.25rem] ${
        active === key ? 'text-white bg-white/10' : 'text-white/70 hover:bg-white/5'
      }`}
    >
      <MaterialIcon
        name={icon}
        filled={active === key && (key === 'profile' || key === 'wishlist')}
        className="text-[22px] sm:text-[24px]"
      />
      <span className="font-['Plus_Jakarta_Sans'] text-[9px] sm:text-[10px] font-semibold tracking-wide text-center leading-tight">
        {label}
      </span>
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 sm:px-4 py-3 pb-safe md:hidden bg-brand-frame dark:bg-slate-950 text-white dark:text-purple-200 border-t border-white/10 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] z-50 rounded-t-xl font-['Plus_Jakarta_Sans']">
      {item('home', 'home', 'Home', '/')}
      {item('categories', 'grid_view', 'Shop', '/products')}
      {item('wishlist', 'favorite', 'Saved', '/wishlist')}
      {item('cart', 'shopping_bag', 'Cart', '/cart')}
      {item('profile', 'person', 'Profile', '/profile')}
    </nav>
  );
}

export function ChatFab() {
  return (
    <button
      type="button"
      className="fixed bottom-52 right-4 sm:right-6 md:bottom-28 md:right-8 bg-primary-container text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform z-[999]"
      aria-label="Chat support"
    >
      <MaterialIcon name="chat" className="text-[24px] sm:text-[28px]" />
    </button>
  );
}

export default function Page({
  children,
  navActive = 'home',
  headerVariant = 'default',
  showBottomNav = true,
  showFab = true,
}) {
  const loc = useLocation();
  const hideChrome = loc.pathname === '/login' || loc.pathname === '/register';

  if (hideChrome) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col w-full bg-marketplace">
      <AppHeader navActive={navActive} headerVariant={headerVariant} />
      <div className="flex-1 w-full min-w-0">{children}</div>
      {showBottomNav && <BottomNav active={navActive} />}
      {showFab && <ChatFab />}
    </div>
  );
}
