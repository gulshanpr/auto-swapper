'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { baseSepolia } from 'viem/chains';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        embeddedWallets: {
          createOnLogin: "all-users", // 👈 This should create embedded wallets
          showWalletUIs: false,
        },
        supportedChains: [baseSepolia], // 👈 Make sure Base Sepolia is included
        loginMethods: ["email", "google"], // 👈 Use these, not external wallets
        externalWallets: {
          disableAllExternalWallets: true, // 👈 Disable external wallets
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}