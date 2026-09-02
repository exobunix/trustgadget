import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { uploadToImageKit } from '@/lib/imagekit';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. First attempt direct upload to ImageKit (folder: "trust gadget/{folder}")
    try {
      const ext = path.extname(file.name) || '.png';
      const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      const ikResult = await uploadToImageKit(buffer, cleanFileName, folder);

      if (ikResult.success && ikResult.url) {
        return NextResponse.json({
          success: true,
          url: ikResult.url,
          provider: 'imagekit',
          fileId: ikResult.fileId,
          thumbnailUrl: ikResult.thumbnailUrl,
        });
      }
    } catch (ikErr) {
      console.warn('ImageKit upload encountered an issue, falling back to local storage:', ikErr);
    }

    // 2. Fallback to local uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.png';
    const cleanName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, cleanName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${folder}/${cleanName}`;
    return NextResponse.json({ success: true, url: publicUrl, provider: 'local' });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
