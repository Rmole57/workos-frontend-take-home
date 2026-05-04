import { Cross1Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Avatar, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { useSearchParams } from "react-router";

import type { Role, User } from "../../api/types";
import { useRolesByIdMap } from "../../hooks/useRoles";
import { useUsersQuery } from "../../hooks/useUsers";
import { formatJoined, initialsOf } from "../../lib/format";
import { useDebouncedSearch } from "../../lib/useDebouncedSearch";
import { DataTable } from "../data-table/DataTable";

import { UserRowActions } from "./UserRowActions";

const parsePage = (raw: string | null) => {
	const parsed = Number(raw);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const column = createColumnHelper<User>();

export function UsersTable() {
	const [searchParams, setSearchParams] = useSearchParams();
	const page = parsePage(searchParams.get("page"));

	const search = useDebouncedSearch();

	const usersQuery = useUsersQuery({
		page,
		search: search.urlValue || undefined,
	});
	const { data: rolesById } = useRolesByIdMap();

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
	const columns = useMemo<ColumnDef<User, any>[]>(
		() => [
			column.display({
				id: "user",
				header: "User",
				cell: ({ row }) => <UserCell user={row.original} />,
			}),
			column.accessor("roleId", {
				header: "Role",
				cell: ({ getValue }) => (
					<Text>{roleNameOf(rolesById, getValue())}</Text>
				),
			}),
			column.accessor("createdAt", {
				header: "Joined",
				cell: ({ getValue }) => <Text>{formatJoined(getValue())}</Text>,
			}),
			column.display({
				id: "actions",
				header: "",
				meta: { headerProps: { "aria-label": "Row actions" } },
				cell: ({ row }) => <UserRowActions user={row.original} />,
			}),
		],
		[rolesById],
	);

	const emptyMessage = search.urlValue
		? `No users match “${search.urlValue}”.`
		: "No users to show.";

	return (
		<Flex direction="column" gap="3">
			<TextField.Root
				size="2"
				placeholder="Search users…"
				aria-label="Search users"
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
			<DataTable
				query={usersQuery}
				columns={columns}
				page={page}
				onPageChange={handlePageChange}
				emptyMessage={emptyMessage}
			/>
		</Flex>
	);
}

function UserCell({ user }: { user: User }) {
	return (
		<Flex align="center" gap="2">
			<Avatar
				src={user.photo}
				fallback={initialsOf(user.first, user.last)}
				radius="full"
				size="1"
			/>
			<Text>
				{user.first} {user.last}
			</Text>
		</Flex>
	);
}

function roleNameOf(
	rolesById: Map<string, Role> | undefined,
	roleId: string,
): string {
	return rolesById?.get(roleId)?.name ?? "—";
}
