import { NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';

export async function GET() {
  try {
    const metrics = dbHelpers.getDashboardMetrics();
    
    // Additional analytics: Orders grouped by status
    const statusCounts = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status
    `).all();

    // Top brands by order volume
    const topBrands = db.prepare(`
      SELECT brandName, COUNT(*) as count, SUM(estimatedPrice) as totalValue 
      FROM orders 
      GROUP BY brandName 
      ORDER BY count DESC 
      LIMIT 5
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        ...metrics,
        statusCounts,
        topBrands,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
