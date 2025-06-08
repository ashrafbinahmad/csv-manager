export type TableRow = {
  id: string;
  rowIndex: number;
  [key: string]: string | number;
};

export type FilterState = {
  [columnId: string]: string;
}; 