// hooks/useEIP7702Session.ts
"use client";

import { useState } from "react";
import {
  parseEther,
  type Hex,
  createWalletClient,
  http,
  encodeFunctionData,
  custom,
} from "viem";
import { baseSepolia } from "viem/chains";
import { useWallets, useSign7702Authorization } from "@privy-io/react-auth";

// ====== CONFIG ======
const ALCHEMY_BASE_SEPOLIA = `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`;
const CONTRACT_ADDRESS = "0x8A4131A7197fE6fDf638914B8a2d90F7B7198c83";

const CONTRACT_ABI = [
  {
    type: "function",
    name: "startSession",
    inputs: [
      { name: "key", type: "address", internalType: "address" },
      { name: "_swapToken", type: "address", internalType: "contract IERC20" },
      { name: "_swapAmount", type: "uint256", internalType: "uint256" },
      { name: "_duration", type: "uint256", internalType: "uint256" },
      { name: "_gasFee", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

interface SessionParams {
  sessionKeyAddress: `0x${string}`;
  swapToken?: `0x${string}`;
  swapAmount?: string;
  duration?: number;
  gasFee?: number;
}

export function useEIP7702Session() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { wallets } = useWallets();
  const { signAuthorization } = useSign7702Authorization();

  const startSession = async (params: SessionParams) => {
    const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");

    if (!embeddedWallet) {
      throw new Error("No Privy embedded wallet found");
    }

    setLoading(true);
    setError(null);

    try {
      const {
        sessionKeyAddress,
        swapToken = "0x0000000000000000000000000000000000000000",
        swapAmount = "0.001",
        duration = 300,
        gasFee = 0,
      } = params;

      // 1️⃣ Client for signing (Privy provider)
      const signerClient = createWalletClient({
        account: embeddedWallet.address as `0x${string}`,
        chain: baseSepolia,
        transport: custom(await embeddedWallet.getEthereumProvider()),
      });

      // 2️⃣ Client for sending (Alchemy RPC)
      const senderClient = createWalletClient({
        account: embeddedWallet.address as `0x${string}`,
        chain: baseSepolia,
        transport: http(ALCHEMY_BASE_SEPOLIA),
      });

      // 3️⃣ Sign EIP-7702 authorization
      const authorizationSignature = await signAuthorization({
        contractAddress: CONTRACT_ADDRESS as `0x${string}`,
      });

      console.log("Authorization signature from Privy:", authorizationSignature);

      const authorization = {
        address: CONTRACT_ADDRESS as `0x${string}`,
        chainId: baseSepolia.id,
        nonce: Number(authorizationSignature.nonce || 0),
        r: authorizationSignature.r!,
        s: authorizationSignature.s!,
        v: Number(authorizationSignature.v!),
      };

      console.log("Formatted authorization for viem:", authorization);

      // 4️⃣ Encode the contract call
      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: "startSession",
        args: [
          sessionKeyAddress,
          swapToken as Hex,
          parseEther(swapAmount),
          BigInt(duration),
          BigInt(gasFee),
        ],
      });

      // 5️⃣ Send transaction through Alchemy RPC
      const hash = await senderClient.sendTransaction({
        to: embeddedWallet.address as `0x${string}`, // Call your EOA (delegated to contract)
        data,
        authorizationList: [authorization],
        value: 0n,
      });

      console.log("Session started! Transaction hash:", hash);
      return hash;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start session";
      setError(errorMessage);
      console.error("Error starting session:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    startSession,
    loading,
    error,
    isReady: !!wallets.find((w) => w.walletClientType === "privy"),
  };
}
