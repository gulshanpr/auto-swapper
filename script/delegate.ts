// main.ts
import { encodeFunctionData, parseEther } from 'viem'
import { walletClient, eoaAccount, contractAddress, abi } from './config'

async function delegateAndStartSession() {
  // Your session key (temporary key pair you mentioned)
  const sessionKeyAddress = '0xcd6be02444E6C55c80F13D0610745101aDcf0946' // Your session public key
  const swapToken = '0x0000000000000000000000000000000000000000' // ETH (zero address)
 
  const swapAmount = parseEther('0.001') // 1000000000000000 wei (0.001 ETH)

// 5 minutes duration in seconds (uint256), NOT in wei!
// Just use plain number or BigInt
const duration = 300 // 5 * 60 seconds = 300 seconds

// Gas fee = 0 (no gas fee)
const gasFee = 0


  try {
    // 1. Sign authorization to delegate EOA to the contract
    const authorization = await walletClient.signAuthorization({
      account: eoaAccount,
      contractAddress,
      executor: 'self' // Since the EOA is executing the transaction itself
    })

    console.log('Authorization signed:', authorization)

    // 2. Call startSession on the delegated EOA
    const hash = await walletClient.writeContract({
      abi,
      address: eoaAccount.address, // Important: Use EOA address, not contract address
      authorizationList: [authorization],
      functionName: 'startSession',
      args: [
        sessionKeyAddress,
        swapToken,
        swapAmount,
        duration,
        gasFee
      ]
    })

    console.log('Transaction hash:', hash)
    return hash
  } catch (error) {
    console.error('Error:', error)
  }
}

// Execute
delegateAndStartSession()