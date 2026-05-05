import React from 'react';
import { Link } from 'react-router-dom';
import Page from '../layouts/Page';
import { MaterialIcon } from '../common/shared';

export default function SavedAddressesPage() {
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
        <h1 className="font-h2 text-h2 text-on-surface mb-2">Saved addresses</h1>
        <p className="text-on-surface-variant text-body-md mb-8">
          Save home and work addresses here for faster checkout. This section will sync with your account once backend address APIs are
          connected.
        </p>
        <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-6 text-center text-on-surface-variant">
          <MaterialIcon name="location_on" className="text-5xl text-primary/40 mx-auto mb-3" />
          <p className="font-body-md">No saved addresses yet.</p>
          <p className="text-body-sm mt-2">Add an address during checkout — stored delivery options are coming soon.</p>
        </div>
      </main>
    </Page>
  );
}
