import React from 'react';
import { getRegistry } from '@/lib/api';
import ClientRedirect from '@/app/components/ClientRedirect';

export default async function RootPage() {
  const registry = await getRegistry();
  return <ClientRedirect to={`/${registry.active_version}`} />;
}
