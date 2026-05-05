import React from 'react';
import { Link } from 'react-router-dom';
import Page from '../layouts/Page';
import { MaterialIcon } from '../common/shared';
import { img } from '../utils/img';

const FORM_PRODUCT =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBys6KwRiYxDCPwvOUvKe0pSwu1Pc4gf1EbX_bxCQg49oGQOsFveQlBrOsrLxHqzyBkg9PalSUvwbyY8UK-VrkG874QeUaiiHJwgT-XpJYx96c_A47mdx0o7jAnnY5LZEYWatOumkWOgRWYKH8Q6jEbq5m7YOGxzufpFoX_d1blja_slOd62ftGGpqsi4QYbF_Cpll9PdeUFMSKJqgIVR85o6hBOLATP0-A6mEcJDQvLaVq1HcX9zoyPDfkqM6gHm7jtYa7LZjpyqM';
const UPLOAD_PREVIEW =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB1aSwr-tBVW1___SG04SrYSaWZZalUP8zRkr-YY3GDVSBOHTRpoQF6IXxmX95X8tSnaZD6TfhGcwB7QpoRGVvJbiwLr_qnKZJsbk2zhvjVqpNX8wjzswGmfCpkIeIIOuCht7eC-7ElGPIpN6naSfCRsotiM9JxWtlNQfFJ32ODwqZgApqW8qNF-g8emcSLK-5EsY4eToaEkdsj-y4QQTEj0NR8e9qfmpOgk6UjCC-fMUE7EZmivbx_vHGc8ZVPTwYMgVYmb_yFKb0';
const PREV_WATCH =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCETe2Cot9Ztc9y5VW1afP0ymW3RCDtM1YsxIPeZf5kK7j9Q98v9zudkg2u4P1qVlOlWWzaY8VGcyzO9MZfonEoYEH9nma0E5WY5OvIhT0ebWxohPDEuoDGbKFWOwmYRyCN_hofoANZ7bTmjxhokgdpuUFGsybGzyVnRXPlYSkOrFlgQAH22LmQpphTkaCPM92okvwv5q5Y3sujgS4PtxZeHUwKwlNLIzD4iJujLVlPk6UVOclLcnNZYfvGf_SQ0Lvjb3yZeGsA32I';
const PREV_SHOE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAxXbpXYrsAo2xp7c4idWaYttvcFCP3FFrtGqXqjchttbr8OXdG-epdniJOnTj6nxUuFQ8y9uAugNJaEq6s4cMJK5GmLjqfI3eplbmCgCbzdQvS77AF-iFrhzbjUkli6H3hq2X0nVtD7ppcQFW8AJGzY5RRq511YZrIE3bV-w05w1EHhDKcMtLDxFEVr9zh0b1lUJnKi3qrQGXnhsFLTeMKdh7xyzfwj7AHIQeVmIzDFNlXzqDEJUybbQxHZs3dYLm2Yt3kW-Zl5U0';
const PREV_CAM =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAPFulevPdFNGwFtDmEhZ0Vvj_DYRICv2Own5fmuhVXbuOUdJXiJgP6_ziyaBUj6st8Uh7bYQ032q2WvLf32tliTHA2BdCcgolUvdUXbmLsDAp_BoLnLttq7vghnR5NwadnEis-aL8yRcBcbkjPq5NTarBENfw3k-I1d8XSGowt9ER0DK-Qz6n_lleOROe-32STvia_j-9NBuw1aK-2UkwYf7Xggvy4uUsYp2EbXQh4oJJCx37W7-hlx2oZd6FzxrXIiRFUfmEVBec';

