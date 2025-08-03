import { Clock } from 'lucide-react';
import { SwapRule } from '@/hooks/useDashboardData';

interface ScheduledSwapsSectionProps {
    swapRules: SwapRule[];
    isLoadingRules: boolean;
}

export default function ScheduledSwapsSection({
    swapRules,
    isLoadingRules
}: ScheduledSwapsSectionProps) {
    const getNextScheduledSwap = () => {
        const nextRule = swapRules
            .filter(rule => rule.active)
            .sort((a, b) => new Date(a.nextExecution).getTime() - new Date(b.nextExecution).getTime())[0];

        if (!nextRule) return null;

        const nextExecutionDate = new Date(nextRule.nextExecution);
        const now = new Date();
        const timeDiff = nextExecutionDate.getTime() - now.getTime();

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        let executesIn = '';
        if (days > 0) executesIn += `${days} days, `;
        executesIn += `${hours} hours`;

        // Calculate progress based on time remaining
        const totalTime = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        const progress = Math.max(10, 100 - (timeDiff / totalTime) * 100);

        const chainInfo = nextRule.fromChain !== nextRule.toChain
            ? ` from ${nextRule.fromChain} to ${nextRule.toChain}`
            : '';

        return {
            id: nextRule.id,
            description: `Swap ${nextRule.amount} ${nextRule.fromToken} for ${nextRule.toToken}${chainInfo}`,
            executesIn,
            progress: Math.min(100, Math.max(0, progress)),
            estimatedValue: nextRule.estimatedValue,
            bridgeProtocol: nextRule.bridgeProtocol,
        };
    };

    const scheduledSwap = getNextScheduledSwap();

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Scheduled Swaps
            </h2>
            <div className="space-y-4">
                {isLoadingRules ? (
                    <div className="space-y-3">
                        <div className="w-full h-6 bg-white/20 rounded animate-pulse"></div>
                        <div className="w-3/4 h-4 bg-white/20 rounded animate-pulse"></div>
                        <div className="w-full h-2 bg-white/20 rounded animate-pulse"></div>
                    </div>
                ) : scheduledSwap ? (
                    <div className="space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="text-white font-medium">Next: {scheduledSwap.description}</p>
                                <p className="text-white/70 text-sm">Executes in: {scheduledSwap.executesIn}</p>
                                {scheduledSwap.estimatedValue && (
                                    <p className="text-green-400 text-sm">
                                        Estimated value: ~${scheduledSwap.estimatedValue.toFixed(2)}
                                    </p>
                                )}
                            </div>
                            {scheduledSwap.bridgeProtocol && (
                                <span className="text-blue-400 text-xs bg-blue-400/20 px-2 py-1 rounded ml-2">
                                    {scheduledSwap.bridgeProtocol}
                                </span>
                            )}
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${scheduledSwap.progress}%` }}></div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-white/50">No scheduled swaps</p>
                        <p className="text-white/30 text-sm">Create a swap rule to see upcoming swaps</p>
                    </div>
                )}
            </div>
        </div>
    );
} 