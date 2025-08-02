"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState } from "react";

export default function ConnectWalletButton() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets, connectWallet } = useWallets();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);

      // First ensure user is authenticated
      if (!authenticated) {
        await login();
      }

      // Then connect the wallet
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Check if wallet is connected
  const isWalletConnected = authenticated && wallets.length > 0 && wallets[0]?.address;

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
