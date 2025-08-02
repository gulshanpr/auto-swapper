"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, zeroAddress, type Hex } from "viem";
import { baseSepolia } from "viem/chains";
import { getDeleGatorEnvironment } from "@metamask/delegation-toolkit";

export function useEIP7702Delegation() {
    const { ready, authenticated } = usePrivy();
    const { wallets } = useWallets();

    const delegateToContract = async () => {
        if (!ready) throw new Error("Privy not ready yet");
        if (!authenticated) throw new Error("User not logged in");
        if (wallets.length === 0) throw new Error("No wallets connected");

        // 1️⃣ Get the first connected wallet
        const wallet = wallets[0];
        if (!wallet) throw new Error("No wallet available");

        const account = wallet.address as Hex;

        // 2️⃣ Get the Ethereum provider from the wallet
        const provider = await wallet.getEthereumProvider();

        // 3️⃣ Get delegator implementation address
        const environment = getDeleGatorEnvironment(baseSepolia.id);
        const contractAddress = environment.implementations?.EIP7702StatelessDeleGatorImpl ||
            "0x8A4131A7197fE6fDf638914B8a2d90F7B7198c83";

        try {
            // 4️⃣ Sign the EIP-7702 authorization using MetaMask's JSON-RPC method
            const authorization = await provider.request({
                method: 'eth_signAuthorization',
                params: [{ contractAddress, executor: 'self' }],
            });

            // 5️⃣ Create Viem wallet client for sending the transaction
            const walletClient = createWalletClient({
                account,
                chain: baseSepolia,
                transport: custom(provider),
            });

            // 6️⃣ Send transaction with authorization
            const txHash = await walletClient.sendTransaction({
                to: account, // Send to the EOA itself (dummy transaction)
                value: BigInt(0),
                data: "0x",
                authorizationList: [authorization],
            });

            return txHash;
        } catch (err: any) {
            if (err.code === -32601) {
                throw new Error(
                    'Your wallet does not yet support EIP-7702. ' +
                    'Install MetaMask Developer Build or enable the Delegation Toolkit.'
                );
            }
            throw err;
        }
    };

    return { delegateToContract };
}
