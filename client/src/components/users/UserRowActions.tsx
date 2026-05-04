import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { DropdownMenu, Flex, IconButton } from "@radix-ui/themes";
import { useState } from "react";

import type { User } from "../../api/types";

import { DeleteUserDialog } from "./DeleteUserDialog";

type UserRowActionsProps = {
	user: User;
};

export function UserRowActions({ user }: UserRowActionsProps) {
	const [deleteOpen, setDeleteOpen] = useState(false);

	const fullName = `${user.first} ${user.last}`;

	return (
		<Flex justify="end">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<IconButton
						aria-label={`Open row actions for ${fullName}`}
						size="1"
						variant="ghost"
						color="gray"
						style={{ borderRadius: "50%" }}
					>
						<DotsHorizontalIcon />
					</IconButton>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" style={{ minWidth: "143px" }}>
					<DropdownMenu.Item disabled>Edit user</DropdownMenu.Item>
					<DropdownMenu.Item onSelect={() => setDeleteOpen(true)}>
						Delete user
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<DeleteUserDialog
				user={user}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
			/>
		</Flex>
	);
}
