'use client';

import { usePathname } from 'next/navigation';
import { AppNav } from './AppNav';

export function ConditionalAppNav() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  if (isHomePage) {
    return null;
  }

  return <AppNav />;
}
