import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = db.prepare('SELECT * FROM orders WHERE id = ? OR orderNumber = ?').get(id, id) as any;

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const history = db.prepare('SELECT * FROM order_status_history WHERE orderId = ? ORDER BY createdAt ASC').all(order.id);
    const verification = db.prepare('SELECT * FROM verification_records WHERE orderId = ?').get(order.id) as any;

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        conditionSummary: order.conditionSummary ? JSON.parse(order.conditionSummary) : {},
        statusHistory: history,
        verificationRecord: verification ? {
          ...verification,
          declaredCondition: JSON.parse(verification.declaredCondition || '{}'),
          verifiedCondition: JSON.parse(verification.verifiedCondition || '{}'),
          inspectionPhotos: verification.inspectionPhotos ? JSON.parse(verification.inspectionPhotos) : [],
        } : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      status,
      finalVerifiedPrice,
      paymentStatus,
      assignedAgent,
      verificationNotes,
      statusNote,
      adminName,
      declaredCondition,
      verifiedCondition,
      priceDelta,
      inspectionPhotos,
    } = body;

    const order = db.prepare('SELECT * FROM orders WHERE id = ? OR orderNumber = ?').get(id, id) as any;
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (status && status !== order.status) {
      dbHelpers.updateOrderStatus(order.id, status, statusNote || `Status updated to ${status}`, adminName || 'Admin');
    }

    if (finalVerifiedPrice !== undefined) {
      dbHelpers.updateOrderFinalPrice(order.id, Number(finalVerifiedPrice), verificationNotes, assignedAgent);
    }

    if (paymentStatus) {
      dbHelpers.updateOrderPaymentStatus(order.id, paymentStatus);
    }

    if (assignedAgent && !finalVerifiedPrice) {
      db.prepare('UPDATE orders SET assignedAgent = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(assignedAgent, order.id);
    }

    // Physical Verification Studio Record
    if (verifiedCondition) {
      const existing = db.prepare('SELECT id FROM verification_records WHERE orderId = ?').get(order.id);
      if (existing) {
        db.prepare(`
          UPDATE verification_records
          SET verifiedBy = ?, declaredCondition = ?, verifiedCondition = ?, priceDelta = ?, inspectionNotes = ?, inspectionPhotos = ?, updatedAt = CURRENT_TIMESTAMP
          WHERE orderId = ?
        `).run(
          adminName || 'Verification Agent',
          JSON.stringify(declaredCondition || {}),
          JSON.stringify(verifiedCondition || {}),
          priceDelta || 0,
          verificationNotes || '',
          JSON.stringify(inspectionPhotos || []),
          order.id
        );
      } else {
        db.prepare(`
          INSERT INTO verification_records (id, orderId, verifiedBy, declaredCondition, verifiedCondition, priceDelta, inspectionNotes, inspectionPhotos)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          `vrec_${Date.now()}`,
          order.id,
          adminName || 'Verification Agent',
          JSON.stringify(declaredCondition || {}),
          JSON.stringify(verifiedCondition || {}),
          priceDelta || 0,
          verificationNotes || '',
          JSON.stringify(inspectionPhotos || [])
        );
      }
    }

    // Log Audit
    dbHelpers.createAuditLog({
      adminName: adminName || 'Admin Operator',
      action: 'UPDATE_ORDER',
      entityType: 'Order',
      entityId: order.orderNumber,
      details: `Updated order ${order.orderNumber}: status=${status || order.status}, finalPrice=${finalVerifiedPrice ?? order.finalVerifiedPrice}, payment=${paymentStatus || order.paymentStatus}`,
    });

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id);
    return NextResponse.json({ success: true, data: updated, message: 'Order updated successfully' });
  } catch (error: any) {
    console.error('Order update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
