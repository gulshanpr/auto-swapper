// components/StartSessionButton.tsx
"use client";

import { useState } from "react";
import { useEIP7702Session } from "@/hooks/useEIP7702Session";

export function StartSessionButton() {
    const { startSession, loading, error, isReady } = useEIP7702Session();
    const [txHash, setTxHash] = useState<string | null>(null);

    const handleStartSession = async () => {
        try {
            const hash = await startSession({
                sessionKeyAddress: "0xcd6be02444E6C55c80F13D0610745101aDcf0946", // Your session key
                swapAmount: "0.001", // 0.001 ETH
                duration: 300, // 5 minutes
                gasFee: 0
            });
            setTxHash(hash);
        } catch (err) {
            console.error("Failed to start session:", err);
        }
    };

    return (
        <div className="space-y-4">
            <button
                onClick={handleStartSession}
                disabled={!isReady || loading}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
                {loading ? "Starting Session..." : "Start Session"}
            </button>

            {error && (
                <div className="text-red-500 text-sm">
                    Error: {error}
                </div>
            )}

            {txHash && (
                <div className="text-green-500 text-sm">
                    Session started! Tx: {txHash}
                </div>
            )}
        </div>
    );
} 