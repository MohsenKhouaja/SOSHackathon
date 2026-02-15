import { create } from "zustand";

type DataTableStore = {
  rightClickedRowId?: string;
  rightClickedCellId?: string;
  rightClickCellValue?: unknown;

  setRightClickData: (
    rowId?: string,
    cellId?: string,
    cellValue?: unknown
  ) => void;
};

export const useDataTableStore = create<DataTableStore>((set) => ({
  rightClickedRowId: undefined,
  setRightClickData: (rowId?: string, cellId?: string, cellValue?: unknown) =>
    set({
      rightClickedRowId: rowId,
      rightClickedCellId: cellId,
      rightClickCellValue: cellValue,
    }),
}));
