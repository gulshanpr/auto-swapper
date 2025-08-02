import { createWalletClient, createPublicClient, custom, http } from 'viem';
import { baseSepolia } from 'viem/chains';

export function createViemWalletClient(provider: any, wallet: any) {
  return createWalletClient({
    account: wallet.address as `0x${string}`,
    chain: baseSepolia,
    transport: custom(provider),
  });
}

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export { baseSepolia };