export default function ReviewsPage() {
  return (
    <Page navActive="profile" headerVariant="profile">
      <main className="layout-main py-lg md:py-xl pb-24 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          <section className="lg:col-span-5 space-y-lg">
            <div className="bg-white rounded-xl shadow-sm p-md md:p-lg border border-slate-100">
              <h1 className="font-h1 text-h1 text-on-surface mb-xs">Rate your purchase</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-lg">Your feedback helps millions of shoppers on Bazario.</p>
              <div className="flex items-center gap-md p-md bg-surface-container-low rounded-lg mb-lg border border-outline-variant/30">
                <div className="w-16 h-16 bg-white rounded-md flex-shrink-0 overflow-hidden border border-slate-100">
                  <img alt="" className="w-full h-full object-cover" src={img(FORM_PRODUCT)} />
                </div>
                <div>
                  <p className="font-h3 text-body-md text-on-surface">Premium Wireless Headphones</p>
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Sold by: TechFlow India</p>
                </div>
              </div>
              <form className="space-y-lg" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-sm">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Overall Rating</span>
                  <div className="flex gap-xs flex-wrap">
                    {[1, 2, 3, 4].map((i) => (
                      <button key={i} type="button" className="text-primary hover:scale-110 transition-transform">
                        <MaterialIcon name="star" className="text-4xl" filled />
                      </button>
                    ))}
                    <button type="button" className="text-outline hover:scale-110 transition-transform">
                      <MaterialIcon name="star" className="text-4xl" />
                    </button>
                  </div>
                </div>
                <div className="space-y-sm">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Review Details</label>
                  <textarea
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-md font-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline"
                    placeholder="What did you like or dislike? How was the delivery?"
                    rows={4}
                  />
                </div>
                <div className="space-y-sm">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Add Photos</span>
                  <div className="grid grid-cols-4 gap-sm">
                    <button
                      type="button"
                      className="aspect-square rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-outline hover:border-primary hover:text-primary transition-all bg-surface-container-low group min-h-[64px]"
                    >
                      <MaterialIcon name="add_a_photo" className="text-2xl group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="aspect-square rounded-xl overflow-hidden relative group min-h-[64px]">
                      <img alt="" className="w-full h-full object-cover" src={img(UPLOAD_PREVIEW)} />
                      <button type="button" className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MaterialIcon name="close" className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#A951C5] text-white font-h3 py-md rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all">
                  Submit Review
                </button>
              </form>
            </div>
            <div className="bg-primary-fixed-dim/20 rounded-xl p-md border border-primary/10 flex gap-md items-start">
              <MaterialIcon name="info" className="text-primary" />
              <div>
                <p className="font-h3 text-body-sm text-primary mb-1">Review Tips</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Focus on product features, durability, and your actual usage experience. Keep it respectful!
                </p>
              </div>
            </div>
          </section>
          <section className="lg:col-span-7 space-y-lg min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-h2 text-h2 text-on-surface">Your Previous Reviews</h2>
              <span className="bg-secondary-container/30 text-on-secondary-container px-md py-xs rounded-full text-label-md font-semibold font-label-md">Total: 12</span>
            </div>
            <div className="space-y-md">
              <article className="bg-white rounded-xl p-md md:p-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-md gap-2 flex-wrap">
                  <div className="flex gap-md items-center min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low overflow-hidden border border-slate-100 flex-shrink-0">
                      <img alt="" className="w-full h-full object-cover" src={img(PREV_WATCH)} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-h3 text-body-md text-on-surface">Smart Watch Series X</h4>
                      <p className="font-body-sm text-label-md text-on-surface-variant">Reviewed on 12 Oct, 2023</p>
                    </div>
                  </div>
                  <div className="flex gap-xs">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <MaterialIcon key={i} name="star" className="text-lg text-amber-400" filled />
                    ))}
                  </div>
                </div>
                <p className="font-body-md text-on-surface mb-md">
                  &quot;Absolutely stunning display and the battery life is surprisingly good for this price point.&quot;
                </p>
                <div className="flex flex-wrap items-center gap-lg pt-md border-t border-slate-50">
                  <button type="button" className="flex items-center gap-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">
                    <MaterialIcon name="thumb_up" className="text-base" /> 24 Helpful
                  </button>
                  <button type="button" className="flex items-center gap-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">
                    <MaterialIcon name="edit" className="text-base" /> Edit
                  </button>
                  <div className="ml-auto flex items-center gap-xs font-label-md text-label-md text-primary">
                    <MaterialIcon name="verified" className="text-base" /> Verified Purchase
                  </div>
                </div>
              </article>
              <article className="bg-white rounded-xl p-md md:p-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-md gap-2 flex-wrap">
                  <div className="flex gap-md items-center">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low overflow-hidden border border-slate-100 flex-shrink-0">
                      <img alt="" className="w-full h-full object-cover" src={img(PREV_SHOE)} />
                    </div>
                    <div>
                      <h4 className="font-h3 text-body-md text-on-surface">CloudRunner Sports Shoes</h4>
                      <p className="font-body-sm text-label-md text-on-surface-variant">Reviewed on 05 Sep, 2023</p>
                    </div>
                  </div>
                  <div className="flex gap-xs">
                    {[1, 2, 3].map((i) => (
                      <MaterialIcon key={i} name="star" className="text-lg text-amber-400" filled />
                    ))}
                    {[1, 2].map((i) => (
                      <MaterialIcon key={`e${i}`} name="star" className="text-lg text-outline" />
                    ))}
                  </div>
                </div>
                <p className="font-body-md text-on-surface mb-md">&quot;The grip is excellent but the sizing is a bit smaller than expected.&quot;</p>
                <div className="flex flex-wrap items-center gap-lg pt-md border-t border-slate-50">
                  <button type="button" className="flex items-center gap-xs font-label-md text-on-surface-variant hover:text-primary transition-colors">
                    <MaterialIcon name="thumb_up" className="text-base" /> 15 Helpful
                  </button>
                  <button type="button" className="flex items-center gap-xs font-label-md text-on-surface-variant hover:text-primary transition-colors">
                    <MaterialIcon name="edit" className="text-base" /> Edit
                  </button>
                  <div className="ml-auto flex items-center gap-xs font-label-md text-primary">
                    <MaterialIcon name="verified" className="text-base" /> Verified Purchase
                  </div>
                </div>
              </article>
              <article className="bg-white rounded-xl p-md md:p-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-md gap-2 flex-wrap">
                  <div className="flex gap-md items-center">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low overflow-hidden border border-slate-100 flex-shrink-0">
                      <img alt="" className="w-full h-full object-cover" src={img(PREV_CAM)} />
                    </div>
                    <div>
                      <h4 className="font-h3 text-body-md text-on-surface">Lumina X100 Camera</h4>
                      <p className="font-body-sm text-label-md text-on-surface-variant">Reviewed on 21 Aug, 2023</p>
                    </div>
                  </div>
                  <div className="flex text-primary">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <MaterialIcon key={i} name="star" className="text-lg text-amber-400" filled />
                    ))}
                  </div>
                </div>
                <p className="font-body-md text-on-surface mb-md">&quot;Best camera for travel vlogging, period. Autofocus is snappy.&quot;</p>
                <div className="flex flex-wrap items-center gap-lg pt-md border-t border-slate-50">
                  <button type="button" className="flex items-center gap-xs font-label-md text-on-surface-variant hover:text-primary transition-colors">
                    <MaterialIcon name="thumb_up" className="text-base" /> 42 Helpful
                  </button>
                  <Link to="/product/instant-film-retro-camera" className="flex items-center gap-xs font-label-md text-on-surface-variant hover:text-primary transition-colors">
                    <MaterialIcon name="visibility" className="text-base" /> View Product
                  </Link>
                </div>
              </article>
            </div>
          </section>
        </div>
      </main>
    </Page>
  );
}
