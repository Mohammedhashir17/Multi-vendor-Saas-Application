import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export function MaterialIcon({ name, className = '', style, filled }) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? 'fill' : ''} ${className}`.trim()}
      style={style}
      aria-hidden
    >
      {name}
    </span>
  );
}

export function PasswordField({ className = '', inputClassName = '', ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`group relative ${className}`.trim()}>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`${inputClassName} pr-12`.trim()}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-on-surface-variant opacity-0 pointer-events-none transition-all group-hover:opacity-100 group-hover:pointer-events-auto hover:text-primary"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        <MaterialIcon name={visible ? 'visibility' : 'visibility_off'} className="text-[20px]" />
      </button>
    </div>
  );
}

/** Normalize product-like objects for wishlist storage. */
export function toWishlistItem(p) {
  if (!p) return null;
  const image =
    p.image ||
    (Array.isArray(p.images) ? p.images[0] : '') ||
    (Array.isArray(p.gallery) ? p.gallery[0] : '') ||
    '';
  return {
    id: String(p.id ?? p._id ?? ''),
    slug: p.slug || String(p.id ?? ''),
    title: p.title || 'Product',
    price: Number(p.price) || 0,
    image,
    vendor: p.vendor || p.shopName || '',
  };
}

const WishlistState = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('baz_wishlist');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const persist = useCallback((next) => {
    setItems(next);
    localStorage.setItem('baz_wishlist', JSON.stringify(next));
  }, []);

  const add = useCallback(
    (product) => {
      const row = toWishlistItem(product);
      if (!row.id) return;
      if (items.some((i) => i.id === row.id)) return;
      persist([...items, row]);
    },
    [items, persist]
  );

  const remove = useCallback(
    (id) => {
      const key = String(id);
      persist(items.filter((i) => i.id !== key));
    },
    [items, persist]
  );

  const toggle = useCallback(
    (product) => {
      const row = toWishlistItem(product);
      if (!row.id) return;
      if (items.some((i) => i.id === row.id)) {
        persist(items.filter((i) => i.id !== row.id));
      } else {
        persist([...items, row]);
      }
    },
    [items, persist]
  );

  const has = useCallback((id) => items.some((i) => i.id === String(id)), [items]);

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo(
    () => ({
      items,
      add,
      remove,
      toggle,
      has,
      clear,
      count: items.length,
    }),
    [items, add, remove, toggle, has, clear]
  );

  return <WishlistState.Provider value={value}>{children}</WishlistState.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistState);
  if (!ctx) throw new Error('useWishlist requires WishlistProvider');
  return ctx;
}

/** Heart control for product cards / detail (filled when saved). */
export function WishlistHeartButton({ product, className = '', iconClassName = '', stopPropagation = true }) {
  const { toggle, has } = useWishlist();
  const row = toWishlistItem(product);
  const saved = row?.id ? has(row.id) : false;
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      className={className}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        if (row?.id) toggle(product);
      }}
    >
      <MaterialIcon
        name="favorite"
        filled={saved}
        className={`${saved ? 'text-rose-600' : 'text-primary'} ${iconClassName}`.trim()}
      />
    </button>
  );
}

const CartState = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('baz_cart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const persist = useCallback((next) => {
    setItems(next);
    localStorage.setItem('baz_cart', JSON.stringify(next));
  }, []);

  const addItem = useCallback(
    (product) => {
      const existing = items.find((i) => i.id === product.id);
      if (existing) {
        persist(
          items.map((i) =>
            i.id === product.id ? { ...i, qty: (i.qty || 1) + (product.qty || 1) } : i
          )
        );
      } else {
        persist([...items, { ...product, qty: product.qty || 1 }]);
      }
    },
    [items, persist]
  );

  const updateQty = useCallback(
    (id, qty) => {
      if (qty < 1) persist(items.filter((i) => i.id !== id));
      else persist(items.map((i) => (i.id === id ? { ...i, qty } : i)));
    },
    [items, persist]
  );

  const removeItem = useCallback(
    (id) => {
      persist(items.filter((i) => i.id !== id));
    },
    [items, persist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQty,
      removeItem,
      clear,
      count: items.reduce((s, i) => s + (i.qty || 1), 0),
      subtotal: items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0),
    }),
    [items, addItem, updateQty, removeItem, clear]
  );

  return <CartState.Provider value={value}>{children}</CartState.Provider>;
}

export function useCart() {
  const ctx = useContext(CartState);
  if (!ctx) throw new Error('useCart requires CartProvider');
  return ctx;
}
