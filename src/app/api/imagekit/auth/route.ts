import { NextResponse } from 'next/server';
import { getImageKitAuth } from '@/lib/imagekit';

export async function GET() {
  try {
    const authParams = getImageKitAuth();
    return NextResponse.json(authParams);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
