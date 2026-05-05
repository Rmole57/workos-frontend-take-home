import type { Table as RadixTable } from "@radix-ui/themes";
import type { RowData } from "@tanstack/react-table";
import type { ComponentProps } from "react";

declare module "@tanstack/react-table" {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface ColumnMeta<TData extends RowData, TValue> {
		headerProps?: ComponentProps<typeof RadixTable.ColumnHeaderCell>;
		cellProps?: ComponentProps<typeof RadixTable.Cell>;
	}
}
