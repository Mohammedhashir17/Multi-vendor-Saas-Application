import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Page from '../layouts/Page';
import { MaterialIcon, useCart, WishlistHeartButton } from '../common/shared';
import { PRODUCTS } from '../data/catalog';
import { img } from '../utils/img';
import BackendService from '../services/backend-service';

const api = new BackendService();

function mapApiProduct(p) {
  const id = p.id || p._id;
  const imgUrl = Array.isArray(p.images) && p.images.length ? p.images[0] : '';
  return {
    id: String(id),
    slug: p.slug || String(id),
    title: p.title || 'Product',
    price: Number(p.price) || 0,
    vendor: p.shopName || 'Bazario seller',
    image: imgUrl,
    _fromApi: true,
  };
}

export default function ProductListingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const q = (searchParams.get('q') || '').trim();
  const { addItem } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usedApi, setUsedApi] = useState(false);

  const filterLocal = useCallback(
    (query) => {
      if (!query) return PRODUCTS;
      const low = query.toLowerCase();
      return PRODUCTS.filter(
        (p) => p.title.toLowerCase().includes(low) || (p.vendor && p.vendor.toLowerCase().includes(low))
      );
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.getProducts({ q: q || undefined, limit: 48 });
        const payload = res.data?.data ?? res.data;
        const raw = payload?.products;
        if (!cancelled && Array.isArray(raw) && raw.length >= 0) {
          const mapped = raw.map(mapApiProduct);
          setItems(mapped);
          setUsedApi(true);
        }
      } catch {
        if (!cancelled) {
          setItems(filterLocal(q));
          setUsedApi(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [q, filterLocal]);

  const heading = q ? `Search results for “${q}”` : 'Products';
  const subtitle =
    usedApi && !loading ? `${items.length} items` : !usedApi && !loading ? `${items.length} items (offline list)` : '';

  return (
    <Page navActive="categories" headerVariant="listing">
      <main className="layout-main py-xl pb-28 md:pb-16">
        <div className="flex flex-col lg:flex-row gap-lg">
          <aside className="w-full lg:w-64 space-y-lg shrink-0">
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center justify-between mb-md">
                <h3 className="font-h3 text-h3">Filters</h3>
                <button type="button" className="text-primary text-label-md font-bold uppercase">
                  CLEAR ALL
                </button>
              </div>
              <div className="mb-xl">
                <p className="font-label-md text-label-md text-on-surface-variant mb-md uppercase tracking-widest">CATEGORY</p>
                <div className="space-y-sm">
                  {['Electronics', 'Fashion', 'Home & Kitchen', 'Personal Care'].map((c, i) => (
                    <label key={c} className="flex items-center space-x-3 cursor-pointer">
                      <input defaultChecked={i === 0} className="rounded border-outline text-primary focus:ring-primary-container" type="checkbox" />
                      <span className="text-body-sm font-medium">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                Tip: use the search box above — results update from the catalog API when <code className="text-xs">REACT_APP_API_URL</code> is
                set.
              </p>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-lg gap-md bg-surface-container-low p-md rounded-xl">
              <div>
                <h2 className="font-h2 text-h2">
                  {heading}{' '}
                  {!loading && subtitle ? (
                    <span className="text-body-sm font-normal text-on-surface-variant ml-2">({subtitle})</span>
                  ) : null}
                </h2>
                {q ? (
                  <Link className="text-sm text-primary font-semibold mt-1 inline-block hover:underline" to="/products">
                    Clear search
                  </Link>
                ) : null}
              </div>
              <div className="flex items-center space-x-md">
                <span className="text-label-md text-on-surface-variant font-bold uppercase">SORT BY</span>
                <select className="bg-transparent border-none text-body-sm font-semibold focus:ring-0 cursor-pointer max-w-[180px]">
                  <option>Popularity</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest Arrivals</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-on-surface-variant">
                <MaterialIcon name="sync" className="text-4xl animate-spin" />
                <span className="text-body-sm">Loading products…</span>
              </div>
            ) : items.length === 0 ? (
              <div className="bg-surface-container-low rounded-xl p-8 text-center text-on-surface-variant">
                <p className="font-h3 text-on-surface mb-2">No products found</p>
                <p className="text-body-sm mb-4">Try another keyword or browse all products.</p>
                <Link to="/products" className="text-primary font-bold hover:underline">
                  View all products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
                {items.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-slate-100 group cursor-pointer hover:shadow-md transition-all"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/product/${p.slug}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/product/${p.slug}`)}
                  >
                    <div className="relative h-52 sm:h-56 overflow-hidden bg-slate-100">
                      {p.image ? (
                        <img
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          src={img(p.image)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-outline">
                          <MaterialIcon name="image" className="text-5xl" />
                        </div>
                      )}
                      <WishlistHeartButton
                        product={p}
                        className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white"
                        iconClassName="text-[20px]"
                      />
                    </div>
                    <div className="p-md flex flex-col flex-grow">
                      <div className="mb-2">
                        <h3 className="font-h3 text-h3 text-on-surface line-clamp-2">{p.title}</h3>
                        <p className="text-body-sm text-outline mt-1">Sold by {p.vendor}</p>
                      </div>
                      <div className="mt-auto pt-md flex items-center justify-between border-t border-slate-100">
                        <span className="font-price text-primary text-lg">₹{p.price.toLocaleString('en-IN')}</span>
                        <button
                          type="button"
                          className="bg-primary text-white px-md py-sm rounded-lg text-label-md font-bold uppercase tracking-wide"
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem({
                              id: p.id,
                              title: p.title,
                              price: p.price,
                              image: p.image || PRODUCTS[0]?.image,
                              vendor: p.vendor,
                            });
                          }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </Page>
  );
}
