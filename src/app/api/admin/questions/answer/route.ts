import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  try {
    const { answerId, adjustmentValue, label, description } = await req.json();

    if (!answerId) {
      return NextResponse.json({ success: false, error: 'Answer ID required' }, { status: 400 });
    }

    dbHelpers.updateAnswer(answerId, {
      adjustmentValue: Number(adjustmentValue),
      label,
      description,
    });

    return NextResponse.json({ success: true, message: 'Answer updated successfully' });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
