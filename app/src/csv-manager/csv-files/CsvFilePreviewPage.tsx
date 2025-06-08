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
import { ChevronLeft, Filter } from "lucide-react";
import {
  ColumnOrderState,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { FilterPanel } from "./components/FilterPanel";
import { DataTable } from "./components/DataTable";
import { ColumnVisibility } from "./components/ColumnVisibility";
import { TableRow, FilterState } from "./types";

type ExtendedCsvFile = CsvFile & {
  rows: { id: string; rowData: Record<string, string> }[];
  batchType: { name: string; columns: string[] };
};

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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [filters, setFilters] = useState<FilterState>({});
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
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
      
      const initialVisibility: VisibilityState = {};
      csvFile.batchType.columns.forEach(col => {
        initialVisibility[col] = true;
      });
      setColumnVisibility(initialVisibility);
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
    }
  }, [saveChanges]);

  const handleFilterChange = useCallback((columnId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value
    }));

    setColumnFilters(prev => {
      const existingFilter = prev.find(f => f.id === columnId);
      if (value === '') {
        return prev.filter(f => f.id !== columnId);
      }
      if (existingFilter) {
        return prev.map(f => f.id === columnId ? { ...f, value } : f);
      }
      return [...prev, { id: columnId, value }];
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setColumnFilters([]);
  }, []);

  const handleColumnVisibilityChange = useCallback((columnId: string, visible: boolean) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: visible
    }));
  }, []);

  const handleToggleAllColumns = useCallback((visible: boolean) => {
    if (!csvFile?.batchType.columns) return;
    
    const newVisibility: VisibilityState = {};
    csvFile.batchType.columns.forEach(col => {
      newVisibility[col] = visible;
    });
    setColumnVisibility(newVisibility);
  }, [csvFile?.batchType.columns]);

  const data = useMemo(() => {
    if (!editedData?.rows) return [];

    return editedData.rows.map((row, index) => ({
      id: row.id,
      rowIndex: index,
      ...row.rowData,
    }));
  }, [editedData?.rows]);

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
    
    const visibleDataColumns = csvFile.batchType.columns.filter(col => columnVisibility[col] !== false);
    const headers = ["Sl. No.", ...visibleDataColumns];
    
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
  }, [editedData, csvFile, columnVisibility]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

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
                variant="outline"
                onClick={() => setIsFilterPanelOpen(true)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
              <ColumnVisibility
                columns={csvFile.batchType.columns}
                visibleColumns={columnVisibility}
                onVisibilityChange={handleColumnVisibilityChange}
                onToggleAll={handleToggleAllColumns}
              />
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

      <FilterPanel
        columns={csvFile.batchType.columns}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        isOpen={isFilterPanelOpen}
        onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
      />

      <div className={`relative transition-all duration-300 ${isFilterPanelOpen ? 'ml-80' : ''}`}>
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
            <DataTable
              data={data}
              columns={csvFile.batchType.columns}
              columnOrder={columnOrder}
              sorting={sorting}
              columnFilters={columnFilters}
              columnVisibility={columnVisibility}
              onColumnOrderChange={setColumnOrder}
              onSortingChange={setSorting}
              onColumnFiltersChange={setColumnFilters}
              onColumnVisibilityChange={setColumnVisibility}
              onCellValueChange={updateCellValue}
              onDeleteRow={handleDeleteRow}
            />
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