import React from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { Filter, X, Search, ChevronRight } from "lucide-react";
import { FilterState } from "../types";

interface FilterPanelProps {
  columns: string[];
  filters: FilterState;
  onFilterChange: (columnId: string, value: string) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  columns,
  filters,
  onFilterChange,
  onClearFilters,
  isOpen,
  onToggle,
}) => {
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-lg z-40 transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`} style={{ width: '320px' }}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-lg">Filters</h3>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="p-1 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="w-full"
              >
                Clear All Filters
              </Button>
            )}

            <div className="space-y-4">
              {columns.map((column) => (
                <div key={column} className="space-y-2">
                  <Label htmlFor={`filter-${column}`} className="text-sm font-medium">
                    {column}
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id={`filter-${column}`}
                      placeholder={`Filter by ${column}...`}
                      value={filters[column] || ''}
                      onChange={(e) => onFilterChange(column, e.target.value)}
                      className="pl-10"
                    />
                    {filters[column] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => onFilterChange(column, '')}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t">
          <p className="text-sm text-gray-500">
            {activeFiltersCount > 0 
              ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied`
              : 'No filters applied'
            }
          </p>
        </div>
      </div>
    </div>
  );
}; 