import React from 'react';
import { Link } from 'react-router-dom';
import Page from '../layouts/Page';
import { MaterialIcon } from '../common/shared';
import { img } from '../utils/img';

const O1 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB_rKFK18u4a2oOo01DR6GryKBsO65zDy5Lrmdmwah-hzI729FVQSqDl2MCULx1T9_QNetiD6KjhwO8_VOqcNV2gJ8RQ_w2W8jKDAB1CgMRSLyveWKnAvRHByzFkOebIQA4_j3D7ZhmGMMRJokbS-QKrO0UGWsgkEEUIiq2q_mZkKwZun3XK89RPtSUGHPYNNopC-TAgNEVDAzXUNt2to24DcylLOEZMQhqHV0kfXhcxhpvVjkhxyCuo1G2G0u4O4KIwDLbfjn_eGY';
const O2 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCfVo_oD9pVyaiYfPQEjddux1y4wUXnh0zb2nO4fRRqHx0Ipn9TRtO3WeEauEnDbEWQyzt6a4BJyAPcbvY23FjTmnkbplrZLuE-i5J27jRG7cvYnI8DUkqbIQkoXIvyMepuodC3_Ots1kGZgNKQPIYwLCLNcBnTxNSqvJntRUz6jTuNAKASb6ahcUWZRwECI49UW1OK2swWxaLk3XmYC8bZMzD8aMUHQu4UQpEiNSHB2fl2UplAfju3BSdldHJHhrJmNMdaci54hR0';
const O3 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA7csGBQ3Ykt9ktbgOe0wJcdTcKx5u6jouNv60TPBE8nILt8HQw5uPezlNZMY6ysMJLNWOcHi60Z14iiyUS59bxml_6XTPDcaCojDzHQbZRpU3FQa6iQc5wyOIrHmt2ZGGYISZjfOFCbz5wO2rhPthanSwOWw79NzEDIoOykCo_W95Mknxfp9TQVEV3NQnRmr8K7DCl3TJ9a_z11dTlyCNCIzF70p1I5VaB69QWRC45OQTYU7Y61Dov51iCWbsMGLk6hVKcVO7FPI8';

const ORDERS = [
  { id: 'BHM-883920', status: 'Out for delivery', statusColor: 'bg-blue-100 text-blue-800', img: O1, title: 'Chronos Heritage Watch', meta: 'Sold by TimeKeepers Pvt Ltd', price: '₹12,450.00', date: 'Placed on Oct 24, 2023' },
  { id: 'BHM-772109', status: 'Delivered', statusColor: 'bg-green-100 text-green-800', img: O2, title: 'SonicBass ANC Headphones', meta: 'Sold by ElectroMax Official', price: '₹8,999.00', date: 'Placed on Sep 12, 2023' },
  { id: 'BHM-661234', status: 'Cancelled', statusColor: 'bg-slate-100 text-slate-500', img: O3, title: 'Velocity Running Shoes', meta: 'Sold by SportX India', price: '₹4,299.00', date: 'Placed on Aug 05, 2023' },
];

export default function MyOrdersPage() {
  return (
    <Page navActive="orders" headerVariant="listing">
      <main className="layout-main py-8 pb-24 md:pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-xl gap-4">
          <div>
            <h1 className="font-h1 text-h1 text-on-surface">Your Orders</h1>
            <p className="text-body-md text-on-surface-variant mt-xs">Track your packages and review past purchases</p>
          </div>
          <div className="flex gap-sm">
            <div className="relative flex-1 min-w-[200px]">
              <input className="w-full bg-white border border-outline-variant rounded-lg py-sm pl-md pr-lg text-body-sm focus:ring-primary focus:border-primary" placeholder="Search orders..." type="text" />
              <MaterialIcon name="search" className="absolute right-3 top-1/2 -translate-y-1/2 text-outline" />
            </div>
          </div>
        </div>
        <div className="space-y-gutter">
          {ORDERS.map((o) => (
            <article key={o.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-md py-sm bg-surface-container-high/50 border-b border-slate-100 flex flex-wrap justify-between items-center gap-2">
                <div className="flex flex-wrap gap-x-lg gap-y-1 text-body-sm">
                  <span className="font-semibold text-on-surface">{o.id}</span>
                  <span className="text-on-surface-variant">{o.date}</span>
                </div>
                <Link to={`/order/${o.id}/tracking`} className="text-primary font-bold text-label-md hover:underline flex items-center gap-1">
                  Track Package <MaterialIcon name="local_shipping" />
                </Link>
              </div>
              <div className="p-md">
                <div className="flex flex-col sm:flex-row gap-md items-start">
                  <div className="w-24 h-24 rounded-lg bg-surface-container-low border border-slate-100 shrink-0 overflow-hidden mx-auto sm:mx-0">
                    <img alt="" className="w-full h-full object-cover" src={img(o.img)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                      <div className="min-w-0">
                        <h3 className="font-h3 text-h3 text-on-surface">{o.title}</h3>
                        <p className="text-body-sm text-outline mt-1">{o.meta}</p>
                        <span className={`inline-block mt-md px-sm py-xs rounded text-[10px] font-bold uppercase tracking-wider ${o.statusColor}`}>{o.status}</span>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="font-price text-h3 text-on-surface">{o.price}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-md mt-md pt-md border-t border-slate-50">
                      <button type="button" className="flex-1 min-w-[140px] py-sm border border-outline-variant rounded-lg text-body-sm font-bold hover:bg-surface-container transition-colors flex justify-center items-center gap-sm">
                        <MaterialIcon name="replay" className="text-[18px]" /> Buy Again
                      </button>
                      <Link
                        to="/reviews"
                        className="flex-1 min-w-[140px] py-sm bg-primary text-white rounded-lg text-body-sm font-bold hover:brightness-110 flex justify-center items-center gap-sm"
                      >
                        <MaterialIcon name="star" className="text-[18px]" /> Rate Product
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </Page>
  );
}
