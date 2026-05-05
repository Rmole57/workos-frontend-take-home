import {
	Button,
	Dialog,
	Flex,
	Select,
	Text,
	TextField,
} from "@radix-ui/themes";
import { useId, useMemo, useState } from "react";
import { useCreateUserMutation } from "../../hooks/useCreateUser";
import { useRolesByIdMap } from "../../hooks/useRoles";

type AddUserDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
	const createMutation = useCreateUserMutation();
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

	const defaultRoleId = useMemo(
		() => roles.find((role) => role.isDefault)?.id ?? "",
		[roles],
	);

	const [first, setFirst] = useState("");
	const [last, setLast] = useState("");
	const [roleId, setRoleId] = useState("");
	const effectiveRoleId = roleId || defaultRoleId;

	const firstId = useId();
	const lastId = useId();
	const roleLabelId = useId();

	const trimmedFirst = first.trim();
	const trimmedLast = last.trim();
	const isValid =
		trimmedFirst !== "" && trimmedLast !== "" && effectiveRoleId !== "";

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!isValid) return;
		createMutation.mutate({
			first: trimmedFirst,
			last: trimmedLast,
			roleId: effectiveRoleId,
		});
		onOpenChange(false);
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Content maxWidth="450px">
				<Dialog.Title>Add user</Dialog.Title>
				<Dialog.Description size="2" color="gray" mb="4">
					Create a new user and assign them a role.
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
							<Select.Root value={effectiveRoleId} onValueChange={setRoleId}>
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
							<Button type="submit" disabled={!isValid}>
								Create
							</Button>
						</Flex>
					</form>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
}
