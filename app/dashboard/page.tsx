"use client";
import { useState } from "react";
import Image from "next/image";
import { TrendingUp, Clock, History, ArrowRight } from "lucide-react";
import AutoRebalancingModal from "@/components/modals/AutoRebalancingModal";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data
  const balances = {
    ETH: 2.5,
    USDC: 10480.15,
  };

  const scheduledSwaps = [
    {
      id: 1,
      description: "Swap ~1,048 USDC for ETH",
      executesIn: "3 days, 4 hours",
      progress: 75,
    },
  ];

  const activeRules = [
    {
      id: 1,
      title: "Weekly USDC -> ETH",
      description: "Swap 10% of USDC for ETH every Sunday at 12:00 UTC",
    },
  ];

  const swapHistory = [
    {
      id: 1,
      type: "SWAP",
      fromAmount: "1,000",
      fromToken: "USDC",
      toAmount: "0.31",
      toToken: "ETH",
      timeAgo: "2 days ago",
    },
    {
      id: 2,
      type: "SWAP",
      fromAmount: "500",
      fromToken: "USDC",
      toAmount: "0.33",
      toToken: "ETH",
      timeAgo: "9 days ago",
    },
    {
      id: 3,
      type: "RULE CREATED",
      description: "Weekly USDC -> ETH rule created",
      timeAgo: "16 days ago",
    },
  ];

  return (
    <div className="min-h-screen p-6 pt-30 grid place-items-center">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/70">
              Manage your automated swapping rules and monitor your portfolio
            </p>
          </div>
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
              Edit
            </button>
            <AutoRebalancingModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6 flex flex-col justify-between">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Balances
              </h2>
              <div className="space-y-4">
                {Object.entries(balances).map(([token, amount]) => (
                  <div key={token} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Image
                          src={
                            token === "ETH" ? "/ethereum-eth-logo.svg" : "/usd-coin-usdc-logo.svg"
                          }
                          alt={token}
                          width={14}
                          height={14}
                          className="w-6 h-6"
                        />
                      </div>
                      <span className="text-white font-medium">{token}</span>
                    </div>
                    <span className="text-white font-bold">{amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-0.5 w-full bg-white/10 rounded-full"></div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Active Rules</h2>
              <div className="space-y-3">
                {activeRules.map((rule) => (
                  <div key={rule.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-semibold">{rule.title}</h3>
                    </div>
                    <p className="text-white/70 text-sm">{rule.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Scheduled Swaps
              </h2>
              <div className="space-y-4">
                {scheduledSwaps.map((swap) => (
                  <div key={swap.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">Next: {swap.description}</p>
                        <p className="text-white/70 text-sm">Executes in: {swap.executesIn}</p>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${swap.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Swap History
              </h2>
              <div className="space-y-3">
                {swapHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-3 border-b border-white/10 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div>
                        {item.type === "SWAP" ? (
                          <p className="text-white">
                            <span className="text-green-400 font-medium">SWAP</span>{" "}
                            <span className="text-green-300">
                              {item.fromAmount} {item.fromToken}
                            </span>
                            <ArrowRight className="inline-block size-4 mx-3" />
                            <span className="text-green-300">
                              {item.toAmount} {item.toToken}
                            </span>
                          </p>
                        ) : (
                          <p className="text-white">
                            <span className="text-blue-400 font-medium">{item.type}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-white/60 text-sm">{item.timeAgo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
