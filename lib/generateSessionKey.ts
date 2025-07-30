import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

export const generateSessionKey = () => {
  const privateKey = generatePrivateKey();

  const account = privateKeyToAccount(privateKey);
  const sessionKey = account.address;
  
  return {sessionKey};
}
