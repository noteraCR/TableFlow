// src/app/api/analytics/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { count: totalReservationsToday, error: reservationsError } = await supabase
            .from('reservations')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString())
            .lt('created_at', tomorrow.toISOString());
        
        if (reservationsError) throw reservationsError;

        const { data: tablesData, error: tablesError } = await supabase
            .from('tables')
            .select('status');

        if (tablesError) throw tablesError;

        const totalTables = tablesData.length;
        const occupiedTables = tablesData.filter(t => t.status === 'occupied' || t.status === 'reserved').length;
        
        const analyticsData = {
            totalReservationsToday: totalReservationsToday ?? 0,
            occupiedTables,
            totalTables
        };

        return NextResponse.json(analyticsData);

    } catch (error) {
        console.error('Analytics API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(
            JSON.stringify({ error: 'Failed to fetch analytics data', details: errorMessage }),
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';