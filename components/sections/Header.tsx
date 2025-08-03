"use client";

import Image from "next/image";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import ConnectWalletButton from "../ConnectWalletButton";

const Header = () => {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  // Check if wallet is connected
  const isWalletConnected = authenticated && wallets.length > 0 && wallets[0]?.address;

  const baseNavItems = [
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Features", href: "/#features" },
  ];

  // Add Dashboard to nav items only when wallet is connected
  const navItems = isWalletConnected
    ? [{ label: "Dashboard", href: "/dashboard" }, ...baseNavItems]
    : baseNavItems;

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/20 z-1 lg:z-20 backdrop-blur">
      <nav className="container mx-auto p-6 flex justify-between items-center">
        <a href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          <span className="text-xl font-semibold text-white">AutoSwapper</span>
        </a>
        <ul className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="relative text-white hover:text-gray-300 transition-colors font-medium after:content-[''] after:absolute after:left-1/2 after:-bottom-1 after:w-0 after:h-[2px] after:bg-gray-300 after:transition-all after:duration-300 hover:after:left-0 hover:after:w-full">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="md:block hidden">
          <ConnectWalletButton />
        </div>
      </nav>
    </header>
  );
};
export default Header;
