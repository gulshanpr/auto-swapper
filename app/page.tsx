"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import Hero from "@/components/sections/Hero";
import WhyItMatters from "@/components/sections/WhyItMatters";

export default function Home() {
  const { ready, login, authenticated, logout } = usePrivy();

  const { wallets } = useWallets();

  const changeChain = async () => {
    const wallet = wallets[0];

    await wallet.switchChain(421_614);
  };

  return (
    <main className="relative">
      {/* <p>Status: {ready ? "Privy is ready!" : "Loading Privy..."}</p>
      <p>Authenticated: {authenticated ? "Yes" : "No"}</p>
      <button onClick={authenticated ? logout : login}>
        {authenticated ? "Logout" : "Wallet Connect"}
      </button>

      <button onClick={changeChain}>Change Chain</button>
      <button onClick={generateSessionKey}>generate session key</button> */}

      <Hero />
      <HowItWorks />
      <Features />
      <WhyItMatters />
    </main>
  );
}
