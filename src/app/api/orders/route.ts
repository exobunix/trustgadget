import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    if (status && status !== 'ALL') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY createdAt DESC LIMIT ?';
    params.push(limit);

    const orders = db.prepare(query).all(...params);
    return NextResponse.json(
      { success: true, data: orders },
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

    // Client IP and User Agent extraction for audit/compliance
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfIp = request.headers.get('cf-connecting-ip');
    const clientIp = (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || realIp || cfIp || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Verify Consent
    const consentText = body.consentText || 'I agree that my details (name, phone, email, address) will be shared with our partner representative who will contact/visit me on behalf of Trust Gadget.';
    const consentGiven = body.consentGiven === true || body.consentGiven === 1 || body.agreedToPartnerConsent === true;

    if (!consentGiven) {
      return NextResponse.json({
        success: false,
        error: 'Consent to share your details with our verified partner representative is required to schedule a pickup.',
      }, { status: 400 });
    }

    const consentTimestamp = body.consentTimestamp || new Date().toISOString();

    // Generate unique Indian Order Number
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `TMG-${randomDigits}`;
    const id = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Ensure user exists in users table to prevent any foreign key failures
    let validUserId: string | null = null;
    if (userId) {
      try {
        const u = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
        if (u) validUserId = userId;
      } catch (e) {}
    }

    if (!validUserId && customerPhone) {
      const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
      if (cleanPhone) {
        try {
          const uByPhone = db.prepare('SELECT id FROM users WHERE phone = ?').get(cleanPhone) as any;
          if (uByPhone) {
            validUserId = uByPhone.id;
          } else {
            const newUserId = userId || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            const userEmail = customerEmail || `${cleanPhone}@trustmygadget.user`;
            db.prepare(`
              INSERT INTO users (id, name, email, phone, role, isBlocked)
              VALUES (?, ?, ?, ?, 'CUSTOMER', 0)
            `).run(newUserId, customerName, userEmail, cleanPhone);
            validUserId = newUserId;
          }
        } catch (e) {
          validUserId = null;
        }
      }
    }

    const orderData = {
      id,
      orderNumber,
      userId: validUserId,
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
      consentGiven: 1,
      consentText,
      consentTimestamp,
      consentIp: clientIp,
      userAgent,
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
