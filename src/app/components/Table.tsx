// src/app/components/Table.tsx
import React from 'react';
import { Table as TableType, TableStatus } from '@/lib/types';
import { cn } from "@/lib/utils";

const statusStyles: Record<TableStatus, string> = {
  available: 'bg-status-available hover:bg-status-available/80',
  occupied: 'bg-status-occupied hover:bg-status-occupied/80', 
  reserved: 'bg-status-reserved hover:bg-status-reserved/80',
};

const statusLabels: Record<TableStatus, string> = {
  available: 'Свободен',
  occupied: 'Занят', 
  reserved: 'Резерв',
};

interface TableProps {
  table: TableType;
  onClick: (table: TableType) => void;
}

export const TableComponent: React.FC<TableProps> = ({ table, onClick }) => {
  return (
    <div
      onClick={() => onClick(table)}
      className={cn(
        "flex flex-col items-center justify-center w-28 h-28 m-2 rounded-lg shadow-lg cursor-pointer transition-all duration-200 text-white font-bold transform hover:scale-105",
        statusStyles[table.status]
      )}
    >
      <div className="text-2xl">№{table.table_number}</div>
      <div className="text-sm font-normal">({table.capacity} чел.)</div>
      <div className="text-xs font-semibold uppercase mt-1 tracking-wider">{statusLabels[table.status]}</div>
    </div>
  );
};