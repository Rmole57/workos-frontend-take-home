import { Button, Flex, Table } from "@radix-ui/themes";
import type { UseQueryResult } from "@tanstack/react-query";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

import type { PagedData } from "../../api/types";

import { TableEmptyState } from "./TableEmptyState";
import { TableErrorState } from "./TableErrorState";
import { TableSkeleton } from "./TableSkeleton";
import "./types";

type DataTableProps<T> = {
	query: UseQueryResult<PagedData<T>>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	columns: ColumnDef<T, any>[];
	page: number;
	onPageChange: (page: number) => void;
	emptyMessage?: string;
	skeletonRows?: number;
};

export function DataTable<T>({
	query,
	columns,
	page,
	onPageChange,
	emptyMessage,
	skeletonRows = 10,
}: DataTableProps<T>) {
	const paged = query.data;
	const items = paged?.data ?? [];
	const showPagination = paged !== undefined && paged.pages > 1;

	// React Compiler can't safely memoize this hook's return value (it exposes
	// closures with mutable internal state), so we opt this component out of
	// auto-memoization. We protect render cost by memoizing `columns` upstream.
	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data: items,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const columnCount = columns.length;

	const renderFullWidthRow = (children: ReactNode) => (
		<Table.Row>
			<Table.Cell colSpan={columnCount}>{children}</Table.Cell>
		</Table.Row>
	);

	const renderBody = () => {
		if (query.isPending) {
			return <TableSkeleton rows={skeletonRows} columns={columnCount} />;
		}

		if (query.isError) {
			return renderFullWidthRow(
				<TableErrorState error={query.error} onRetry={() => query.refetch()} />,
			);
		}

		if (items.length === 0) {
			return renderFullWidthRow(<TableEmptyState message={emptyMessage} />);
		}

		return table.getRowModel().rows.map((row) => (
			<Table.Row key={row.id}>
				{row.getVisibleCells().map((cell) => (
					<Table.Cell
						key={cell.id}
						{...(cell.column.columnDef.meta?.cellProps ?? {})}
					>
						{flexRender(cell.column.columnDef.cell, cell.getContext())}
					</Table.Cell>
				))}
			</Table.Row>
		));
	};

	return (
		<Table.Root size="2" variant="surface">
			<Table.Header>
				{table.getHeaderGroups().map((headerGroup) => (
					<Table.Row key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<Table.ColumnHeaderCell
								key={header.id}
								{...(header.column.columnDef.meta?.headerProps ?? {})}
							>
								{header.isPlaceholder
									? null
									: flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
							</Table.ColumnHeaderCell>
						))}
					</Table.Row>
				))}
			</Table.Header>
			<Table.Body>{renderBody()}</Table.Body>
			{showPagination && (
				<tfoot className="data-table-footer">
					<Table.Row>
						<Table.Cell colSpan={columnCount}>
							<Flex justify="end" gap="2">
								<Button
									size="1"
									variant="surface"
									color="gray"
									disabled={paged.prev === null || query.isFetching}
									onClick={() => onPageChange(page - 1)}
								>
									Previous
								</Button>
								<Button
									size="1"
									variant="surface"
									color="gray"
									disabled={paged.next === null || query.isFetching}
									onClick={() => onPageChange(page + 1)}
								>
									Next
								</Button>
							</Flex>
						</Table.Cell>
					</Table.Row>
				</tfoot>
			)}
		</Table.Root>
	);
}
