import { NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';

export async function GET() {
  try {
    const categories = dbHelpers.getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
