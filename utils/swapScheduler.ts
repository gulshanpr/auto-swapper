import cron from 'node-cron';
import prisma from '@/lib/prisma';
import { decryptSessionKey } from '@/utils/sessionKeyCrypto';
// import { executeSwapOnChain } from '@/utils/viem'; // Your on-chain logic

// Helper: get next execution date based on frequency
function getNextExecution(current: Date, frequency: string): Date {
  const next = new Date(current);
  if (frequency === 'daily') next.setDate(next.getDate() + 1);
  else if (frequency === 'weekly') next.setDate(next.getDate() + 7);
  else if (frequency === 'monthly') next.setMonth(next.getMonth() + 1);
  // Add more as needed
  return next;
}

async function processDueSwaps() {
  const now = new Date();
  // 1. Find all active rules due for execution
  const dueRules = await prisma.swapRule.findMany({
    where: {
      active: true,
      nextExecution: { lte: now },
    },
    include: { sessionKey: true, user: true },
  });

  for (const rule of dueRules) {
    try {
      // 2. Decrypt session key
      const sessionKey = decryptSessionKey(rule.sessionKey.keyEncrypted);

      // 3. Call your on-chain swap logic (stubbed here)
      // const txHash = await executeSwapOnChain({ rule, sessionKey });
      const txHash = '0xFAKE'; // Replace with real tx hash

      // 4. Log the result
      await prisma.swapLog.create({
        data: {
          user: { connect: { wallet: rule.user.wallet } },
          rule: { connect: { id: rule.id } },
          txHash,
          status: 'success',
          details: {},
        },
      });

      // 5. Update nextExecution
      await prisma.swapRule.update({
        where: { id: rule.id },
        data: { nextExecution: getNextExecution(rule.nextExecution, rule.frequency) },
      });

      console.log(`Swap executed for rule ${rule.id}, tx: ${txHash}`);
    } catch (err) {
      // Log failure
      await prisma.swapLog.create({
        data: {
          user: { connect: { wallet: rule.user.wallet } },
          rule: { connect: { id: rule.id } },
          status: 'failed',
          details: { error: err.message },
        },
      });
      console.error(`Swap failed for rule ${rule.id}:`, err);
    }
  }
}

// Schedule: every 5 minutes (customize as needed)
cron.schedule('*/5 * * * *', async () => {
  console.log('Running scheduled swap check...');
  await processDueSwaps();
});