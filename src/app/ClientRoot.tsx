// src/app/ClientRoot.tsx
'use client';

import { useEffect, useState } from 'react';
import Providers from './providers';

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <Providers>{children}</Providers>;
}
