import {
	Button,
	Dialog,
	Flex,
	Strong,
	Text,
	TextArea,
	TextField,
} from "@radix-ui/themes";
import { useId, useState } from "react";

import { ApiError } from "../../api/client";
import type { UpdateRolePatch } from "../../api/roles";
import type { Role } from "../../api/types";
import { useUpdateRoleMutation } from "../../hooks/useUpdateRole";

type EditRoleDialogProps = {
	role: Role;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function EditRoleDialog({
	role,
	open,
	onOpenChange,
}: EditRoleDialogProps) {
	const updateMutation = useUpdateRoleMutation();

	const [name, setName] = useState(role.name);
	const [description, setDescription] = useState(role.description ?? "");
	const [serverError, setServerError] = useState<string | null>(null);

	const nameId = useId();
	const descriptionId = useId();
	const errorId = useId();

	const trimmedName = name.trim();
	const trimmedDescription = description.trim();
	const originalDescription = role.description ?? "";

	const patch: UpdateRolePatch = {};
	if (trimmedName !== role.name) {
		patch.name = trimmedName;
	}
	if (trimmedDescription !== originalDescription && trimmedDescription !== "") {
		patch.description = trimmedDescription;
	}

	const hasChanges = Object.keys(patch).length > 0;
	const isValid = trimmedName !== "";
	const canSubmit = isValid && hasChanges && !updateMutation.isPending;

	const handleNameChange = (next: string) => {
		setName(next);
		if (serverError) {
			setServerError(null);
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!canSubmit) {
			return;
		}

		setServerError(null);
		try {
			await updateMutation.mutateAsync({ role, patch });
			onOpenChange(false);
		} catch (err) {
			if (err instanceof ApiError && err.status === 400) {
				setServerError(err.message || "A role with this name already exists.");
			}
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Content maxWidth="450px">
				<Dialog.Title>Edit role</Dialog.Title>
				<Dialog.Description size="2" color="gray" mb="4">
					Update the name or description of <Strong>{role.name}</Strong>.
				</Dialog.Description>

				<Flex direction="column" gap="3" asChild>
					<form onSubmit={handleSubmit}>
						<Flex direction="column" gap="1">
							<Text as="label" htmlFor={nameId} size="2" weight="medium">
								Name
							</Text>
							<TextField.Root
								id={nameId}
								value={name}
								onChange={(event) => handleNameChange(event.target.value)}
								required
								autoFocus
								aria-invalid={serverError ? true : undefined}
								aria-describedby={serverError ? errorId : undefined}
							/>
							{serverError && (
								<Text id={errorId} size="2" color="red" role="alert">
									{serverError}
								</Text>
							)}
						</Flex>

						<Flex direction="column" gap="1">
							<Text as="label" htmlFor={descriptionId} size="2" weight="medium">
								Description
							</Text>
							<TextArea
								id={descriptionId}
								value={description}
								onChange={(event) => setDescription(event.target.value)}
								rows={3}
								resize="vertical"
								placeholder="What does this role do?"
							/>
						</Flex>

						<Flex gap="3" mt="2" justify="end">
							<Dialog.Close>
								<Button type="button" variant="surface" color="gray">
									Cancel
								</Button>
							</Dialog.Close>
							<Button type="submit" disabled={!canSubmit}>
								Save
							</Button>
						</Flex>
					</form>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
}
