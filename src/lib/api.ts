// src/lib/api.ts
import { supabase } from './supabaseClient';
import { Table, TableStatus, Reservation } from './types';

// --- Функции для Столиков ---

/**
 * Получить все столики
 */
export const getTables = async (): Promise<Table[]> => {
  const { data, error } = await supabase.from('tables').select('*').order('table_number');
  if (error) {
    console.error('Error fetching tables:', error);
    throw new Error(error.message);
  }
  return data || [];
};

/**
 * Обновить статус столика
 * @param id - ID столика
 * @param status - Новый статус
 */
export const updateTableStatus = async (id: number, status: TableStatus): Promise<Table> => {
  const { data, error } = await supabase
    .from('tables')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating table status:', error);
    throw new Error(error.message);
  }
  return data;
};


// --- Функции для Бронирований ---

/**
 * Получить все бронирования
 */
export const getReservations = async (): Promise<Reservation[]> => {
    const { data, error } = await supabase.from('reservations').select('*');
    if (error) {
      console.error('Error fetching reservations:', error);
      throw new Error(error.message);
    }
    return data || [];
  };

/**
 * Создать новое бронирование
 * @param reservationData - Данные для нового бронирования
 */
export const createReservation = async (reservationData: Omit<Reservation, 'id'>): Promise<Reservation> => {
  const { data, error } = await supabase
    .from('reservations')
    .insert([reservationData])
    .select()
    .single();

  if (error) {
    console.error('Error creating reservation:', error);
    throw new Error(error.message);
  }
  return data;
};

/**
 * Получить активное (последнее) бронирование для столика
 * @param tableId - ID столика
 */
export const getActiveReservationForTable = async (tableId: number): Promise<Reservation | null> => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('table_id', tableId)
      .order('created_at', { ascending: false }) // Берем самое новое
      .limit(1)
      .single(); // Ожидаем один объект или null
  
    if (error && error.code !== 'PGRST116') { // Игнорируем ошибку "не найдено строк"
      console.error('Error fetching active reservation:', error);
      throw new Error(error.message);
    }
  
    return data;
  };

/**
 * Отменить (удалить) бронирование
 * @param id - ID бронирования
 */
export const deleteReservation = async (id: number): Promise<void> => {
  const { error } = await supabase.from('reservations').delete().eq('id', id);

  if (error) {
    console.error('Error deleting reservation:', error);
    throw new Error(error.message);
  }
};