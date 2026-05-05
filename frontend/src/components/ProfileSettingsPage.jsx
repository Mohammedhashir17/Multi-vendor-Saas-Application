import React from 'react';
import { Link } from 'react-router-dom';
import Page from '../layouts/Page';
import { MaterialIcon } from '../common/shared';

export default function ProfileSettingsPage() {
  return (
    <Page navActive="profile" headerVariant="profile">
      <main className="layout-main py-8 lg:py-12 pb-28 md:pb-16 max-w-3xl">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-primary font-semibold text-body-sm hover:underline mb-6"
        >
          <MaterialIcon name="arrow_back" className="text-lg" />
          Back to profile
        </Link>
        <h1 className="font-h2 text-h2 text-on-surface mb-2">Settings</h1>
        <p className="text-on-surface-variant text-body-md mb-8">
          Manage notifications, security, and privacy. Detailed controls will use your account APIs when available.
        </p>
        <ul className="space-y-3">
          {[
            { icon: 'notifications', label: 'Email & push notifications', hint: 'Order updates and promotions' },
            { icon: 'lock', label: 'Security', hint: 'Password and two-factor (use profile for password flows)' },
            { icon: 'shield', label: 'Privacy', hint: 'Data and marketing preferences' },
          ].map((row) => (
            <li
              key={row.label}
              className="flex items-center gap-4 bg-white rounded-xl border border-slate-100 p-4 shadow-sm"
            >
              <span className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <MaterialIcon name={row.icon} />
              </span>
              <div>
                <p className="font-semibold text-on-surface">{row.label}</p>
                <p className="text-body-sm text-on-surface-variant">{row.hint}</p>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </Page>
  );
}
