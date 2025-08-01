import Image from "next/image";
import ConnectWalletButton from "../ConnectWalletButton";

const Hero = () => {
  return (
    <section className="px-6 pt-32 pb-16 md:pt-48 md:pb-24 flex flex-col md:flex-row items-center hero-bg">
      <div className="text-center flex flex-col items-center justify-center mx-auto max-w-3xl">
        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight ">
          AutoSwapper Wallet
          <span className="block gradient-text mt-2">
            Smart, Session-Key-Powered Crypto Automation
          </span>
        </h1>
        <p className="mt-6 text-lg text-neutral-300">
          Create swap rules. Delegate execution. Rebalance like a pro.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
          <ConnectWalletButton />
          <button className="p-0.5 rounded-lg gradient-1  text-white font-semibold glassy-shadow cursor-pointer px-0.5 group">
            <span className="px-5 py-3 w-full h-full bg-black/90 rounded-lg group-hover:bg-black/70 transition-all inline-block">
              Try Demo
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
export default Hero;
