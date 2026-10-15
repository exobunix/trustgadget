import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';
import { mongoGetOrderById, mongoUpdateOrder } from '@/lib/mongo-catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { resolveOrderConditions } = await import('@/lib/order-condition-formatter');

    // 1. Try MongoDB Atlas first
    try {
      const mongoOrder = await mongoGetOrderById(id);
      if (mongoOrder) {
        let parsedCondition: any = {};
        try {
          parsedCondition = typeof mongoOrder.conditionSummary === 'string'
            ? JSON.parse(mongoOrder.conditionSummary)
            : mongoOrder.conditionSummary || {};
        } catch {
          parsedCondition = mongoOrder.conditionSummary || {};
        }

        const resolvedConditions = resolveOrderConditions(mongoOrder.conditionSummary);

        return NextResponse.json(
          {
            success: true,
            data: {
              ...mongoOrder,
              conditionSummary: parsedCondition,
              resolvedConditions,
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
      console.warn('[api/orders/[id]] MongoDB fetch failed, falling back to SQLite:', mErr);
    }

    // 2. Fallback to SQLite
    const order = db.prepare('SELECT * FROM orders WHERE id = ? OR orderNumber = ?').get(id, id) as any;

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const history = db.prepare('SELECT * FROM order_status_history WHERE orderId = ? ORDER BY createdAt ASC').all(order.id);
    const verification = db.prepare('SELECT * FROM verification_records WHERE orderId = ?').get(order.id) as any;

    let parsedCondition: any = {};
    try {
      parsedCondition = order.conditionSummary ? JSON.parse(order.conditionSummary) : {};
    } catch {
      parsedCondition = order.conditionSummary;
    }

    const resolvedConditions = resolveOrderConditions(order.conditionSummary);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...order,
          conditionSummary: parsedCondition,
          resolvedConditions,
          statusHistory: history,
          verificationRecord: verification ? {
            ...verification,
            declaredCondition: JSON.parse(verification.declaredCondition || '{}'),
            verifiedCondition: JSON.parse(verification.verifiedCondition || '{}'),
            inspectionPhotos: verification.inspectionPhotos ? JSON.parse(verification.inspectionPhotos) : [],
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

    // Check order in MongoDB or SQLite
    let order: any = null;
    try {
      order = await mongoGetOrderById(id);
    } catch (e) {}

    if (!order) {
      order = db.prepare('SELECT * FROM orders WHERE id = ? OR orderNumber = ?').get(id, id) as any;
    }

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const updateFields: any = {};
    let historyItem: any = null;

    if (status && status !== order.status) {
      updateFields.status = status;
      historyItem = {
        id: `hist_${Date.now()}`,
        orderId: order.id,
        status,
        note: statusNote || `Status updated to ${status}`,
        changedBy: adminName || 'Admin',
        createdAt: new Date().toISOString(),
      };
      try {
        dbHelpers.updateOrderStatus(order.id, status, statusNote || `Status updated to ${status}`, adminName || 'Admin');
      } catch (e) {}
    }

    if (finalVerifiedPrice !== undefined) {
      updateFields.finalVerifiedPrice = Number(finalVerifiedPrice);
      if (verificationNotes) updateFields.verificationNotes = verificationNotes;
      if (assignedAgent) updateFields.assignedAgent = assignedAgent;
      try {
        dbHelpers.updateOrderFinalPrice(order.id, Number(finalVerifiedPrice), verificationNotes, assignedAgent);
      } catch (e) {}
    }

    if (paymentStatus) {
      updateFields.paymentStatus = paymentStatus;
      try {
        dbHelpers.updateOrderPaymentStatus(order.id, paymentStatus);
      } catch (e) {}
    }

    if (assignedAgent && !finalVerifiedPrice) {
      updateFields.assignedAgent = assignedAgent;
      try {
        db.prepare('UPDATE orders SET assignedAgent = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(assignedAgent, order.id);
      } catch (e) {}
    }

    let verificationData: any = null;
    if (verifiedCondition) {
      verificationData = {
        id: `vrec_${Date.now()}`,
        orderId: order.id,
        verifiedBy: adminName || 'Verification Agent',
        declaredCondition: declaredCondition || {},
        verifiedCondition: verifiedCondition || {},
        priceDelta: priceDelta || 0,
        inspectionNotes: verificationNotes || '',
        inspectionPhotos: inspectionPhotos || [],
        updatedAt: new Date().toISOString(),
      };

      try {
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
      } catch (e) {}
    }

    // Persist changes to MongoDB
    try {
      await mongoUpdateOrder(order.id, updateFields, historyItem, verificationData);
    } catch (mErr) {
      console.warn('[api/orders/[id]] Mongo update failed:', mErr);
    }

    // Log Audit
    try {
      dbHelpers.createAuditLog({
        adminName: adminName || 'Admin Operator',
        action: 'UPDATE_ORDER',
        entityType: 'Order',
        entityId: order.orderNumber,
        details: `Updated order ${order.orderNumber}: status=${status || order.status}, finalPrice=${finalVerifiedPrice ?? order.finalVerifiedPrice}, payment=${paymentStatus || order.paymentStatus}`,
      });
    } catch (e) {}

    const updated = (await mongoGetOrderById(order.id)) || db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id);
    return NextResponse.json({ success: true, data: updated, message: 'Order updated successfully' });
  } catch (error: any) {
    console.error('Order update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

