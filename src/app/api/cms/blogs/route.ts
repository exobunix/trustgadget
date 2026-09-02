import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (slug) {
      const blog = dbHelpers.getBlogBySlug(slug);
      if (!blog) return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
      return NextResponse.json({ success: true, data: blog });
    }

    const blogs = dbHelpers.getBlogs(limit);
    return NextResponse.json({ success: true, data: blogs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
