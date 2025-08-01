import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encryptSessionKey } from '@/utils/sessionKeyCrypto';

export async function POST(req: NextRequest) {
  const { user, delegator, key, validUntil, actions } = await req.json();
  if (!user || !delegator || !key || !validUntil || !actions) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const keyEncrypted = encryptSessionKey(key);
  const sessionKey = await prisma.sessionKey.create({
    data: {
      user: { connect: { wallet: user } },
      delegator,
      keyEncrypted,
      validUntil,
      actions,
    },
  });
  return NextResponse.json({ id: sessionKey.id });
}