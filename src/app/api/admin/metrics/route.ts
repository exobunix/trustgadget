import { NextResponse } from 'next/server';
import { db, dbHelpers } from '@/lib/db';
import { mongoGetAllModels } from '@/lib/mongo-catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    // Reconcile model and configuration count with MongoDB if online
    let liveModelsCount = metrics.totalModels;
    let liveConfigurationsCount = metrics.totalConfigurations;

    try {
      const mongoModels = await mongoGetAllModels();
      if (mongoModels && mongoModels.length > 0) {
        liveModelsCount = mongoModels.length;
        let countConfigs = 0;
        for (const m of mongoModels) {
          if (m.variants && m.variants.length > 0) {
            countConfigs += m.variants.length;
          } else {
            countConfigs += 1;
          }
        }
        liveConfigurationsCount = countConfigs;
      }
    } catch (e) {}

    return NextResponse.json(
      {
        success: true,
        data: {
          ...metrics,
          totalModels: liveModelsCount,
          totalConfigurations: liveConfigurationsCount,
          statusCounts,
          topBrands,
        },
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
