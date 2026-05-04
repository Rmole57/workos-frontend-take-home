import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Avatar, Flex, IconButton, Text } from "@radix-ui/themes";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { useSearchParams } from "react-router";

import type { Role, User } from "../../api/types";
import { useRolesByIdMap } from "../../hooks/useRoles";
import { useUsersQuery } from "../../hooks/useUsers";
import { formatJoined, initialsOf } from "../../lib/format";
import { DataTable } from "../data-table/DataTable";

const parsePage = (raw: string | null) => {
	const parsed = Number(raw);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const column = createColumnHelper<User>();

export function UsersTable() {
	const [searchParams, setSearchParams] = useSearchParams();
	const page = parsePage(searchParams.get("page"));

	const usersQuery = useUsersQuery({ page });
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
				cell: ({ row }) => <UserRowActionsButton user={row.original} />,
			}),
		],
		[rolesById],
	);

	return (
		<DataTable
			query={usersQuery}
			columns={columns}
			page={page}
			onPageChange={handlePageChange}
			emptyMessage="No users to show."
		/>
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

function UserRowActionsButton({ user }: { user: User }) {
	return (
		<Flex justify="end">
			<IconButton
				aria-label={`Open row actions for ${user.first} ${user.last}`}
				size="1"
				variant="ghost"
				color="gray"
				disabled
			>
				<DotsHorizontalIcon />
			</IconButton>
		</Flex>
	);
}

function roleNameOf(
	rolesById: Map<string, Role> | undefined,
	roleId: string,
): string {
	return rolesById?.get(roleId)?.name ?? "—";
}
