// viemConfig.ts
import { createWalletClient, custom, parseEther } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { createBundlerClient } from "viem/account-abstraction";

export function createViemWalletClient(provider: any, wallet: any) {
  return createWalletClient({
    account: wallet.address as `0x${string}`,
    chain: arbitrumSepolia,
    transport: custom(provider),
  });
}

// const bundlerClient = createBundlerClient({
//   client: publicClient,
//   transport: http("https://your-bundler-rpc.com"),
// });