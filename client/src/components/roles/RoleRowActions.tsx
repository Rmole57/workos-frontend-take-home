import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Badge, DropdownMenu, Flex, IconButton } from "@radix-ui/themes";
import { useState } from "react";

import type { Role } from "../../api/types";
import { useSetDefaultRoleMutation } from "../../hooks/useSetDefaultRole";

import { EditRoleDialog } from "./EditRoleDialog";

type RoleRowActionsProps = {
	role: Role;
};

export function RoleRowActions({ role }: RoleRowActionsProps) {
	const [editOpen, setEditOpen] = useState(false);
	const setDefaultMutation = useSetDefaultRoleMutation();

	return (
		<Flex justify="end" align="center" gap="2">
			{role.isDefault && (
				<Badge color="iris" variant="soft" radius="full" size="1">
					Default
				</Badge>
			)}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<IconButton
						aria-label={`Open row actions for ${role.name}`}
						size="1"
						variant="ghost"
						color="gray"
						style={{ borderRadius: "50%" }}
					>
						<DotsHorizontalIcon />
					</IconButton>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" style={{ minWidth: "143px" }}>
					{!role.isDefault && (
						<DropdownMenu.Item onSelect={() => setDefaultMutation.mutate(role)}>
							Set as default
						</DropdownMenu.Item>
					)}
					<DropdownMenu.Item onSelect={() => setEditOpen(true)}>
						Edit role
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<EditRoleDialog role={role} open={editOpen} onOpenChange={setEditOpen} />
		</Flex>
	);
}
