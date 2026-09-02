import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '15', 10);

    if (!q || q.trim().length === 0) {
      const popular = dbHelpers.getPopularModels(limit);
      return NextResponse.json({ success: true, data: popular });
    }

    const results = dbHelpers.searchDevices(q, limit);
    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
