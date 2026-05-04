import {
	Button,
	Dialog,
	Flex,
	Select,
	Text,
	TextField,
} from "@radix-ui/themes";
import { useId, useMemo, useState } from "react";
import type { User } from "../../api/types";
import type { UpdateUserPatch } from "../../api/users";
import { useRolesByIdMap } from "../../hooks/useRoles";
import { useUpdateUserMutation } from "../../hooks/useUpdateUser";

type EditUserDialogProps = {
	user: User;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function EditUserDialog({
	user,
	open,
	onOpenChange,
}: EditUserDialogProps) {
	const updateMutation = useUpdateUserMutation();
	const { data: rolesById } = useRolesByIdMap();

	const roles = useMemo(
		() =>
			rolesById
				? Array.from(rolesById.values()).sort((a, b) =>
						a.name.localeCompare(b.name),
					)
				: [],
		[rolesById],
	);

	const [first, setFirst] = useState(user.first);
	const [last, setLast] = useState(user.last);
	const [roleId, setRoleId] = useState(user.roleId);

	const firstId = useId();
	const lastId = useId();
	const roleLabelId = useId();

	const trimmedFirst = first.trim();
	const trimmedLast = last.trim();
	const isValid = trimmedFirst !== "" && trimmedLast !== "";

	const patch: UpdateUserPatch = {};
	if (trimmedFirst !== user.first) patch.first = trimmedFirst;
	if (trimmedLast !== user.last) patch.last = trimmedLast;
	if (roleId !== user.roleId) patch.roleId = roleId;
	const hasChanges = Object.keys(patch).length > 0;

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!isValid || !hasChanges) return;
		updateMutation.mutate({ user, patch });
		onOpenChange(false);
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Content maxWidth="450px">
				<Dialog.Title>Edit user</Dialog.Title>
				<Dialog.Description size="2" color="gray" mb="4">
					Update {user.first} {user.last}’s name or role.
				</Dialog.Description>

				<Flex direction="column" gap="3" asChild>
					<form onSubmit={handleSubmit}>
						<Flex direction="column" gap="1">
							<Text as="label" htmlFor={firstId} size="2" weight="medium">
								First name
							</Text>
							<TextField.Root
								id={firstId}
								value={first}
								onChange={(event) => setFirst(event.target.value)}
								required
								autoFocus
							/>
						</Flex>

						<Flex direction="column" gap="1">
							<Text as="label" htmlFor={lastId} size="2" weight="medium">
								Last name
							</Text>
							<TextField.Root
								id={lastId}
								value={last}
								onChange={(event) => setLast(event.target.value)}
								required
							/>
						</Flex>

						<Flex direction="column" gap="1">
							<Text id={roleLabelId} as="div" size="2" weight="medium">
								Role
							</Text>
							<Select.Root value={roleId} onValueChange={setRoleId}>
								<Select.Trigger
									aria-labelledby={roleLabelId}
									placeholder="Select a role"
								/>
								<Select.Content>
									{roles.map((role) => (
										<Select.Item key={role.id} value={role.id}>
											{role.name}
										</Select.Item>
									))}
								</Select.Content>
							</Select.Root>
						</Flex>

						<Flex gap="3" mt="2" justify="end">
							<Dialog.Close>
								<Button type="button" variant="surface" color="gray">
									Cancel
								</Button>
							</Dialog.Close>
							<Button type="submit" disabled={!isValid || !hasChanges}>
								Save
							</Button>
						</Flex>
					</form>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
}
