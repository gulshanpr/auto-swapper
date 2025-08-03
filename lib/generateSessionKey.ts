import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

export const generateSessionKey = () => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const sessionKeyAddress = account.address;

  return {
    privateKey,
    address: sessionKeyAddress
  };
}
