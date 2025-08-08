// src/app/components/BookingForm.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table } from '@/lib/types';

const formSchema = z.object({
  customer_name: z.string().min(2, { message: 'Имя должно быть не короче 2 символов.' }),
  phone_number: z.string().min(10, { message: 'Введите корректный номер телефона.' }),
  guest_count: z.number().int().positive({ message: 'Укажите количество гостей.' }),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BookingFormProps {
  table: Table;
  onBookingSuccess: () => void;
  onFormSubmit: (data: FormData) => Promise<void>;
}

export function BookingForm({ table, onBookingSuccess, onFormSubmit }: BookingFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: '',
      phone_number: '',
      guest_count: 1,
      notes: '',
    },
  });

  async function onSubmit(values: FormData) {
    try {
      await onFormSubmit(values);
      onBookingSuccess();
    } catch (error) {
      console.error("Failed to submit booking:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-lg font-medium">Бронь на столик №{table.table_number}</h3>
        <FormField
          control={form.control}
          name="customer_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя гостя</FormLabel>
              <FormControl>
                <Input placeholder="Иван Петров" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Номер телефона</FormLabel>
              <FormControl>
                <Input placeholder="+7 (999) 123-45-67" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="guest_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Количество гостей (стол на {table.capacity})</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => {
                    const value = parseInt(e.target.value) || 0;
                    field.onChange(value);
                  }}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Особые пожелания</FormLabel>
              <FormControl>
                <Input placeholder="Например, детский стул" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Сохранение...' : 'Забронировать'}
        </Button>
      </form>
    </Form>
  );
}