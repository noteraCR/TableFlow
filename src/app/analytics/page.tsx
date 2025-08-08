// src/app/analytics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsData {
  totalReservationsToday: number;
  occupiedTables: number;
  totalTables: number;
}

const StatCard = ({ title, value, isLoading }: { title: string, value: string | number, isLoading?: boolean }) => (
    <div className="bg-card border rounded-lg p-6 shadow-md flex flex-col justify-between">
        {isLoading ? (
            <>
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-10 w-1/2" />
            </>
        ) : (
            <>
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <p className="text-4xl font-bold text-foreground mt-2">{value}</p>
            </>
        )}
    </div>
);

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics');
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const occupancy = data ? Math.round((data.occupiedTables / data.totalTables) * 100) : 0;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-12">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-5xl font-bold tracking-tight">Аналитика</h1>
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                &larr; Вернуться к плану зала
            </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                title="Бронирований сегодня" 
                value={data?.totalReservationsToday ?? 0}
                isLoading={loading} 
            />
            <StatCard 
                title="Столиков занято" 
                value={`${data?.occupiedTables ?? 0} / ${data?.totalTables ?? 0}`}
                isLoading={loading} 
            />
            <StatCard 
                title="Загрузка зала" 
                value={`${occupancy}%`} 
                isLoading={loading}
            />
        </div>
      </div>
    </main>
  );
}