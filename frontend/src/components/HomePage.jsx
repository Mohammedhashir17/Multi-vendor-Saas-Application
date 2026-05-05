import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Page from '../layouts/Page';
import { MaterialIcon, useCart, WishlistHeartButton } from '../common/shared';
import { PRODUCTS } from '../data/catalog';
import { img } from '../utils/img';

const HERO =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA54wMcUyVHKnTOmXPQqHiL4SmBktdp6A5ubq4aNxFXj3dO8Nws6zVICgFprkbsDW6CZjtjyLxAQdJSmPUlxlP4yrMLWvUpApvn4H4k-FVvv59LmgdVjAgZYSfb7cSDvMeNHXinMPuQGtac6PjniboGv-_qNqm6mJg9Za-LpFCgDdhgDzntJFScDPUQJw0ZQCBEyeu154lrqnt381ipp4XChfaypPuJIlUS2k-FumyCYg4M-WtD2MqTktA_JjLZcMIHH1KhZ0d116c';

const TREND_HERO =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBKumPkH-BGsyv8A8JWJrfYC819lDS9y5_CbqJnesP6XuIcTiOV9vtyz5CrAoW9cMlEUJ1ycwbQjfR56UWhP7IO-OVkNzd4dSD6HD4N3zNpm7ZzR2MvSK6-uK1ES9ISBGGUmqDhfuKjUct0xNLoGqpLnu-NPo-zsxlqafVaeG3lshbyY3nwFnsIWjeJFUhABjiJ5QFzBj0DAlrKwY57DoF1C2H_Kx9bg2ZQIcFDo9eIA8xBheTM6jgaEMYDX_3LzhD9cNpaxQUqlGY';

const AV1 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAeYBEQbE6cx6uQKei4904nI_e9Or--x0IO-hz8LQikJOkghvC6xE1kL4LHehby8PWkqceLx_4LDRxkO5_KQRry1uBCP9EwPvOxPDf_O3_IxlvPHu_O4EMNwS7IT1LCOUgV1zZsxyIc01Fbrc1_VXGfjyEbDyL5Ba8i3rviOvIf5cOcifbWMwrLzH0hvqUS5tu5ShD8D0SBYXfNuKxuClGJSOVBhMpxepl18z9eAseLZX6F762KdI6iI97j_9v76-KPetT9uKaWfJc';
const AV2 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDt9FCGy2lOUD-fgIrYZjQbtYHZ1vd22eORx0AU_znvG5kTiR8QPt2Wo6uIR45j-TACu4_FuX7GAhvnma_LbJ7J8ZL8a61BwO8P7-m7EVNWrS_Tf8iACoPFs1qU2gp4GiDCV-Vq8X73jn2e9ZxFpHCzCp-laNfGPL2ZEKqIl91NG5OCa9Do8BEc0smOJ_kQEn2pRadsUQE_0wLjFsI7Vnh6YL_gAPlZTlYM7hgENF-tP9uYGzyFQu4i5i_EL3KtN0alCyyYr3B2R-I';
const AV3 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDanhgYE1Lz8c2ahLMgJgjRSNR3teqD3fd7JYgqAXKR4-S5I2f8ewdQYoBofw4Sdm2yFUj7MZRwV5Pqas1UXHe5BQ9xBilIN-Bw6fB4DBjy2CIwBBO4YMfOO71kyPHL2o6FDsAAnZp_82dhWKsYTs5o5LhGs3Z_xsrrkWXRq5hpMuphd6kr_77wtzplBFSpcSQrYwy3uwHOF5Q2lTGPxSutRFI5oprNXu-JuFO73nU5yurkV91kG4ijEv1He0yEn7ArJKFS0kOweu0';

