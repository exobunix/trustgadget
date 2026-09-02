import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';

export async function GET() {
  try {
    const settings = dbHelpers.getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, adminName } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ success: false, error: 'Key and Value are required' }, { status: 400 });
    }

    dbHelpers.updateSetting(key, String(value));

    dbHelpers.createAuditLog({
      adminName: adminName || 'Admin User',
      action: 'UPDATE_SETTING',
      entityType: 'Setting',
      entityId: key,
      details: `Updated platform configuration setting "${key}" to "${value}"`,
    });

    return NextResponse.json({ success: true, message: 'Setting updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
