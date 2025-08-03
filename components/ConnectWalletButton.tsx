"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
const { wallets } = useWallets(); // removed connectWallet

export default function ConnectWalletButton() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();

  // Check if wallet is connected
  const isWalletConnected = authenticated && wallets.length > 0 && wallets[0]?.address;

  const createOrGetUser = async (walletAddress: string) => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        throw new Error('Failed to create/get user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating/getting user:', error);
      throw error;
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);

      // Ensure user is authenticated & wallet connected
      if (!authenticated) {
        await login(); // handles wallet linking too
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Effect to handle user creation and redirect after wallet connection
  useEffect(() => {
    const handleWalletConnected = async () => {
      if (isWalletConnected && wallets[0]?.address) {
        try {
          const walletAddress = wallets[0].address;
          await createOrGetUser(walletAddress);

          // Redirect to dashboard
          // router.push('/dashboard');
        } catch (error) {
          console.error('Failed to handle wallet connection:', error);
        }
      }
    };

    handleWalletConnected();
  }, [isWalletConnected, wallets, router]);

  if (!ready) {
    return (
      <button
        className="bg-indigo-500 text-offwhite font-semibold py-3 px-6 rounded-lg shadow-lg opacity-50 cursor-not-allowed"
        disabled
      >
        Loading...
      </button>
    );
  }

  if (isWalletConnected) {
    const address = wallets[0].address;
    return (
      <div className="flex items-center space-x-4">
        <span className="bg-gray-800 text-offwhite px-4 py-2 rounded-lg font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={logout}
          className="bg-red-500 text-offwhite font-semibold py-2 px-4 rounded-lg shadow hover:bg-red-700 transition-all duration-300"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className={`font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform ${isConnecting
        ? "bg-indigo-400 text-offwhite opacity-75 cursor-not-allowed"
        : "bg-indigo-500 text-offwhite hover:bg-indigo-700 hover:scale-102 cursor-pointer"
        }`}
    >
      {isConnecting ? "Connecting..." : "Connect wallet"}
    </button>
  );
}
