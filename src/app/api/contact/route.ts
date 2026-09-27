import { NextRequest, NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, subject, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json({ success: false, error: 'Name, phone number, and message are required.' }, { status: 400 });
    }

    // Client IP and User Agent extraction
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfIp = req.headers.get('cf-connecting-ip');
    const clientIp = (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || realIp || cfIp || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Consent Validation
    const consentGiven = body.consentGiven === true || body.consentGiven === 1 || body.agreedToPartnerConsent === true;
    const consentText = body.consentText || 'I agree that my details (name, phone, email, address) will be shared with our partner representative who will contact/visit me on behalf of Trust Gadget.';

    if (!consentGiven) {
      return NextResponse.json({
        success: false,
        error: 'Consent to share your details with our partner representative is required before submitting.',
      }, { status: 400 });
    }

    const ticketId = `tkt_${Date.now()}`;
    const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    // Store in support_tickets & support_messages
    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO support_tickets (id, ticketNumber, customerName, customerPhone, customerEmail, orderNumber, subject, status, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', 'MEDIUM')
      `).run(ticketId, ticketNumber, name.trim(), phone.trim(), email?.trim() || null, null, subject?.trim() || 'General Customer Enquiry');

      db.prepare(`
        INSERT INTO support_messages (id, ticketId, sender, senderName, message)
        VALUES (?, ?, 'CUSTOMER', ?, ?)
      `).run(`msg_${Date.now()}`, ticketId, name.trim(), message.trim());
    });

    transaction();

    // Log Consent with Timestamp + IP + Exact Text Shown
    dbHelpers.logConsent({
      submissionType: 'CONTACT_ENQUIRY',
      referenceId: ticketId,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerEmail: email?.trim() || null,
      pickupAddress: null,
      consentText,
      consentGiven: 1,
      ipAddress: clientIp,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      data: {
        ticketId,
        ticketNumber,
        confirmationMessage: `Thanks ${name.trim()}, Our team will contact you within 2 hours. To verify any visit, check our verification helpline at +91 91139 90217.`,
      },
      message: 'Enquiry submitted successfully',
    });
  } catch (e: any) {
    console.error('Contact enquiry error:', e);
    return NextResponse.json({ success: false, error: e.message || 'Server error' }, { status: 500 });
  }
}
