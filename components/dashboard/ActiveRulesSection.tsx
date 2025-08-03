import { SwapRule } from '@/hooks/useDashboardData';

interface ActiveRulesSectionProps {
    swapRules: SwapRule[];
    isLoadingRules: boolean;
}

export default function ActiveRulesSection({
    swapRules,
    isLoadingRules
}: ActiveRulesSectionProps) {
    const formatChainDisplay = (fromChain: string, toChain: string) => {
        if (fromChain === toChain) return '';
        return ` (${fromChain} → ${toChain})`;
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Active Rules</h2>
            <div className="space-y-3">
                {isLoadingRules ? (
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="w-full h-4 bg-white/20 rounded animate-pulse mb-2"></div>
                                <div className="w-3/4 h-3 bg-white/20 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                ) : swapRules.length > 0 ? (
                    swapRules.map((rule) => (
                        <div key={rule.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-white font-semibold">
                                    {rule.frequency.charAt(0).toUpperCase() + rule.frequency.slice(1)} {rule.fromToken} → {rule.toToken}
                                    {formatChainDisplay(rule.fromChain, rule.toChain)}
                                </h3>
                            </div>
                            <p className="text-white/70 text-sm">
                                Swap {rule.amount} {rule.fromToken} for {rule.toToken} {rule.frequency}
                                {rule.estimatedValue && (
                                    <span className="text-green-400 ml-2">(~${rule.estimatedValue.toFixed(2)})</span>
                                )}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-white/50 text-xs">
                                    Next: {new Date(rule.nextExecution).toLocaleDateString()}
                                </p>
                                {rule.bridgeProtocol && (
                                    <span className="text-blue-400 text-xs bg-blue-400/20 px-2 py-1 rounded">
                                        {rule.bridgeProtocol}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-white/50">No active rules yet</p>
                        <p className="text-white/30 text-sm">Create your first automated swap rule</p>
                    </div>
                )}
            </div>
        </div>
    );
} 