import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Page from '../layouts/Page';
import { MaterialIcon } from '../common/shared';
import { img } from '../utils/img';

const MAP_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAK_wL1CrSqrvptBju-GRAY3MFaymhel-wU7QJJuwCoSSwQj3intNifUhJOBdw2xuZMHgMype-BTiS_B9MbItoS4MQCRQSQc60flDDYJxQ37zmB6QJSnN6D0BnQIY5lqmGOVyKXFrrDJLDaUDdZ_lrq9EbAJQjC-q9yheU7bw38g9FRKR7MPmxvFFU7N33-iIIqNVFSLfkHbqO1mBng-HCvMFXsd8my2YzFr1HqKFR2OjZAgGrg9A_mvA3m2X1aORaph8SlSMy5gRrk';
const DRIVER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCph1qhIlu_pV44qmffL02o8gI8DzUFuJpWJjzVP20R1wMMomH98ul3qopIdXmYGb6S3XwU7GQmmiDTKzS229fGRJyfKsqlFlpSlvvvkrvP8rRZC4k6pzOO_jd6TIwP36zaJlCpgcCADAOHfUxVdtzCDnGMZAtNsg_7xVYNfZBhOG8NIO_X3HehOz2n-vXTof-xd8ofJCmZObDNCNcNs3HQ8Upz4jAqY7XNer80p6Wl7g2UeES-EO6IoMOVqr-8SoWcBVYSMFc_pEM';
const P1 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBFPqYEiTfRJFrKY_xsccMYY0b1E_0DiX8zgWdxgBM5cy-oy-C-ET3VHUJ_uVaSbxY06unstQulTVj2YCntHaOgCej3UGArKICjdqQrmf3GvaRd1aZKsvq06J8lkhV3-72eRhZHl32sA6jx2l1ZdRsBZWEYc9lsZIukJLKKmNO-BmTrg15wqBT-qra8iTQO5z1UzT2dsHCpAndX3lK4Jo8oe4a_Lh0IdjzZtfaJEj-G1OgGSKZfgBinOMUjPJFYnv0TLld9vSgDe1Y';
const P2 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDOKvTmBxjOPSv7VsO8H1sjxBnpS2BfhfurU7IVMx2VwsuVScnBn0EPx26nRHXqGj7nv5Jt9CDAiwaco0DiJIsV2tMm4pTAGnEi_LRfZoSqvQiIrc5dc6rxBPtHGKu51NwnuY8cJo85s2liwTePPQ-naZtvFFqUUxzsKvBKnoYFS5yR5fseElp2zXUT-e0AW89VTr5LLcT4d57zZo4HCDa2WcgPLGkx4cBreRq3hQG0dANwgXdQchHbw7hR6d_2-iRgMtULJfiV-ro';

export default function OrderTrackingPage() {
  const { orderId } = useParams();

  return (
    <Page navActive="orders" headerVariant="listing">
      <main className="layout-main py-xl pb-24 md:pb-12">
        <div className="flex items-center gap-sm mb-lg text-body-sm text-on-surface-variant">
          <Link to="/orders" className="hover:text-primary transition-colors">
            My Orders
          </Link>
          <MaterialIcon name="chevron_right" className="text-xs" />
          <span className="text-on-surface font-semibold">Tracking for {orderId || 'BHM-883920'}</span>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-lg">
          <div className="xl:col-span-7 space-y-lg order-2 xl:order-1">
            <section className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
              <div className="h-64 md:h-80 relative bg-surface-container-high">
                <img alt="" className="w-full h-full object-cover opacity-90" src={img(MAP_IMG)} />
                <div className="absolute bottom-4 left-4 right-4 md:bottom-auto md:top-4 md:left-auto md:right-4 md:w-64 bg-white/95 backdrop-blur p-md rounded-lg shadow-lg border border-slate-100 flex gap-md items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shrink-0">
                    <img alt="" className="w-full h-full object-cover" src={img(DRIVER)} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-h3 text-h3 text-on-surface truncate">Rahul is nearby</p>
                    <p className="text-body-sm text-on-surface-variant">Driving • White Mahindra Van</p>
                    <div className="flex gap-sm mt-sm">
                      <button type="button" className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                        <MaterialIcon name="call" className="text-sm" />
                      </button>
                      <button type="button" className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                        <MaterialIcon name="chat" className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-md md:p-lg">
                <div className="relative flex justify-between items-start gap-2 overflow-x-auto hide-scrollbar pb-2">
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-surface-container-high -z-0 hidden md:block mx-8" />
                  {[
                    { t: 'Order Placed', st: '26 Oct, 9:30 AM', ok: true },
                    { t: 'Confirmed', st: '26 Oct, 10:15 AM', ok: true },
                    { t: 'Shipped', st: '27 Oct, 2:00 PM', ok: true },
                    { t: 'Out for Delivery', st: 'Today', ok: true },
                    { t: 'Delivered', st: 'Expected by 7 PM', ok: false },
                  ].map((s, i) => (
                    <div key={s.t} className="flex flex-col items-center z-10 min-w-[64px] text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white mb-sm shadow-sm ${
                          s.ok ? 'bg-primary text-white' : 'bg-surface-container-high text-outline'
                        }`}
                      >
                        {s.ok ? <MaterialIcon name="check" className="text-sm" /> : <span className="text-xs">{i + 1}</span>}
                      </div>
                      <p className={`text-[10px] md:text-label-md font-bold uppercase max-w-[72px] md:max-w-none ${s.ok ? 'text-primary' : 'text-outline'}`}>{s.t}</p>
                      <p className="text-[9px] text-on-surface-variant mt-xs hidden md:block">{s.st}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
          <div className="xl:col-span-5 space-y-lg order-1 xl:order-2">
            <section className="bg-white rounded-xl p-md border border-slate-100 shadow-sm">
              <h2 className="font-h2 text-h2 text-on-surface mb-md flex justify-between items-center">
                Shipment Details
                <span className="text-label-md font-normal text-primary border border-primary px-sm py-xs rounded-full">On Time</span>
              </h2>
              <div className="divide-y divide-outline-variant/20">
                <div className="py-md flex gap-md">
                  <div className="w-16 h-16 bg-surface-container-low rounded-md overflow-hidden shrink-0 border border-slate-100">
                    <img alt="" className="w-full h-full object-cover" src={img(P1)} />
                  </div>
                  <div>
                    <h3 className="font-bold text-body-md text-on-surface">SonicWave ANC Headphones</h3>
                    <p className="text-body-sm text-on-surface-variant">Qty: 1 • Midnight Black</p>
                  </div>
                </div>
                <div className="py-md flex gap-md">
                  <div className="w-16 h-16 bg-surface-container-low rounded-md overflow-hidden shrink-0 border border-slate-100">
                    <img alt="" className="w-full h-full object-cover" src={img(P2)} />
                  </div>
                  <div>
                    <h3 className="font-bold text-body-md text-on-surface">ErgoStand Laptop Base</h3>
                    <p className="text-body-sm text-on-surface-variant">Qty: 1 • Bamboo Wood</p>
                  </div>
                </div>
              </div>
            </section>
            <div className="bg-secondary-container/20 rounded-xl p-md border border-secondary/10 flex items-center gap-md">
              <MaterialIcon name="support_agent" className="text-4xl text-secondary" />
              <div>
                <h4 className="font-bold text-on-surface text-body-md">Need help with your delivery?</h4>
                <button type="button" className="text-primary text-label-md font-bold mt-1 hover:underline text-left">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Page>
  );
}
