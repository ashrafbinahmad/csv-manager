import React from "react";
import { GripVertical, ArrowUpDown, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { Header, flexRender } from "@tanstack/react-table";
import { TableRow } from "../types";
import * as ContextMenu from '@radix-ui/react-context-menu';

interface TableHeaderProps {
  header: Header<TableRow, unknown>;
  onColumnReorder: (draggedId: string, targetId: string) => void;
  onToggleAllColumns: (visible: boolean) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  header,
  onColumnReorder,
  onToggleAllColumns,
}) => {
  const isRowIndex = header.column.id === "rowIndex";
  const table = header.getContext().table;
  const allColumns = table.getAllColumns();
  const visibleColumns = allColumns.filter(col => col.getIsVisible());
  const hiddenColumns = allColumns.filter(col => !col.getIsVisible() && col.id !== "rowIndex");

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <th
          key={header.id}
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider group"
          style={{ width: header.getSize() }}
          draggable={!isRowIndex}
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", header.column.id);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (isRowIndex) return;
            e.currentTarget.classList.add("drop-target");
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("drop-target");
          }}
          onDrop={(e) => {
            e.preventDefault();
            const draggedId = e.dataTransfer.getData("text/plain");
            const targetId = header.column.id;

            if (draggedId === targetId || targetId === "rowIndex") return;

            e.currentTarget.classList.remove("drop-target");
            onColumnReorder(draggedId, targetId);
          }}
        >
          <div className="flex items-center gap-2">
            {!isRowIndex && (
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
            {header.isPlaceholder ? null : (
              <div
                {...{
                  className: `flex items-center gap-1 cursor-pointer select-none ${
                    header.column.getCanSort() ? "hover:text-gray-700" : ""
                  }`,
                  onClick:
                    isRowIndex
                      ? () => {
                          header.column.clearSorting();
                          header.getContext().table.resetSorting();
                        }
                      : header.column.getToggleSortingHandler(),
                }}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {{
                  asc: <ArrowUp className="w-4 h-4 text-gray-400" />,
                  desc: <ArrowDown className="w-4 h-4 text-gray-400" />,
                }[header.column.getIsSorted() as string] ?? (
                  header.column.getCanSort() ? (
                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  ) : null
                )}
              </div>
            )}
          </div>
        </th>
      </ContextMenu.Trigger>

      {!isRowIndex && (
        <ContextMenu.Portal>
          <ContextMenu.Content className="min-w-[220px] bg-white rounded-md shadow-lg border border-gray-200 p-1">
            <ContextMenu.Item
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
              onClick={() => header.column.toggleVisibility()}
            >
              {header.column.getIsVisible() ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide Column
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Show Column
                </>
              )}
            </ContextMenu.Item>

            {hiddenColumns.length > 0 && (
              <ContextMenu.Item
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => onToggleAllColumns(true)}
              >
                <Eye className="w-4 h-4" />
                Show All Columns
              </ContextMenu.Item>
            )}

            {visibleColumns.length > 1 && (
              <ContextMenu.Item
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => onToggleAllColumns(false)}
              >
                <EyeOff className="w-4 h-4" />
                Hide All Columns
              </ContextMenu.Item>
            )}
          </ContextMenu.Content>
        </ContextMenu.Portal>
      )}
    </ContextMenu.Root>
  );
}; 