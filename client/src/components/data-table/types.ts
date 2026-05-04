import type { Table as RadixTable } from "@radix-ui/themes";
import type { RowData } from "@tanstack/react-table";
import type { ComponentProps } from "react";

/**
 * Augment TanStack Table's `ColumnMeta` so column definitions can carry
 * per-column DOM passthroughs. This is how we pin Radix-specific knobs
 * (`aria-label` on an icon-only header, `align`, etc.) onto each column
 * without leaking them into the cell renderer or polluting `DataTableProps`.
 */
declare module "@tanstack/react-table" {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface ColumnMeta<TData extends RowData, TValue> {
		headerProps?: ComponentProps<typeof RadixTable.ColumnHeaderCell>;
		cellProps?: ComponentProps<typeof RadixTable.Cell>;
	}
}
