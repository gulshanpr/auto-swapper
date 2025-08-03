import { History, ArrowRight, ExternalLink } from 'lucide-react';
import { SwapLog } from '@/hooks/useDashboardData';

interface SwapHistorySectionProps {
    swapHistory: SwapLog[];
    isLoadingHistory: boolean;
}

export default function SwapHistorySection({
    swapHistory,
    isLoadingHistory
}: SwapHistorySectionProps) {
    const getTimeAgo = (date: Date): string => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    const formatSwapHistoryItem = (log: SwapLog) => {
        const fromToken = log.rule.fromToken;
        const toToken = log.rule.toToken;
        const fromChain = log.rule.fromChain;
        const toChain = log.rule.toChain;
        const isCrossChain = fromChain !== toChain;

        const timeAgo = getTimeAgo(new Date(log.timestamp));

        if (log.status === 'success' || log.status === 'pending' || log.status === 'bridging') {
            const amountIn = log.actualAmountIn || log.rule.amount;
            const amountOut = log.actualAmountOut || (fromToken === 'USDC' ? (amountIn / 3500).toFixed(4) : (amountIn * 3500).toFixed(2));

            return {
                id: log.id,
                type: "SWAP" as const,
                fromAmount: amountIn.toString(),
                fromToken,
                toAmount: amountOut.toString(),
                toToken,
                fromChain,
                toChain,
                isCrossChain,
                timeAgo,
                status: log.status,
                sourceTxHash: log.sourceTxHash,
                destinationTxHash: log.destinationTxHash,
                bridgeTxHash: log.bridgeTxHash,
                actualFees: log.actualFees,
                actualSlippage: log.actualSlippage,
            };
        } else {
            return {
                id: log.id,
                type: "RULE CREATED" as const,
                description: `Swap rule created: ${log.rule.amount} ${fromToken} → ${toToken}${isCrossChain ? ` (${fromChain} → ${toChain})` : ''}`,
                timeAgo,
                status: log.status,
                isCrossChain,
            };
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-green-400';
            case 'pending': return 'bg-yellow-400';
            case 'bridging': return 'bg-blue-400';
            case 'failed': return 'bg-red-400';
            default: return 'bg-gray-400';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'success': return 'text-green-400';
            case 'pending': return 'text-yellow-400';
            case 'bridging': return 'text-blue-400';
            case 'failed': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const formattedHistory = swapHistory.map(log => formatSwapHistoryItem(log));

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Swap History
            </h2>
            <div className="space-y-3">
                {isLoadingHistory ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                                    <div className="w-48 h-4 bg-white/20 rounded animate-pulse"></div>
                                </div>
                                <div className="w-16 h-3 bg-white/20 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                ) : formattedHistory.length > 0 ? (
                    formattedHistory.map((item) => (
                        <div
                            key={item.id}
                            className="flex justify-between items-center py-3 border-b border-white/10 last:border-b-0">
                            <div className="flex items-center gap-3 flex-1">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`}></div>
                                <div className="flex-1">
                                    {item.type === "SWAP" ? (
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-white">
                                                    <span className={`font-medium ${getStatusTextColor(item.status)}`}>
                                                        {item.status.toUpperCase()}
                                                    </span>{" "}
                                                    <span className="text-green-300">
                                                        {item.fromAmount} {item.fromToken}
                                                    </span>
                                                    <ArrowRight className="inline-block size-4 mx-2" />
                                                    <span className="text-green-300">
                                                        {item.toAmount} {item.toToken}
                                                    </span>
                                                </p>
                                                {item.isCrossChain && (
                                                    <span className="text-purple-400 text-xs bg-purple-400/20 px-2 py-1 rounded">
                                                        Cross-chain
                                                    </span>
                                                )}
                                            </div>
                                            {item.isCrossChain && (
                                                <p className="text-white/50 text-xs mt-1">
                                                    {item.fromChain} → {item.toChain}
                                                </p>
                                            )}
                                            {item.actualFees && (
                                                <p className="text-white/50 text-xs">
                                                    Fees: ${item.actualFees.toFixed(4)}
                                                    {item.actualSlippage && ` • Slippage: ${item.actualSlippage.toFixed(2)}%`}
                                                </p>
                                            )}
                                            <div className="flex gap-2 mt-1">
                                                {item.sourceTxHash && (
                                                    <a
                                                        href={`https://sepolia.basescan.org/tx/${item.sourceTxHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 text-xs hover:underline flex items-center gap-1"
                                                    >
                                                        Source Tx <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                                {item.destinationTxHash && (
                                                    <a
                                                        href={`https://sepolia.etherscan.io/tx/${item.destinationTxHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 text-xs hover:underline flex items-center gap-1"
                                                    >
                                                        Dest Tx <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-white">
                                            <span className="text-blue-400 font-medium">{item.type}</span>
                                            {item.description && (
                                                <span className="text-white/70 ml-2">{item.description}</span>
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <span className="text-white/60 text-sm ml-4">{item.timeAgo}</span>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-white/50">No swap history yet</p>
                        <p className="text-white/30 text-sm">Your completed swaps will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
} 