// Check current delegation status
import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
})

async function checkDelegationStatus(eoaAddress: string) {
  try {
    console.log('Checking delegation for:', eoaAddress);

    // Get the current code at the EOA address
    const code = await publicClient.getCode({
      address: eoaAddress as `0x${string}`
    })

    console.log('Raw code response:', code);
    console.log('Code type:', typeof code);

    // Check for EIP-7702 delegation (starts with 0xef0100)
    if (code && code !== '0x') {
      console.log('✅ EOA has code:', code);
      console.log('Code length:', code.length);

      if (code.startsWith('0xef0100')) {
        const delegatedAddress = '0x' + code.slice(8);
        console.log('🎯 EIP-7702 delegation detected!');
        console.log('Delegated to contract:', delegatedAddress);
        return { isDelegated: true, delegatedTo: delegatedAddress };
      } else {
        console.log('⚠️ Has code but not EIP-7702 delegation');
        return { isDelegated: false, code };
      }
    } else {
      console.log('❌ EOA is not delegated (no code)');
      return { isDelegated: false };
    }
  } catch (error) {
    console.error('Error checking delegation:', error);
    return { isDelegated: false, error };
  }
}

// Check your EOA - replace with your actual address
checkDelegationStatus('0x49c4f4b258B715A4d50e6642F325946e62A6B7bA')
  .then(result => console.log('Final result:', result));