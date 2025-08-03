import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encryptSessionKey } from '@/utils/sessionKeyCrypto';

export async function POST(req: NextRequest) {
  try {
    const { user, delegator, sessionKeyPrivate, sessionKeyPublic, validUntil, actions } = await req.json();

    if (!user || !delegator || !sessionKeyPrivate || !sessionKeyPublic || !validUntil || !actions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Creating session key for user:', user);

    // Encrypt the session private key
    const keyEncrypted = encryptSessionKey(sessionKeyPrivate);

    // Create or connect to user, then create session key
    const sessionKey = await prisma.sessionKey.create({
      data: {
        user: {
          connectOrCreate: {
            where: { wallet: user },
            create: { wallet: user }
          }
        },
        delegator,
        keyEncrypted, // This stores the encrypted private key
        sessionKeyPublic, // Store the public key (address) separately
        validUntil,
        actions,
      },
    });

    console.log('Session key created successfully with ID:', sessionKey.id);
    return NextResponse.json({ id: sessionKey.id });

  } catch (error) {
    console.error('Error creating session key:', error);
    return NextResponse.json({
      error: 'Failed to create session key',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}