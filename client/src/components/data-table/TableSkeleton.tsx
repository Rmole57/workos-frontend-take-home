import { Skeleton, Table } from "@radix-ui/themes";

type TableSkeletonProps = {
	rows?: number;
	columns: number;
};

export function TableSkeleton({ rows = 10, columns }: TableSkeletonProps) {
	return (
		<>
			{Array.from({ length: rows }).map(() => (
				<Table.Row key={`skeleton-row-${crypto.randomUUID()}`}>
					{Array.from({ length: columns }).map(() => (
						<Table.Cell key={`skeleton-cell-${crypto.randomUUID()}`}>
							<Skeleton width="60%" height="14px" />
						</Table.Cell>
					))}
				</Table.Row>
			))}
		</>
	);
}
