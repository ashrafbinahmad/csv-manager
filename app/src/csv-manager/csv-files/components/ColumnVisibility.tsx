import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Eye, EyeOff, Columns3 } from "lucide-react";

interface ColumnVisibilityProps {
  columns: string[];
  visibleColumns: Record<string, boolean>;
  onVisibilityChange: (columnId: string, visible: boolean) => void;
  onToggleAll: (visible: boolean) => void;
}

export const ColumnVisibility: React.FC<ColumnVisibilityProps> = ({
  columns,
  visibleColumns,
  onVisibilityChange,
  onToggleAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const visibleCount = Object.values(visibleColumns).filter(Boolean).length;
  const totalColumns = columns.length;
  const allVisible = visibleCount === totalColumns;
  const noneVisible = visibleCount === 0;

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Columns3 className="w-4 h-4" />
        Columns
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {visibleCount}/{totalColumns}
        </span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            <div className="p-3 border-b border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-900">Column Visibility</h3>
                <span className="text-xs text-gray-500">{visibleCount} of {totalColumns} visible</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleAll(true)}
                  disabled={allVisible}
                  className="flex-1 text-xs"
                >
                  Show All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleAll(false)}
                  disabled={noneVisible}
                  className="flex-1 text-xs"
                >
                  Hide All
                </Button>
              </div>
            </div>
            
            <div className="p-2">
              {columns.map((column) => (
                <div
                  key={column}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => onVisibilityChange(column, !visibleColumns[column])}
                >
                  <span className="text-sm text-gray-700 flex-1 truncate" title={column}>
                    {column}
                  </span>
                  <button className="ml-2 flex-shrink-0">
                    {visibleColumns[column] ? (
                      <Eye className="w-4 h-4 text-blue-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};