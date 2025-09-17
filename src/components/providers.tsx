'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config, projectId } from '../lib/wagmi-config';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

// Initialize Web3Modal outside component to avoid re-creation
if (typeof window !== 'undefined' && projectId) {
  createWeb3Modal({
    wagmiConfig: config,
    projectId: projectId as string,
    enableAnalytics: false,
    themeMode: 'dark' as const,
    themeVariables: {
      '--w3m-color-mix': '#000000' as const,
      '--w3m-color-mix-strength': 20 as const,
      '--w3m-accent': '#FFD700' as const,
      '--w3m-border-radius-master': '8px' as const,
    },
  });
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent SSR issues
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}