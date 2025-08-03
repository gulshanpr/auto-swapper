"use client";

import { useState } from "react";
import { useEIP7702Session } from "@/hooks/useEIP7702Session";
import { Clock, Key, Zap } from "lucide-react";

export function SessionManagement() {
    const { startSession, loading, error, isReady } = useEIP7702Session();
    const [activeSession, setActiveSession] = useState<string | null>(null);

    // Predefined session templates
    const sessionTemplates = [
        {
            name: "Quick Swap",
            duration: 300, // 5 minutes
            amount: "0.001",
            icon: <Zap className="w-4 h-4" />,
            description: "5 min session for quick swaps"
        },
        {
            name: "Trading Session",
            duration: 1800, // 30 minutes
            amount: "0.01",
            icon: <Clock className="w-4 h-4" />,
            description: "30 min session for active trading"
        },
        {
            name: "Long Session",
            duration: 3600, // 1 hour
            amount: "0.1",
            icon: <Key className="w-4 h-4" />,
            description: "1 hour session for extended use"
        }
    ];

    const handleQuickStart = async (template: typeof sessionTemplates[0]) => {
        try {
            const hash = await startSession({
                sessionKeyAddress: "0xcd6be02444E6C55c80F13D0610745101aDcf0946",
                swapAmount: template.amount,
                duration: template.duration,
                gasFee: 0
            });
            setActiveSession(hash);
        } catch (err) {
            console.error("Failed to start session:", err);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Key className="w-5 h-5" />
                Session Management
            </h3>

            {!isReady && (
                <div className="text-amber-600 text-sm mb-4">
                    ⚠️ Please delegate your wallet first to start sessions
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sessionTemplates.map((template, index) => (
                    <button
                        key={index}
                        onClick={() => handleQuickStart(template)}
                        disabled={loading || !isReady}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 text-left"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            {template.icon}
                            <span className="font-medium">{template.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{template.description}</p>
                        <p className="text-xs text-gray-500">
                            Amount: {template.amount} ETH
                        </p>
                    </button>
                ))}
            </div>

            {loading && (
                <div className="text-blue-600 text-sm mt-4">
                    Starting session...
                </div>
            )}

            {error && (
                <div className="text-red-500 text-sm mt-4">
                    Error: {error}
                </div>
            )}

            {activeSession && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <p className="text-green-800 text-sm">
                        ✅ Session started successfully!
                    </p>
                    <p className="text-green-600 text-xs mt-1">
                        Tx: {activeSession.slice(0, 20)}...
                    </p>
                </div>
            )}
        </div>
    );
} 