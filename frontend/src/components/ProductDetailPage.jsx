import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Page from '../layouts/Page';
import { MaterialIcon, useCart, WishlistHeartButton } from '../common/shared';
import { CERAMIC_PRODUCT, getProductBySlug } from '../data/catalog';
import { img } from '../utils/img';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const product = useMemo(() => getProductBySlug(slug || ''), [slug]);
  const isCeramic = product?.id === CERAMIC_PRODUCT.id;
  const [mainIdx, setMainIdx] = useState(0);

  const mainSrc = isCeramic ? product.gallery[mainIdx] : product?.image;
  const thumbs = isCeramic ? product.gallery.slice(0, 3) : [];

  if (!product) return null;

  if (!isCeramic) {
    return (
      <Page navActive="products" headerVariant="product">
        <main className="layout-main py-8 lg:py-12 pb-24 md:pb-12">
          <nav className="flex items-center gap-2 mb-8 text-label-md text-neutral-500 uppercase tracking-widest flex-wrap">
            <Link className="hover:text-primary" to="/">
              Home
            </Link>
            <MaterialIcon name="chevron_right" className="text-[12px]" />
            <Link className="hover:text-primary" to="/products">
              Shop
            </Link>
            <MaterialIcon name="chevron_right" className="text-[12px]" />
            <span className="text-on-surface-variant line-clamp-1">{product.title}</span>
          </nav>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-start">
            <div className="rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm relative">
              <img alt="" className="w-full aspect-square object-cover" src={img(product.image)} />
              <WishlistHeartButton
                product={product}
                className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur rounded-full shadow-md"
                iconClassName="text-[24px]"
              />
            </div>
            <div className="space-y-lg">
              <span className="text-label-md font-bold text-primary tracking-widest uppercase">{product.brand}</span>
              <h1 className="font-h1 text-h1 text-on-surface">{product.title}</h1>
              <p className="font-price text-3xl text-primary">₹{product.price.toLocaleString('en-IN')}</p>
              <p className="font-body-sm text-outline">
                Sold by <span className="font-semibold text-on-surface-variant">{product.vendor}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() =>
                    addItem({
                      id: product.id,
                      title: product.title,
                      price: product.price,
                      image: product.image,
                      vendor: product.vendor,
                    })
                  }
                  className="flex-1 bg-white border-2 border-[#40034F] text-[#40034F] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-container-low"
                >
                  <MaterialIcon name="shopping_bag" />
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addItem({
                      id: product.id,
                      title: product.title,
                      price: product.price,
                      image: product.image,
                      vendor: product.vendor,
                    });
                    navigate('/checkout');
                  }}
                  className="flex-1 bg-[#A951C5] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  <MaterialIcon name="bolt" filled />
                  Buy Now
                </button>
              </div>
              <Link to="/reviews" className="inline-flex items-center gap-2 text-primary font-h3">
                Write a review <MaterialIcon name="arrow_forward" />
              </Link>
            </div>
          </div>
        </main>
      </Page>
    );
  }

  const p = CERAMIC_PRODUCT;
  return (
    <Page navActive="products" headerVariant="product">
      <main className="layout-main py-8 lg:py-12 pb-24 md:pb-12">
        <nav className="flex items-center gap-2 mb-8 text-label-md text-neutral-500 uppercase tracking-widest flex-wrap">
          <Link className="hover:text-primary" to="/">
            Home
          </Link>
          <MaterialIcon name="chevron_right" className="text-[12px]" />
          <Link className="hover:text-primary" to="/products">
            Lifestyle
          </Link>
          <MaterialIcon name="chevron_right" className="text-[12px]" />
          <span className="text-on-surface-variant">Handcrafted Ceramic Tableware</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
          <div className="lg:col-span-7">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto hide-scrollbar">
                {thumbs.map((u, i) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setMainIdx(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer border-2 ${
                      mainIdx === i ? 'border-primary' : 'border-outline-variant hover:border-primary'
                    }`}
                  >
                    <img alt="" className="w-full h-full object-cover" src={img(u)} />
                  </button>
                ))}
              </div>
              <div className="order-1 md:order-2 flex-1 relative bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group">
                <img alt="" className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110" src={img(mainSrc)} />
                <WishlistHeartButton
                  product={p}
                  className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur rounded-full shadow-md"
                  iconClassName="text-[24px]"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-lg">
            <div className="flex flex-col gap-2">
              <span className="text-label-md font-bold text-primary tracking-widest uppercase">{p.brand}</span>
              <h1 className="font-h1 text-h1 text-on-surface">{p.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-lg text-label-md font-bold">
                  <span>4.8</span>
                  <MaterialIcon name="star" className="text-[14px]" filled />
                </div>
                <Link to="/reviews" className="text-body-sm text-on-surface-variant font-medium underline cursor-pointer">
                  1,248 Verified Ratings
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-price text-3xl text-on-surface">₹{p.price.toLocaleString('en-IN')}</span>
                <span className="text-body-md text-on-surface-variant line-through">₹{p.wasPrice.toLocaleString('en-IN')}</span>
                <span className="text-body-md font-bold text-green-600">30% OFF</span>
              </div>
              <span className="text-body-sm text-on-surface-variant">Inclusive of all taxes</span>
            </div>
            <div className="bg-surface-container p-md rounded-xl flex items-center justify-between border border-outline-variant/30">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <MaterialIcon name="storefront" />
                </div>
                <div className="min-w-0">
                  <p className="text-body-sm font-semibold text-on-surface truncate">Sold by {p.vendor}</p>
                  <p className="text-label-md text-on-surface-variant">Top Rated Vendor • 98% Positive Feedback</p>
                </div>
              </div>
              <MaterialIcon name="chevron_right" className="text-on-surface-variant shrink-0" />
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-h3 text-h3">Product Description</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{p.description}</p>
              <ul className="flex flex-col gap-2">
                {[
                  'Set of 6 (Plates, Bowls, Mugs)',
                  'Microwave and Dishwasher Safe',
                  'Lead-free, Non-toxic food safe glaze',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-body-sm text-on-surface-variant">
                    <MaterialIcon name="verified" className="text-primary text-[18px]" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                type="button"
                onClick={() =>
                  addItem({
                    id: p.id,
                    title: p.title,
                    price: p.price,
                    image: p.gallery[0],
                    vendor: p.vendor,
                  })
                }
                className="flex-1 bg-white border-2 border-[#40034F] text-[#40034F] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors active:scale-95 duration-150"
              >
                <MaterialIcon name="shopping_bag" />
                Add to Cart
              </button>
              <button
                type="button"
                onClick={() => {
                  addItem({
                    id: p.id,
                    title: p.title,
                    price: p.price,
                    image: p.gallery[0],
                    vendor: p.vendor,
                  });
                  navigate('/checkout');
                }}
                className="flex-1 bg-[#A951C5] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-primary/20 active:scale-95 duration-150"
              >
                <MaterialIcon name="bolt" filled />
                Buy Now
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/30">
              <div className="flex items-center gap-3">
                <MaterialIcon name="local_shipping" className="text-on-surface-variant" />
                <span className="text-label-md font-medium">Free Express Delivery</span>
              </div>
              <div className="flex items-center gap-3">
                <MaterialIcon name="replay" className="text-on-surface-variant" />
                <span className="text-label-md font-medium">7-Day Easy Return</span>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-xl">
              <img alt="" className="w-full h-full object-cover" src={img(p.craftStory)} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 md:p-8">
                <h2 className="text-white font-h2 text-h2 mb-2">The Heart of Craft</h2>
                <p className="text-white/80 text-body-sm">Supporting over 500 local families through sustainable artisan partnerships.</p>
              </div>
            </div>
            <div className="flex flex-col gap-md lg:pl-12">
              <div className="w-12 h-1 bg-primary mb-2" />
              <h2 className="font-h1 text-h1">Quality You Can Feel</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Every Bazario product undergoes a multi-step quality check to ensure it meets our heritage standards.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20">
                  <p className="text-2xl font-bold text-primary">100%</p>
                  <p className="text-label-md text-on-surface-variant uppercase">Authentic</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20">
                  <p className="text-2xl font-bold text-primary">Local</p>
                  <p className="text-label-md text-on-surface-variant uppercase">Sourcing</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h2 className="font-h2 text-h2">Customer Experiences</h2>
              <p className="text-on-surface-variant text-body-md">What owners are saying about this collection</p>
            </div>
            <Link
              to="/reviews"
              className="bg-surface-container-high px-6 py-2 rounded-full text-label-md font-bold uppercase tracking-widest hover:bg-primary-container hover:text-white transition-all text-center"
            >
              Write a Review
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'The glaze is even more beautiful in person.',
              'Feels heavy and premium. Packaging was perfect.',
              'Great for gifting — arrived in 2 days.',
            ].map((text) => (
              <div key={text} className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                    <div>
                      <p className="font-bold text-body-sm">Verified Buyer</p>
                      <p className="text-label-md text-green-600 font-bold">Verified Buyer</p>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <MaterialIcon key={i} name="star" className="text-sm" filled />
                    ))}
                  </div>
                </div>
                <p className="text-body-sm text-on-surface-variant italic">&quot;{text}&quot;</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 mb-12">
          <h2 className="font-h2 text-on-surface mb-lg">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {p.related.map((r) => (
              <div key={r.title} className="bg-white rounded-xl overflow-hidden border border-slate-100 group cursor-pointer hover:shadow-md">
                <div className="aspect-square overflow-hidden bg-surface-container-low">
                  <img alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={img(r.image)} />
                </div>
                <div className="p-md">
                  <h4 className="font-h3 text-body-md line-clamp-1">{r.title}</h4>
                  <p className="text-primary font-bold mt-2">From ₹899</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </Page>
  );
}