export default function HomePage() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const featured = PRODUCTS.slice(0, 4);

  return (
    <Page navActive="home" headerVariant="default">
      <main className="w-full pb-24 md:pb-12">
        <section className="w-full">
          <div className="relative h-[240px] sm:h-[320px] md:h-[420px] w-full overflow-hidden shadow-sm md:shadow-md group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#40034F]/90 to-transparent z-10" />
            <img
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              src={img(HERO)}
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-4 md:px-6 lg:px-10 xl:px-16 text-white">
              <div className="max-w-2xl">
              <span className="font-label-md text-tertiary-fixed tracking-widest uppercase mb-sm">Exclusive Launch</span>
              <h1 className="font-h1 text-white max-w-lg mb-md text-[clamp(1.5rem,4vw,2rem)] leading-tight">
                Elevate Your Lifestyle with Bazario
              </h1>
              <p className="font-body-lg text-white/80 max-w-md mb-lg hidden md:block">
                Experience the best of Indian retail with handpicked collections from verified vendors across the country.
              </p>
              <div>
                <button
                  type="button"
                  className="bg-primary-container text-white px-6 md:px-8 py-3 rounded-lg font-h3 active:scale-95 transition-transform"
                  onClick={() => navigate('/products')}
                >
                  Shop Now
                </button>
              </div>
              </div>
            </div>
          </div>
        </section>

        <div className="layout-main space-y-0">
        <section className="mt-xl">
          <div className="flex items-center justify-between mb-md gap-2">
            <h2 className="font-h2 text-on-surface">Shop by Category</h2>
            <Link className="text-primary font-label-md hover:underline shrink-0" to="/products">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: 'devices', label: 'Electronics', tint: 'bg-secondary-container/20', ic: 'text-primary' },
              { icon: 'checkroom', label: 'Fashion', tint: 'bg-tertiary-container/20', ic: 'text-tertiary' },
              { icon: 'chair', label: 'Home Decor', tint: 'bg-primary-container/10', ic: 'text-primary' },
              { icon: 'spa', label: 'Beauty', tint: 'bg-secondary-container/20', ic: 'text-on-secondary-container' },
            ].map((c) => (
              <Link
                key={c.label}
                to="/products"
                className={`${c.tint} p-md rounded-xl flex flex-col items-center justify-center hover:shadow-md transition-shadow group cursor-pointer`}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mb-sm group-hover:scale-110 transition-transform">
                  <MaterialIcon name={c.icon} className={`${c.ic} text-[28px] sm:text-[32px]`} />
                </div>
                <span className="font-h3 text-on-surface text-center text-sm sm:text-base">{c.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-md gap-3">
            <h2 className="font-h2 text-on-surface">Featured Products</h2>
            <div className="flex gap-2 self-end sm:self-auto">
              <button type="button" className="p-2 rounded-full border border-outline hover:bg-surface-container transition-colors">
                <MaterialIcon name="chevron_left" />
              </button>
              <button type="button" className="p-2 rounded-full border border-outline hover:bg-surface-container transition-colors">
                <MaterialIcon name="chevron_right" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter">
            {featured.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/product/${p.slug}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/product/${p.slug}`)}
              >
                <div className="relative aspect-square overflow-hidden bg-surface-container-lowest border-b border-slate-100">
                  <img alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={img(p.image)} />
                  <WishlistHeartButton
                    product={p}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors"
                    iconClassName="text-[20px]"
                  />
                </div>
                <div className="p-md">
                  <span className="font-label-md text-on-surface-variant block mb-1">{p.brand}</span>
                  <h3 className="font-h3 text-on-surface mb-2 line-clamp-2 min-h-[2.5rem]">{p.title}</h3>
                  <div className="flex items-center gap-1 mb-md text-[#EAB308]">
                    <MaterialIcon name="star" className="text-[16px]" filled />
                    <span className="font-label-md text-on-surface">{p.rating}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-price text-primary whitespace-nowrap">₹{p.price.toLocaleString('en-IN')}</span>
                    <button
                      type="button"
                      className="bg-primary-container text-white p-2 rounded-lg active:scale-90 transition-transform shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem({ id: p.id, title: p.title, price: p.price, image: p.image, vendor: p.vendor });
                      }}
                    >
                      <MaterialIcon name="add_shopping_cart" />
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-50">
                    <p className="font-body-sm text-outline">
                      Sold by <span className="font-semibold text-on-surface-variant">{p.vendor}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-xl w-full -mx-4 md:-mx-6 lg:-mx-10 xl:-mx-12 px-4 md:px-6 lg:px-10 xl:px-12 py-10 md:py-12 bg-[#40034F] flex flex-col md:flex-row items-center justify-between gap-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full -ml-24 -mb-24 blur-2xl pointer-events-none" />
            <div className="relative z-10 text-center md:text-left">
              <h2 className="font-h1 text-white mb-sm text-[clamp(1.5rem,3vw,2rem)]">Become a Bazario Seller</h2>
              <p className="font-body-lg text-white/70 max-w-lg">
                Join 10,000+ vendors and reach millions of customers across India. Start your business journey today.
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
              <Link
                to="/register"
                className="bg-white text-[#40034F] font-h3 px-6 sm:px-8 py-3 rounded-lg hover:bg-slate-100 transition-colors text-center"
              >
                Register Now
              </Link>
              <button type="button" className="border border-white/30 text-white font-h3 px-6 sm:px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
                Learn More
              </button>
            </div>
        </section>

        <section className="mt-xl mb-12">
          <h2 className="font-h2 text-on-surface mb-lg">Trending This Week</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="md:col-span-8 bg-white rounded-2xl p-md shadow-sm border border-slate-100 group cursor-pointer overflow-hidden">
              <div className="flex flex-col md:flex-row h-full gap-md">
                <div className="flex-1 space-y-4">
                  <span className="bg-tertiary-container/20 text-on-tertiary-container px-3 py-1 rounded-full font-label-md">
                    Curated Selection
                  </span>
                  <h3 className="font-h1 text-on-surface text-[clamp(1.25rem,3vw,2rem)]">The Sustainable Home Collection</h3>
                  <p className="font-body-md text-on-surface-variant">
                    Ethically sourced, eco-friendly essentials for a mindful lifestyle. Discover artisanal crafts that make a difference.
                  </p>
                  <button
                    type="button"
                    className="text-primary font-h3 flex items-center gap-2 group-hover:gap-4 transition-all"
                    onClick={() => navigate('/product/handcrafted-azure-ceramic-dinner-set')}
                  >
                    Explore Collection <MaterialIcon name="arrow_forward" />
                  </button>
                </div>
                <div className="md:w-1/2 aspect-video md:aspect-square rounded-xl overflow-hidden min-h-[180px]">
                  <img alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={img(TREND_HERO)} />
                </div>
              </div>
            </div>
            <div className="md:col-span-4 space-y-gutter flex flex-col gap-gutter">
              <div className="bg-primary-container p-md rounded-2xl text-white flex-1 min-h-[140px] flex flex-col justify-between group cursor-pointer">
                <h4 className="font-h2">Super Saver Sundays</h4>
                <div className="flex items-end justify-between">
                  <span className="font-h1 text-[clamp(1.5rem,4vw,2rem)]">UP TO 60% OFF</span>
                  <MaterialIcon name="percent" className="text-[40px] sm:text-[48px] opacity-20" />
                </div>
              </div>
              <div className="bg-surface-container p-md rounded-2xl flex-1 min-h-[140px] flex flex-col justify-between group cursor-pointer border border-primary/10">
                <h4 className="font-h3 text-on-surface">New Arrivals in Tech</h4>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-3 sm:-space-x-4">
                    {[AV1, AV2, AV3].map((u) => (
                      <div key={u.slice(-20)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                        <img alt="" className="w-full h-full object-cover" src={img(u)} />
                      </div>
                    ))}
                  </div>
                  <MaterialIcon name="arrow_circle_right" className="text-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>
      </main>
    </Page>
  );
}
