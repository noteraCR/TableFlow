// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import * as api from '@/lib/api';
import { Table as TableType, Reservation } from '@/lib/types';
import { TableComponent } from '@/app/components/Table';
import { BookingForm } from '@/app/components/BookingForm';
import Link from 'next/link';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { toast } from "sonner";

export default function Home() {
  const [tables, setTables] = useState<TableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTableClick = (table: TableType) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const handleWalkIn = async (table: TableType) => {
    try {
        await api.updateTableStatus(table.id, 'occupied');
        toast.success("Успех!", { description: `Гость посажен за столик №${table.table_number}` });
        closeModal();
    } catch(_error) {
        toast.error("Ошибка!", { description: `Не удалось посадить гостя.` });
    }
  };
  
  const handleFreeUp = async (table: TableType) => {
    try {
        await api.updateTableStatus(table.id, 'available');
        toast.success("Успех!", { description: `Столик №${table.table_number} освобожден.` });
        closeModal();
    } catch(_error) {
        toast.error("Ошибка!", { description: `Не удалось освободить столик.` });
    }
  };

  const handleBookingSubmit = async (formData: Omit<Reservation, 'id' | 'table_id' | 'reservation_time'>) => {
    if (!selectedTable) return;
  
    const reservationData = {
      ...formData,
      table_id: selectedTable.id,
      reservation_time: new Date().toISOString(),
    };
  
    try {
      await api.createReservation(reservationData);
      await api.updateTableStatus(selectedTable.id, 'reserved');
      toast.success("Успех!", { description: `Столик №${selectedTable.table_number} забронирован.` });
    } catch (error) {
        toast.error("Ошибка!", { description: `Не удалось создать бронь.` });
        throw error;
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
  };

  useEffect(() => {
    const fetchInitialTables = async () => {
      setLoading(true);
      api.getTables().then(setTables).catch(console.error).finally(() => setLoading(false));
    };
    fetchInitialTables();

    const channel = supabase
      .channel('tables_realtime_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, 
        (payload) => {
          console.log('Change received!', payload);
          api.getTables().then(setTables);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);


  if (loading) return <div className="flex items-center justify-center min-h-screen">Загрузка плана зала...</div>;

  return (
    <>
      <main className="relative flex min-h-screen flex-col items-center p-8 md:p-12">
        <div className="absolute top-8 right-8">
            <Link href="/analytics" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Перейти к аналитике &rarr;
            </Link>
        </div>
        
        <h1 className="text-5xl font-bold mb-10 tracking-tight">План Зала</h1>
        <div className="flex flex-wrap justify-center gap-4">
          {tables.map((table) => (
            <TableComponent key={table.id} table={table} onClick={handleTableClick} />
          ))}
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Управление столиком №{selectedTable?.table_number}</DialogTitle>
            {selectedTable?.status === 'available' && (
              <DialogDescription>
                Выберите действие: посадить гостя без брони или создать новое бронирование.
              </DialogDescription>
            )}
            {selectedTable?.status !== 'available' && (
              <DialogDescription>
                Столик занят или зарезервирован. Вы можете освободить его.
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedTable && (
            <div>
              {selectedTable.status === 'available' && (
                <div className="flex flex-col space-y-4 pt-4">
                    <Button onClick={() => handleWalkIn(selectedTable)}>Посадить гостя (Walk-in)</Button>
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                            Или
                            </span>
                        </div>
                    </div>
                    <BookingForm 
                        table={selectedTable} 
                        onBookingSuccess={closeModal} 
                        onFormSubmit={handleBookingSubmit}
                    />
                </div>
              )}
              {selectedTable.status !== 'available' && (
                 <Button onClick={() => handleFreeUp(selectedTable)} variant="destructive" className="w-full mt-4">
                    Освободить столик
                 </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}