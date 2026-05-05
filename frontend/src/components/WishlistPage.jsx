import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Page from '../layouts/Page';
import { MaterialIcon, useWishlist } from '../common/shared';
import { useNotify } from '../contexts/NotifyContext';
import { img } from '../utils/img';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { items, remove } = useWishlist();
  const { notify } = useNotify();

  return (
    <Page navActive="wishlist" headerVariant="listing">
      <main className="layout-main py-8 lg:py-12 pb-28 md:pb-16">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-h2 text-h2 text-on-surface">Wishlist</h1>
            <p className="text-body-sm text-on-surface-variant mt-1">{items.length} saved {items.length === 1 ? 'item' : 'items'}</p>
          </div>
          <Link to="/products" className="text-primary font-semibold text-sm hover:underline shrink-0">
            Continue shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center max-w-lg mx-auto">
            <MaterialIcon name="favorite" className="text-6xl text-primary/30 mx-auto mb-4" />
            <h2 className="font-h3 text-on-surface mb-2">Your wishlist is empty</h2>
            <p className="text-on-surface-variant text-body-sm mb-6">
              Tap the heart on any product to save it here for later.
            </p>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold"
            >
              Browse products
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
            {items.map((p) => (
              <li
                key={p.id}
                className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col sm:flex-row"
              >
                <button
                  type="button"
                  className="sm:w-40 h-40 sm:h-auto shrink-0 bg-surface-container-low"
                  onClick={() => navigate(`/product/${p.slug}`)}
                >
                  {p.image ? (
                    <img src={img(p.image)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline">
                      <MaterialIcon name="image" className="text-4xl" />
                    </div>
                  )}
                </button>
                <div className="p-4 flex-1 flex flex-col min-w-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/product/${p.slug}`)}
                    className="text-left font-h3 text-on-surface line-clamp-2 hover:text-primary"
                  >
                    {p.title}
                  </button>
                  <p className="text-body-sm text-outline mt-1">Sold by {p.vendor || 'Bazario'}</p>
                  <p className="font-price text-primary text-lg mt-2">₹{p.price.toLocaleString('en-IN')}</p>
                  <div className="mt-auto pt-4 flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        remove(p.id);
                        notify({ type: 'success', title: 'Removed', message: `${p.title} was removed from your wishlist.` });
                      }}
                      className="px-3 py-2 rounded-lg border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container-low"
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${p.slug}`)}
                      className="px-3 py-2 rounded-lg bg-primary text-white font-semibold text-sm"
                    >
                      View product
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </Page>
  );
}
