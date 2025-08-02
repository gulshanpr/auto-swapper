import { walletClient, eoaAccount } from './config'

async function revokeAuthorization() {
  try {
    // Create authorization pointing to zero address to revoke
    const revokeAuthorization = await walletClient.signAuthorization({
      account: eoaAccount,
      contractAddress: '0x0000000000000000000000000000000000000000', // Zero address
      executor: 'self'
    })

    console.log('Revoke authorization signed:', revokeAuthorization)

    // Send transaction with revoke authorization
    const hash = await walletClient.sendTransaction({
      authorizationList: [revokeAuthorization],
      to: eoaAccount.address,
      data: '0x', // Empty data
      value: BigInt(0)
    })

    console.log('Revoke transaction hash:', hash)
    return hash
  } catch (error) {
    console.error('Error revoking authorization:', error)
  }
}

// Execute revocation
revokeAuthorization()