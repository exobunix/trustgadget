import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    let query = 'SELECT * FROM orders';
    const params: any[] = [];
    const conditions: string[] = [];

    if (userId) {
      conditions.push('userId = ?');
      params.push(userId);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY createdAt DESC LIMIT ?';
    params.push(limit);

    const orders = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      categoryName,
      brandName,
      modelName,
      variantName,
      deviceImageUrl,
      basePrice,
      estimatedPrice,
      payoutMethod,
      payoutUpiId,
      payoutBankAccount,
      payoutBankIfsc,
      payoutBankName,
      pickupDate,
      pickupTimeSlot,
      pickupAddress,
      pickupCity,
      pickupState,
      pickupPincode,
      pickupLandmark,
      pickupNotes,
      conditionSummary,
      userId,
    } = body;

    // Validation
    if (!customerName || !customerPhone || !pickupAddress || !pickupPincode || !pickupDate || !pickupTimeSlot) {
      return NextResponse.json({ success: false, error: 'Missing required customer or pickup details' }, { status: 400 });
    }

    // Generate unique Indian Order Number
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `TMG-${randomDigits}`;
    const id = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const orderData = {
      id,
      orderNumber,
      userId: userId || null,
      customerName,
      customerPhone,
      customerEmail: customerEmail || `${customerPhone.replace(/[^0-9]/g, '')}@trustmygadget.user`,
      categoryName: categoryName || 'Smartphone',
      brandName: brandName || 'Generic',
      modelName: modelName || 'Device',
      variantName: variantName || 'Standard',
      deviceImageUrl: deviceImageUrl || null,
      basePrice: Number(basePrice) || 0,
      estimatedPrice: Number(estimatedPrice) || 0,
      finalVerifiedPrice: null,
      status: 'ORDER_PLACED',
      paymentStatus: 'PENDING',
      payoutMethod: payoutMethod || 'UPI',
      payoutUpiId: payoutUpiId || null,
      payoutBankAccount: payoutBankAccount || null,
      payoutBankIfsc: payoutBankIfsc || null,
      payoutBankName: payoutBankName || null,
      pickupDate,
      pickupTimeSlot,
      pickupAddress,
      pickupCity: pickupCity || 'City',
      pickupState: pickupState || 'State',
      pickupPincode,
      pickupLandmark: pickupLandmark || null,
      pickupNotes: pickupNotes || null,
      conditionSummary: typeof conditionSummary === 'object' ? JSON.stringify(conditionSummary) : conditionSummary || null,
    };

    dbHelpers.createOrder(orderData);

    // Create initial timeline entry
    db.prepare(`
      INSERT INTO order_status_history (id, orderId, status, note, changedBy)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `hist_${Date.now()}`,
      id,
      'ORDER_PLACED',
      'Sell order successfully placed online. Doorstep executive assignment in progress.',
      'Customer'
    );

    return NextResponse.json({
      success: true,
      data: orderData,
      message: 'Order created successfully',
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
