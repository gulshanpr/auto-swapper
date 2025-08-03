import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const {
      user,
      sessionKeyId,
      fromToken,
      toToken,
      fromChain,
      toChain,
      percent,
      amount,
      frequency,
      nextExecution
    } = await req.json();

    if (!user || !sessionKeyId || !fromToken || !toToken || !frequency || !nextExecution) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Creating swap rule for user:', user);

    // Validate session key - need to include user relationship to check wallet
    const sessionKey = await prisma.sessionKey.findUnique({
      where: { id: sessionKeyId },
      include: { user: true }
    });

    if (!sessionKey || sessionKey.user.wallet !== user.toLowerCase()) {
      return NextResponse.json({ error: 'Invalid session key' }, { status: 400 });
    }

    const rule = await prisma.swapRule.create({
      data: {
        user: { connect: { wallet: user.toLowerCase() } },
        sessionKey: { connect: { id: sessionKeyId } },
        fromToken,
        toToken,
        fromChain: fromChain || "Base Sepolia", // Default to Base Sepolia if not provided
        toChain: toChain || "Base Sepolia", // Default to Base Sepolia if not provided
        percent,
        amount,
        frequency,
        nextExecution: new Date(nextExecution),
      },
    });

    console.log('Swap rule created successfully with ID:', rule.id);
    return NextResponse.json({ id: rule.id });

  } catch (error) {
    console.error('Error creating swap rule:', error);
    return NextResponse.json({
      error: 'Failed to create swap rule',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user');
  if (!user) return NextResponse.json({ error: 'Missing user' }, { status: 400 });
  const rules = await prisma.swapRule.findMany({
    where: { user: { wallet: user.toLowerCase() }, active: true },
    include: { sessionKey: true },
  });
  return NextResponse.json(rules);
}