import { useState } from 'react';
import Image from 'next/image';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { useWallets } from '@privy-io/react-auth';
import { fetchTokenBalances, type TokenBalances } from '@/lib/utils';

interface BalanceSectionProps {
    balances: TokenBalances;
    isLoadingBalances: boolean;
    onRefreshBalances: () => void;
}

export default function BalanceSection({
    balances,
    isLoadingBalances,
    onRefreshBalances
}: BalanceSectionProps) {
    const { wallets } = useWallets();

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Balances
                </h2>
                <button
                    onClick={onRefreshBalances}
                    disabled={isLoadingBalances}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    title="Refresh balances">
                    <RefreshCw className={`w-4 h-4 text-white ${isLoadingBalances ? 'animate-spin' : ''}`} />
                </button>
            </div>
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
                        <div className="text-right">
                            {isLoadingBalances ? (
                                <div className="w-16 h-6 bg-white/20 rounded animate-pulse"></div>
                            ) : (
                                <span className="text-white font-bold">
                                    {amount.toLocaleString(undefined, {
                                        minimumFractionDigits: token === 'ETH' ? 4 : 2,
                                        maximumFractionDigits: token === 'ETH' ? 4 : 2
                                    })}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {!isLoadingBalances && wallets[0]?.address && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-white/50">
                        Base Sepolia Testnet
                    </p>
                </div>
            )}
        </div>
    );
} 