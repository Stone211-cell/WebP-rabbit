import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Query database size from PostgreSQL (Supabase)
export async function GET() {
    try {
        // Query the actual database size from PostgreSQL
        const result: any[] = await prisma.$queryRawUnsafe(`
      SELECT pg_database_size(current_database()) as db_size
    `)

        const dbSizeBytes = Number(result[0]?.db_size || 0)

        // Supabase Free plan = 500MB database
        const maxSizeBytes = 500 * 1024 * 1024 // 500MB

        // Also get table-level breakdown
        const tables: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        relname as table_name,
        pg_total_relation_size(quote_ident(relname)) as total_size
      FROM pg_class
      WHERE relkind = 'r' 
        AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY pg_total_relation_size(quote_ident(relname)) DESC
      LIMIT 10
    `)

        // Also count records per main table
        const counts: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        'stores' as name, COUNT(*)::int as count FROM "Store"
      UNION ALL
      SELECT 'visits', COUNT(*)::int FROM "Visit"
      UNION ALL
      SELECT 'plans', COUNT(*)::int FROM "Plan"
      UNION ALL
      SELECT 'forecasts', COUNT(*)::int FROM "Forecast"
    `)

        return NextResponse.json({
            used: dbSizeBytes,
            max: maxSizeBytes,
            usedMB: Math.round((dbSizeBytes / (1024 * 1024)) * 100) / 100,
            maxMB: 500,
            percentage: Math.round((dbSizeBytes / maxSizeBytes) * 100),
            tables: tables.map((t: any) => ({
                name: t.table_name,
                size: Number(t.total_size)
            })),
            counts: counts.map((c: any) => ({
                name: c.name,
                count: c.count
            }))
        })
    } catch (error) {
        console.error('Storage usage error:', error)
        return NextResponse.json(
            { error: 'Failed to get storage usage', used: 0, max: 500 * 1024 * 1024, percentage: 0, usedMB: 0, maxMB: 500 },
            { status: 200 } // Return 200 with defaults so UI doesn't break
        )
    }
}
