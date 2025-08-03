// lib/delegatorClient.ts
import { createModularAccountV2Client } from "@account-kit/smart-contracts";
import { baseSepolia, alchemy } from "@account-kit/infra";
import type { SmartAccountSigner } from "@aa-sdk/core";

export async function createDelegatorClient(
    signer: SmartAccountSigner,
    delegatorAddress: `0x${string}`
) {
    return createModularAccountV2Client({
        mode: "7702",
        chain: baseSepolia,
        signer,
        transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY! }),
        // Note: smartAccountAddress is not needed for 7702 mode - it will use the signer's address
        // policyId: "your-policy-id", // Uncomment and add your policy ID for gas sponsorship
    });
}
