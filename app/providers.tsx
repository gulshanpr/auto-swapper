'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { baseSepolia } from 'viem/chains';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        embeddedWallets: {
          createOnLogin: "all-users", // Still create embedded wallets for your use case
          showWalletUIs: true,
        },
        supportedChains: [baseSepolia],
        loginMethods: ["email", "google", "wallet"],
        externalWallets: {
          disableAllExternalWallets: false, // Set to false to ENABLE external wallets
        },
        appearance: {
          walletList: ['metamask'], // Show MetaMask as an option
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
