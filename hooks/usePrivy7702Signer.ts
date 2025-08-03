// hooks/usePrivy7702Signer.ts
"use client";

import { useWallets, useSign7702Authorization } from "@privy-io/react-auth";
import { createWalletClient, custom, type Hex } from "viem";
import { baseSepolia } from "viem/chains";
import {
    SmartAccountSigner,
    WalletClientSigner,
} from "@aa-sdk/core";
import type { AuthorizationRequest } from "@aa-sdk/core";
import type { SignedAuthorization } from "viem/experimental";
import { useState, useEffect } from "react";

export function usePrivy7702Signer(delegatorAddress: `0x${string}`) {
    const { wallets } = useWallets();
    const { signAuthorization } = useSign7702Authorization();
    const [signer, setSigner] = useState<SmartAccountSigner | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const createSigner = async () => {
            // Get the embedded Privy wallet
            const embeddedWallet = wallets.find(
                (w) => w.walletClientType === "privy"
            );

            if (!embeddedWallet) {
                setSigner(null);
                return;
            }

            setLoading(true);

            try {
                // Create WalletClientSigner from Privy provider
                const baseSigner = new WalletClientSigner(
                    createWalletClient({
                        account: embeddedWallet.address as Hex,
                        chain: baseSepolia, // Changed from sepolia to baseSepolia
                        transport: custom(
                            await embeddedWallet.getEthereumProvider()
                        ),
                    }),
                    "privy"
                );

                // Add signAuthorization method for EIP-7702 following Privy's pattern
                const signerWithAuth: SmartAccountSigner = {
                    ...baseSigner,
                    signAuthorization: async (
                        unsignedAuth: AuthorizationRequest<number>
                    ): Promise<SignedAuthorization<number>> => {
                        const contractAddress = unsignedAuth.contractAddress ?? unsignedAuth.address ?? delegatorAddress;

                        const signature = await signAuthorization({
                            ...unsignedAuth,
                            contractAddress,
                        });

                        return {
                            ...unsignedAuth,
                            r: signature.r!,
                            s: signature.s!,
                            v: signature.v!,
                            address: contractAddress,
                        };
                    },
                };

                setSigner(signerWithAuth);
            } catch (error) {
                console.error("Error creating signer:", error);
                setSigner(null);
            } finally {
                setLoading(false);
            }
        };

        createSigner();
    }, [wallets, signAuthorization, delegatorAddress]);

    return { signer, loading };
}
