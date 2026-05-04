import { Cross1Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Badge, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { useSearchParams } from "react-router";

import type { Role } from "../../api/types";
import { useRolesQuery } from "../../hooks/useRoles";
import { useDebouncedSearch } from "../../lib/useDebouncedSearch";
import { DataTable } from "../data-table/DataTable";

import { RoleRowActions } from "./RoleRowActions";

const parsePage = (raw: string | null) => {
	const parsed = Number(raw);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const column = createColumnHelper<Role>();

export function RolesTable() {
	const [searchParams, setSearchParams] = useSearchParams();
	const page = parsePage(searchParams.get("page"));

	const search = useDebouncedSearch();

	const rolesQuery = useRolesQuery({
		page,
		search: search.urlValue || undefined,
	});

	const handlePageChange = (next: number) => {
		setSearchParams((prev) => {
			const updated = new URLSearchParams(prev);
			if (next <= 1) {
				updated.delete("page");
			} else {
				updated.set("page", String(next));
			}
			return updated;
		});
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const columns = useMemo<ColumnDef<Role, any>[]>(
		() => [
			column.display({
				id: "name",
				header: "Name",
				cell: ({ row }) => <RoleNameCell role={row.original} />,
			}),
			column.accessor("description", {
				header: "Description",
				cell: ({ getValue }) => (
					<Text color={getValue() ? undefined : "gray"}>
						{getValue() || "—"}
					</Text>
				),
			}),
			column.display({
				id: "actions",
				header: "",
				meta: { headerProps: { "aria-label": "Row actions" } },
				cell: ({ row }) => <RoleRowActions role={row.original} />,
			}),
		],
		[],
	);

	const emptyMessage = search.urlValue
		? `No roles match “${search.urlValue}”.`
		: "No roles to show.";

	return (
		<Flex direction="column" gap="3">
			<Flex gap="2">
				<TextField.Root
					size="2"
					style={{ flexGrow: 1 }}
					placeholder="Search by name or description…"
					aria-label="Search roles"
					value={search.value}
					onChange={(event) => search.setValue(event.target.value)}
					onKeyDown={search.handleKeyDown}
				>
					<TextField.Slot>
						<MagnifyingGlassIcon aria-hidden />
					</TextField.Slot>
					{search.value !== "" && (
						<TextField.Slot side="right">
							<IconButton
								size="1"
								variant="ghost"
								color="gray"
								aria-label="Clear search"
								onClick={search.clear}
							>
								<Cross1Icon />
							</IconButton>
						</TextField.Slot>
					)}
				</TextField.Root>
			</Flex>
			<DataTable
				query={rolesQuery}
				columns={columns}
				page={page}
				onPageChange={handlePageChange}
				emptyMessage={emptyMessage}
			/>
		</Flex>
	);
}

function RoleNameCell({ role }: { role: Role }) {
	return (
		<Flex align="center" gap="2">
			<Text>{role.name}</Text>
			{role.isDefault && (
				<Badge color="iris" variant="soft" radius="full" size="1">
					Default
				</Badge>
			)}
		</Flex>
	);
}
