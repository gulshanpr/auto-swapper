import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { walletAddress } = await request.json();

        if (!walletAddress) {
            return NextResponse.json(
                { error: 'Wallet address is required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        let user = await prisma.user.findUnique({
            where: {
                wallet: walletAddress.toLowerCase(),
            },
        });

        // If user doesn't exist, create new user
        if (!user) {
            user = await prisma.user.create({
                data: {
                    wallet: walletAddress.toLowerCase(),
                },
            });
        }

        return NextResponse.json({
            user,
            isNewUser: !user,
        });
    } catch (error) {
        console.error('Error creating/fetching user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 