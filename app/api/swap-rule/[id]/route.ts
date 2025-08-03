import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  context: any // or remove the type entirely
) {
  const { id } = context.params

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  await prisma.swapRule.update({
    where: { id },
    data: { active: false },
  })

  return NextResponse.json({ success: true })
}
