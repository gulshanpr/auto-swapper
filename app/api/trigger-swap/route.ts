import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decryptSessionKey } from '@/utils/sessionKeyCrypto';

export async function POST(req: NextRequest) {
  const { ruleId } = await req.json();
  if (!ruleId) return NextResponse.json({ error: 'Missing ruleId' }, { status: 400 });
  const rule = await prisma.swapRule.findUnique({
    where: { id: ruleId },
    include: { sessionKey: true, user: true },
  });
  if (!rule) return NextResponse.json({ error: 'Rule not found' }, { status: 404 });

  // Decrypt session key
  const sessionKey = decryptSessionKey(rule.sessionKey.keyEncrypted);

  // TODO: Call your on-chain swap logic here using sessionKey, rule, etc.
  // const txHash = await executeSwapOnChain(...);

  // For now, just log a fake tx
  const log = await prisma.swapLog.create({
    data: {
      user: { connect: { wallet: rule.user.wallet } },
      rule: { connect: { id: rule.id } },
      txHash: '0xFAKE',
      status: 'pending',
      details: {},
    },
  });

  return NextResponse.json({ logId: log.id });
}