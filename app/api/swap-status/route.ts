import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user');
  if (!user) return NextResponse.json({ error: 'Missing user' }, { status: 400 });
  const logs = await prisma.swapLog.findMany({
    where: { user: { wallet: user } },
    orderBy: { timestamp: 'desc' },
    take: 20,
    include: { rule: true },
  });
  return NextResponse.json(logs);
}