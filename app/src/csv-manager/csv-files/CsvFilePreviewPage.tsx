import React, { useEffect, useState, useRef, WheelEvent, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "wasp/client/operations";
import { getCsvFile, updateCsvFile } from "wasp/client/operations";
import type { UpdateCsvFileInput } from "./actions";
import CsvManagerLayout from "../Layout";
import Header from "../Header";
import { type CsvFile } from "wasp/entities";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { toast } from "sonner";
import { IconContext } from "react-icons/lib";
import { ChevronLeft, GripVertical, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  Column,
  ColumnOrderState,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";

type ExtendedCsvFile = CsvFile & {
  rows: { id: string; rowData: Record<string, string> }[];
  batchType: { name: string; columns: string[] };
};

type TableRow = {
  id: string;
  rowIndex: number;
  [key: string]: string | number;
};

const Cell = React.memo(
  ({
    value,
    rowId,
    columnId,
    updateValue,
  }: {
    value: string;
    rowId: string;
    columnId: string;
    updateValue: (rowId: string, columnId: string, value: string) => void;
  }) => {
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

const EditableCell = React.memo(
  ({ value, rowId, columnId, updateValue }: {
    value: string;
    rowId: string;
    columnId: string;
    updateValue: (rowId: string, columnId: string, value: string) => void;
  }) => {
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

export function CsvFilePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: csvFile, isLoading, error, refetch } = useQuery(getCsvFile, { 
    id: id!,
    onError: (error: Error) => {
      console.error('Error loading CSV file:', error);
      toast.error('Failed to load CSV file');
    }
  }) as {
    data: ExtendedCsvFile | null;
    isLoading: boolean;
    error: any;
    refetch: () => void;
  };

  const [editedData, setEditedData] = useState<{
    fileName: string;
    rows: {
      id: string;
      rowData: Record<string, string>;
      rowIndex: number;
      sortOrder: number;
    }[];
  } | null>(null);
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [draggedColumn, setDraggedColumn] = useState<Column<TableRow> | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const columnHelper = createColumnHelper<TableRow>();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (csvFile) {
      setEditedData({
        fileName: csvFile.fileName,
        rows: csvFile.rows.map((row, index) => ({
          id: row.id,
          rowData: { ...row.rowData },
          rowIndex: index,
          sortOrder: index,
        })),
      });
      setHasUnsavedChanges(false);
    }
  }, [csvFile]);

  const updateCellValue = useCallback((rowId: string, column: string, value: string) => {
    setEditedData((prev) => {
      if (!prev) return null;
      
      const newRows = prev.rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              rowData: {
                ...row.rowData,
                [column]: value,
              },
            }
          : row
      );
      
      return {
        ...prev,
        rows: newRows,
      };
    });
    
    setHasUnsavedChanges(true);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, 2000);
  }, []);

  const handleDeleteRow = useCallback((rowId: string) => {
    setEditedData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        rows: prev.rows.filter((r) => r.id !== rowId),
      };
    });
    setHasUnsavedChanges(true);
    toast.success("Row deleted");
  }, []);

  const handleAutoSave = useCallback(async () => {
    if (!editedData || !csvFile || isSaving) return;
    
    try {
      await saveChanges();
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [editedData, csvFile, isSaving]);

  const saveChanges = useCallback(async () => {
    if (!editedData || !csvFile) return;

    setIsSaving(true);
    
    try {
      const deletedRowIds = csvFile.rows
        .filter((row) => !editedData.rows.find((r) => r.id === row.id))
        .map((row) => row.id);

      const orderedRows = editedData.rows.map((row, index) => ({
        id: row.id,
        rowData: row.rowData,
        sortOrder: index,
      }));

      const updatePayload: UpdateCsvFileInput = {
        id: csvFile.id,
        fileName: editedData.fileName,
        rows: orderedRows,
        deletedRowIds,
      };

      await updateCsvFile(updatePayload);
      
      setHasUnsavedChanges(false);
      toast.success("Changes saved successfully");
      
      refetch();
      
    } catch (error: any) {
      toast.error(error.message || "Failed to save changes");
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [editedData, csvFile, refetch]);

  const handleManualSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    try {
      await saveChanges();
    } catch (error) {
      // Error already handled in saveChanges
    }
  }, [saveChanges]);

  const columns = useMemo(() => {
    if (!csvFile?.batchType.columns) return [];

    return [
      columnHelper.display({
        id: "rowIndex",
        header: "Sl. No.",
        cell: (info) => info.row.index + 1,
        size: 10,
        enableSorting: true,
        sortingFn: "basic",
        sortDescFirst: false,
      }),
      ...csvFile.batchType.columns.map((col) =>
        columnHelper.accessor((row: TableRow) => row[col] as string, {
          id: col,
          header: col,
          enableSorting: true,
          cell: ({ row, column }) => (
            <EditableCell
              key={`${row.id}-${column.id}`}
              value={row.getValue(column.id) || ''}
              rowId={row.original.id}
              columnId={column.id}
              updateValue={updateCellValue}
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
            onClick={() => handleDeleteRow(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
        size: 40,
      }),
    ];
  }, [csvFile?.batchType.columns, updateCellValue, handleDeleteRow]);

  const data = useMemo(() => {
    if (!editedData?.rows) return [];

    return editedData.rows.map((row, index) => ({
      id: row.id,
      rowIndex: index,
      ...row.rowData,
    }));
  }, [editedData?.rows]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnOrder,
      sorting,
    },
    onColumnOrderChange: setColumnOrder,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnPinning: true,
  });

  useEffect(() => {
    if (!csvFile?.batchType.columns) return;
    setColumnOrder(["rowIndex", ...csvFile.batchType.columns, "actions"]);
  }, [csvFile?.batchType.columns]);

  const calculateMinZoom = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return 0.5;
    const containerWidth = containerRef.current.clientWidth;
    const contentWidth = contentRef.current.scrollWidth;
    return Math.min(0.9, containerWidth / contentWidth);
  }, []);

  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.98 : 1.02;
      const minZoom = calculateMinZoom();
      setScale((prev) => Math.min(Math.max(minZoom, prev * delta), 3));
    }
  }, [calculateMinZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 0) {
      setIsDragging(true);
      setStartPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  }, [position]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - startPosition.x,
          y: e.clientY - startPosition.y,
        });
      }
    },
    [isDragging, startPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleExport = useCallback(() => {
    if (!editedData || !csvFile) return;
    const headers = ["Sl. No.", ...csvFile.batchType.columns];
    const csvContent = [
      headers.join(","),
      ...editedData.rows.map((row, index) =>
        headers
          .map((header) => (header === "Sl. No." ? index + 1 : row.rowData[header] || ''))
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${editedData.fileName}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [editedData, csvFile]);

  const reorderColumn = useCallback((draggedId: string, targetId: string) => {
    setColumnOrder((prev) => {
      const newColumnOrder = [...prev];
      const draggedIndex = newColumnOrder.indexOf(draggedId);
      const targetIndex = newColumnOrder.indexOf(targetId);

      newColumnOrder.splice(draggedIndex, 1);
      newColumnOrder.splice(targetIndex, 0, draggedId);

      return newColumnOrder;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!id) {
    return (
      <CsvManagerLayout type="collapsed">
        <div className="flex items-center justify-center h-full">
          <p>No file ID provided</p>
        </div>
      </CsvManagerLayout>
    );
  }

  if (isLoading) {
    return (
      <CsvManagerLayout type="collapsed">
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      </CsvManagerLayout>
    );
  }

  if (error) {
    return (
      <CsvManagerLayout type="collapsed">
        <div className="flex items-center justify-center h-full">
          <p>Error loading file: {error.message}</p>
        </div>
      </CsvManagerLayout>
    );
  }

  if (!csvFile) {
    return (
      <CsvManagerLayout type="collapsed">
        <div className="flex items-center justify-center h-full">
          <p>File not found</p>
        </div>
      </CsvManagerLayout>
    );
  }

  return (
    <CsvManagerLayout type="collapsed">
      <Header
        type="less-padding"
        heading={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)}>
              <IconContext.Provider value={{ size: "20px" }}>
                <ChevronLeft />
              </IconContext.Provider>
            </button>
            <div>
              <Input
                className="!text-xl !border-none p-0"
                value={editedData?.fileName || ''}
                onChange={(e) => {
                  setEditedData((prev) =>
                    prev ? { ...prev, fileName: e.target.value } : null
                  );
                  setHasUnsavedChanges(true);
                }}
              />
              <p className="text-[#D3D1CB] text-[16px] font-semibold">
                {`${editedData?.rows.length || 0} rows`}
                {hasUnsavedChanges && (
                  <span className="text-orange-500 ml-2">• Unsaved changes</span>
                )}
                {isSaving && (
                  <span className="text-blue-500 ml-2">• Saving...</span>
                )}
              </p>
            </div>
          </div>
        }
        leftComponent={
          <div className="flex gap-2">
            <div className="min-w-[150px] max-md:hidden">
              <p className="text-sm text-gray-500">Original Name</p>
              <p className="font-medium">{csvFile.originalName}</p>
            </div>
            <div className="min-w-[150px] max-md:hidden">
              <p className="text-sm text-gray-500">Batch Type</p>
              <p className="font-medium">{csvFile.batchType.name}</p>
            </div>
            <div className="min-w-[150px] max-md:hidden ">
              <p className="text-sm text-gray-500">Upload Date</p>
              <p className="font-medium">
                {new Date(csvFile.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleManualSave} 
                disabled={!hasUnsavedChanges || isSaving}
                className={hasUnsavedChanges ? 'bg-orange-500 hover:bg-orange-600' : ''}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={handleExport}>Export CSV</Button>
            </div>
          </div>
        }
      />
      <div className="relative">
        <style>
          {`
            .drop-target {
              position: relative;
            }
            .drop-target::after {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              bottom: 0;
              width: 2px;
              background-color: #2563eb;
            }
            th[draggable=true] {
              cursor: move;
            }
            th[draggable=true]:hover {
              background-color: rgba(0, 0, 0, 0.02);
            }
            input:focus {
              outline: none;
            }
          `}
        </style>
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-auto">
            <div
              ref={containerRef}
              className="overflow-auto"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div
                ref={contentRef}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "0 0",
                  transition: "transform 0.1s ease-out",
                }}
              >
                <table className="min-w-full border-collapse">
                  <thead className="bg-gray-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider group"
                            style={{ width: header.getSize() }}
                            draggable={header.column.id !== "rowIndex"}
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", header.column.id);
                              setDraggedColumn(header.column);
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
                              reorderColumn(draggedId, targetId);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              {header.column.id !== "rowIndex" && (
                                <GripVertical
                                  className="w-4 h-4 text-gray-400 cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                              )}
                              {header.isPlaceholder ? null : (
                                <div
                                  {...{
                                    className: `flex items-center gap-1 cursor-pointer select-none ${
                                      header.column.getCanSort() ? "hover:text-gray-700" : ""
                                    }`,
                                    onClick:
                                      header.column.id === "rowIndex"
                                        ? () => setSorting([])
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
            </div>
          </div>
        </div>

        <div className="fixed bottom-4 right-4 flex gap-2 z-50">
          <Button
            onClick={() => {
              const minZoom = calculateMinZoom();
              setScale((prev) => Math.min(prev * 1.02, 3));
            }}
            className="rounded-full w-10 h-10 flex items-center justify-center bg-black text-white shadow-lg hover:bg-gray-800"
          >
            +
          </Button>
          <Button
            onClick={() => {
              const minZoom = calculateMinZoom();
              setScale((prev) => Math.max(prev * 0.98, minZoom));
            }}
            className="rounded-full w-10 h-10 flex items-center justify-center bg-black text-white shadow-lg hover:bg-gray-800"
          >
            -
          </Button>
          <Button
            onClick={() => setScale(1)}
            className="rounded-full w-10 h-10 flex items-center justify-center bg-black text-white shadow-lg hover:bg-gray-800"
          >
            R
          </Button>
        </div>
      </div>
    </CsvManagerLayout>
  );
}