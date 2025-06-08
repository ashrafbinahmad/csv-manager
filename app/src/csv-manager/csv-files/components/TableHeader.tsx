import React from "react";
import { GripVertical, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Header, flexRender } from "@tanstack/react-table";
import { TableRow } from "../types";

interface TableHeaderProps {
  header: Header<TableRow, unknown>;
  onColumnReorder: (draggedId: string, targetId: string) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  header,
  onColumnReorder,
}) => {
  return (
    <th
      key={header.id}
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider group"
      style={{ width: header.getSize() }}
      draggable={header.column.id !== "rowIndex"}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", header.column.id);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (header.column.id === "rowIndex") return;
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
        {header.column.id !== "rowIndex" && (
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        {header.isPlaceholder ? null : (
          <div
            {...{
              className: `flex items-center gap-1 cursor-pointer select-none ${
                header.column.getCanSort() ? "hover:text-gray-700" : ""
              }`,
              onClick:
                header.column.id === "rowIndex"
                  ? () => header.column.clearSorting()
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
  );
}; 