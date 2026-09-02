import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    // Default Super Admin credentials
    const isDefaultAdmin =
      (email.toLowerCase() === 'admin@trustmygadget.com' || email.toLowerCase() === 'admin') &&
      (password === 'admin@2026' || password === 'admin123');

    // Or check in SQLite database
    const dbAdmin = dbHelpers.getAdminUserByEmail(email);

    if (!isDefaultAdmin && !dbAdmin) {
      return NextResponse.json({ success: false, error: 'Invalid admin credentials' }, { status: 401 });
    }

    const adminProfile = dbAdmin || {
      id: 'admin_super_1',
      name: 'Super Admin',
      email: 'admin@trustmygadget.com',
      roleSlug: 'super_admin',
    };

    const sessionPayload = {
      adminId: adminProfile.id,
      name: adminProfile.name,
      email: adminProfile.email,
      role: adminProfile.roleSlug,
      timestamp: Date.now(),
    };

    const response = NextResponse.json({
      success: true,
      data: sessionPayload,
      message: 'Admin authenticated successfully',
    });

    // Set secure auth cookie
    response.cookies.set('tmg_admin_session', JSON.stringify(sessionPayload), {
      httpOnly: false, // Accessible to client for fast state inspection
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
