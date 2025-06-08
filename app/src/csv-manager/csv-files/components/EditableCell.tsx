import React, { useRef, useState, useEffect, useCallback } from "react";
import { Input } from "../../../components/ui/input";

interface CellProps {
  value: string;
  rowId: string;
  columnId: string;
  updateValue: (rowId: string, columnId: string, value: string) => void;
}

const Cell = React.memo(
  ({ value, rowId, columnId, updateValue }: CellProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = useState(value);
    const updateTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key.startsWith("Arrow")) {
          e.preventDefault();
          e.stopPropagation();

          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
            updateValue(rowId, columnId, localValue);
          }

          const currentCell = e.currentTarget;
          const currentRow = currentCell.closest("tr");
          if (!currentRow) return;

          const cells = Array.from(currentRow.cells);
          const currentCellIndex = cells.findIndex((cell) => cell.contains(currentCell));

          let nextInput: HTMLInputElement | null = null;

          switch (e.key) {
            case "Enter":
              const nextRow = currentRow.nextElementSibling as HTMLTableRowElement;
              if (nextRow) {
                nextInput = nextRow.cells[currentCellIndex]?.querySelector("input");
              }
              break;
            case "ArrowUp":
              const prevRow = currentRow.previousElementSibling as HTMLTableRowElement;
              if (prevRow) {
                nextInput = prevRow.cells[currentCellIndex]?.querySelector("input");
              }
              break;
            case "ArrowDown":
              const downRow = currentRow.nextElementSibling as HTMLTableRowElement;
              if (downRow) {
                nextInput = downRow.cells[currentCellIndex]?.querySelector("input");
              }
              break;
            case "ArrowLeft":
              if (currentCellIndex > 0) {
                nextInput = cells[currentCellIndex - 1]?.querySelector("input");
              }
              break;
            case "ArrowRight":
              if (currentCellIndex < cells.length - 1) {
                nextInput = cells[currentCellIndex + 1]?.querySelector("input");
              }
              break;
          }

          if (nextInput) {
            e.currentTarget.blur();
            nextInput.focus();
            nextInput.select();
          }
        }
      },
      [updateValue, rowId, columnId, localValue]
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(() => {
          updateValue(rowId, columnId, newValue);
        }, 300);
      },
      [updateValue, rowId, columnId]
    );

    const handleBlur = useCallback(() => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateValue(rowId, columnId, localValue);
      }
    }, [updateValue, rowId, columnId, localValue]);

    useEffect(() => {
      return () => {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
      };
    }, []);

    return (
      <Input
        ref={inputRef}
        onFocus={(e) => e.target.select()}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        data-row={rowId}
        data-col={columnId}
        className="px-6 py-4 rounded-none m-0 border-0 h-[39px] focus:border-2 focus:border-black focus:ring-0 focus:outline-none"
        value={localValue}
        onChange={handleChange}
      />
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.rowId === nextProps.rowId &&
      prevProps.columnId === nextProps.columnId
    );
  }
);

export const EditableCell = React.memo(
  ({ value, rowId, columnId, updateValue }: CellProps) => {
    return (
      <Cell
        key={`${rowId}-${columnId}`}
        value={value}
        rowId={rowId}
        columnId={columnId}
        updateValue={updateValue}
      />
    );
  }
); 