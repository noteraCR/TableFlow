// src/lib/types.ts

export type TableStatus = 'available' | 'occupied' | 'reserved';

export interface Table {
  id: number;
  table_number: number;
  capacity: number;
  status: TableStatus;
}

export interface Reservation {
  id?: number;
  table_id: number;
  customer_name: string;
  phone_number: string;
  guest_count: number;
  reservation_time: string; // ISO 8601 string
  notes?: string;
}