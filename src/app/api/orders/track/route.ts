import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mongoTrackOrder } from '@/lib/mongo-catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ success: false, error: 'Query parameter is required' }, { status: 400 });
    }

    const cleanQuery = query.trim();

    // 1. Try MongoDB Atlas first
    try {
      const mongoOrder = await mongoTrackOrder(cleanQuery);
      if (mongoOrder) {
        let parsedCondition: any = {};
        try {
          parsedCondition = typeof mongoOrder.conditionSummary === 'string'
            ? JSON.parse(mongoOrder.conditionSummary)
            : mongoOrder.conditionSummary || {};
        } catch {
          parsedCondition = mongoOrder.conditionSummary || {};
        }

        return NextResponse.json(
          {
            success: true,
            data: {
              ...mongoOrder,
              conditionSummary: parsedCondition,
              statusHistory: mongoOrder.statusHistory || [],
              verificationRecord: mongoOrder.verificationRecord || null,
            },
          },
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          }
        );
      }
    } catch (mErr) {
      console.warn('[api/orders/track] MongoDB query failed, falling back to SQLite:', mErr);
    }

    // 2. Fallback to SQLite
    const order = db.prepare(`
      SELECT * FROM orders 
      WHERE orderNumber = ? OR customerPhone LIKE ? OR id = ?
      ORDER BY createdAt DESC LIMIT 1
    `).get(cleanQuery, `%${cleanQuery}%`, cleanQuery) as any;

    if (!order) {
      return NextResponse.json({ success: false, error: 'No order found with this Order ID or Phone Number' }, { status: 404 });
    }

    const history = db.prepare('SELECT * FROM order_status_history WHERE orderId = ? ORDER BY createdAt ASC').all(order.id);
    const verification = db.prepare('SELECT * FROM verification_records WHERE orderId = ?').get(order.id) as any;

    return NextResponse.json(
      {
        success: true,
        data: {
          ...order,
          conditionSummary: order.conditionSummary ? JSON.parse(order.conditionSummary) : {},
          statusHistory: history,
          verificationRecord: verification ? {
            ...verification,
            declaredCondition: JSON.parse(verification.declaredCondition || '{}'),
            verifiedCondition: JSON.parse(verification.verifiedCondition || '{}'),
          } : null,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
