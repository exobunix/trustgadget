import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { code, deviceValue } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Enter a coupon code' }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND isActive = 1').get(cleanCode) as any;

    if (!coupon) {
      // Default fallback sample coupons if database has not been seeded with custom coupons
      if (cleanCode === 'EXTRA1000') {
        return NextResponse.json({
          success: true,
          data: {
            code: 'EXTRA1000',
            bonusAmount: 1000,
            title: '₹1,000 Special Exchange Bonus',
          },
        });
      }
      if (cleanCode === 'BONUS500') {
        return NextResponse.json({
          success: true,
          data: {
            code: 'BONUS500',
            bonusAmount: 500,
            title: '₹500 Instant Cashback Bonus',
          },
        });
      }
      return NextResponse.json({ success: false, error: 'Invalid or expired coupon code' }, { status: 404 });
    }

    const val = Number(deviceValue) || 0;
    if (coupon.minDeviceValue && val < coupon.minDeviceValue) {
      return NextResponse.json({
        success: false,
        error: `Coupon valid on minimum device value of ₹${coupon.minDeviceValue.toLocaleString('en-IN')}`,
      }, { status: 400 });
    }

    let bonus = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      bonus = Math.round((val * coupon.discountValue) / 100);
      if (coupon.maxBonus && bonus > coupon.maxBonus) {
        bonus = coupon.maxBonus;
      }
    } else {
      bonus = coupon.discountValue;
    }

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        bonusAmount: bonus,
        title: coupon.title,
      },
      message: `Coupon ${coupon.code} applied successfully!`,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
