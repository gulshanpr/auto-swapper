import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { user, sessionKeyId, fromToken, toToken, percent, amount, frequency, nextExecution } = await req.json();
  if (!user || !sessionKeyId || !fromToken || !toToken || !frequency || !nextExecution) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  // Validate session key
  const sessionKey = await prisma.sessionKey.findUnique({ where: { id: sessionKeyId } });
  if (!sessionKey || sessionKey.userId !== user) {
    return NextResponse.json({ error: 'Invalid session key' }, { status: 400 });
  }
  const rule = await prisma.swapRule.create({
    data: {
      user: { connect: { wallet: user } },
      sessionKey: { connect: { id: sessionKeyId } },
      fromToken,
      toToken,
      percent,
      amount,
      frequency,
      nextExecution: new Date(nextExecution),
    },
  });
  return NextResponse.json({ id: rule.id });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user');
    if (!user) return NextResponse.json({ error: 'Missing user' }, { status: 400 });
    const rules = await prisma.swapRule.findMany({
      where: { user: { wallet: user }, active: true },
      include: { sessionKey: true },
    });
    return NextResponse.json(rules);
  }