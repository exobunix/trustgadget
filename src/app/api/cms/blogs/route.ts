import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    let query = 'SELECT * FROM blogs';
    const params: any[] = [];
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    query += ' ORDER BY publishedAt DESC, createdAt DESC';
    const blogs = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, data: blogs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, excerpt, content, coverImage, author, category, readTime, isPublished } = body;

    if (!title || !excerpt || !content) {
      return NextResponse.json({ success: false, error: 'Title, excerpt, and content are required' }, { status: 400 });
    }

    const id = `blg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    db.prepare(`
      INSERT INTO blogs (id, title, slug, excerpt, content, coverImage, author, category, readTime, isPublished)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      finalSlug,
      excerpt,
      content,
      coverImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      author || 'TrustMyGadget Editorial',
      category || 'Selling Guide',
      readTime || '4 min read',
      isPublished !== undefined ? (isPublished ? 1 : 0) : 1
    );

    return NextResponse.json({ success: true, message: 'Blog created successfully', data: { id } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, slug, excerpt, content, coverImage, author, category, readTime, isPublished } = body;

    if (!id || !title) {
      return NextResponse.json({ success: false, error: 'Blog ID and title are required' }, { status: 400 });
    }

    db.prepare(`
      UPDATE blogs
      SET title = ?,
          slug = COALESCE(?, slug),
          excerpt = ?,
          content = ?,
          coverImage = COALESCE(?, coverImage),
          author = ?,
          category = ?,
          readTime = ?,
          isPublished = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title,
      slug || null,
      excerpt,
      content,
      coverImage || null,
      author || 'TrustMyGadget Editorial',
      category || 'Selling Guide',
      readTime || '4 min read',
      isPublished !== undefined ? (isPublished ? 1 : 0) : 1,
      id
    );

    return NextResponse.json({ success: true, message: 'Blog updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Blog ID required' }, { status: 400 });
    }
    db.prepare('DELETE FROM blogs WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Blog deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
