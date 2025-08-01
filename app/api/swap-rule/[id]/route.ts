import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.swapRule.update({
    where: { id },
    data: { active: false },
  });
  return NextResponse.json({ success: true });
}