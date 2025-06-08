import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnOrderState,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { TableRow } from "../types";
import { TableHeader } from "./TableHeader";
import { EditableCell } from "./EditableCell";
import { Button } from "../../../components/ui/button";
import { Trash2 } from "lucide-react";

interface DataTableProps {
  data: TableRow[];
  columns: string[];
  columnOrder: ColumnOrderState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  onColumnOrderChange: (order: ColumnOrderState) => void;
  onSortingChange: (sorting: SortingState) => void;
  onColumnFiltersChange: (filters: ColumnFiltersState) => void;
  onColumnVisibilityChange: (visibility: VisibilityState) => void;
  onCellValueChange: (rowId: string, columnId: string, value: string) => void;
  onDeleteRow: (rowId: string) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  columnOrder,
  sorting,
  columnFilters,
  columnVisibility,
  onColumnOrderChange,
  onSortingChange,
  onColumnFiltersChange,
  onColumnVisibilityChange,
  onCellValueChange,
  onDeleteRow,
}) => {
  const columnHelper = createColumnHelper<TableRow>();

  const tableColumns = useMemo(() => {
    return [
      columnHelper.display({
        id: "rowIndex",
        header: "Sl. No.",
        cell: (info) => info.row.index + 1,
        size: 10,
        enableSorting: true,
        sortingFn: "basic",
        sortDescFirst: false,
        enableHiding: false,
      }),
      ...columns.map((col) =>
        columnHelper.accessor((row: TableRow) => row[col] as string, {
          id: col,
          header: col,
          enableSorting: true,
          enableHiding: true,
          filterFn: "includesString",
          cell: ({ row, column }) => (
            <EditableCell
              key={`${row.id}-${column.id}`}
              value={row.getValue(column.id) || ''}
              rowId={row.original.id}
              columnId={column.id}
              updateValue={onCellValueChange}
            />
          ),
        })
      ),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDeleteRow(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
        size: 40,
        enableHiding: false,
      }),
    ];
  }, [columns, onCellValueChange, onDeleteRow]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      columnOrder,
      sorting,
      columnFilters,
      columnVisibility,
    },
    onColumnOrderChange: (updaterOrValue) => {
      if (typeof updaterOrValue === 'function') {
        onColumnOrderChange(updaterOrValue(columnOrder));
      } else {
        onColumnOrderChange(updaterOrValue);
      }
    },
    onSortingChange: (updaterOrValue) => {
      if (typeof updaterOrValue === 'function') {
        onSortingChange(updaterOrValue(sorting));
      } else {
        onSortingChange(updaterOrValue);
      }
    },
    onColumnFiltersChange: (updaterOrValue) => {
      if (typeof updaterOrValue === 'function') {
        onColumnFiltersChange(updaterOrValue(columnFilters));
      } else {
        onColumnFiltersChange(updaterOrValue);
      }
    },
    onColumnVisibilityChange: (updaterOrValue) => {
      if (typeof updaterOrValue === 'function') {
        onColumnVisibilityChange(updaterOrValue(columnVisibility));
      } else {
        onColumnVisibilityChange(updaterOrValue);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableColumnPinning: true,
    enableHiding: true,
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHeader
                    key={header.id}
                    header={header}
                    onColumnReorder={(draggedId, targetId) => {
                      const newColumnOrder = [...columnOrder];
                      const draggedIndex = newColumnOrder.indexOf(draggedId);
                      const targetIndex = newColumnOrder.indexOf(targetId);
                      newColumnOrder.splice(draggedIndex, 1);
                      newColumnOrder.splice(targetIndex, 0, draggedId);
                      onColumnOrderChange(newColumnOrder);
                    }}
                  />
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`p-0 border-b border-gray-200 ${
                      cell.column.id === "rowIndex" ? "bg-gray-100 text-right w-min p-2" : ""
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {table.getRowModel().rows.length === 0 && data.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No rows match the current filters.</p>
        </div>
      )}
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No data available.</p>
        </div>
      )}
    </div>
  );
};