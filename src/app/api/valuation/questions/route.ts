import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const brandId = searchParams.get('brandId') || undefined;
    const modelId = searchParams.get('modelId') || undefined;

    if (!categoryId) {
      return NextResponse.json({ success: false, error: 'categoryId is required' }, { status: 400 });
    }

    const questions = dbHelpers.getQuestionsForDevice(categoryId, brandId, modelId);
    return NextResponse.json({ success: true, data: questions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
