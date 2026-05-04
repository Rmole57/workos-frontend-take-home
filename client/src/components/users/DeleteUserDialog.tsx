import { AlertDialog, Button, Flex, Strong, Text } from "@radix-ui/themes"

import type { User } from "../../api/types"
import { useDeleteUserMutation } from "../../hooks/useDeleteUser"

type DeleteUserDialogProps = {
	user: User
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function DeleteUserDialog({
	user,
	open,
	onOpenChange,
}: DeleteUserDialogProps) {
	const deleteMutation = useDeleteUserMutation()

	const handleConfirm = () => {
		deleteMutation.mutate(user)
		onOpenChange(false)
	}

	return (
		<AlertDialog.Root open={open} onOpenChange={onOpenChange}>
			<AlertDialog.Content maxWidth="450px">
				<AlertDialog.Title>Delete user</AlertDialog.Title>
				<AlertDialog.Description size="2">
					<Text as="span">
						Are you sure you want to delete{" "}
						<Strong>
							{user.first} {user.last}
						</Strong>
						? This action cannot be undone.
					</Text>
				</AlertDialog.Description>
				<Flex gap="3" mt="4" justify="end">
					<AlertDialog.Cancel>
						<Button variant="surface" color="gray">
							Cancel
						</Button>
					</AlertDialog.Cancel>
					<AlertDialog.Action>
						<Button
							variant="surface"
							color="red"
							onClick={handleConfirm}
						>
							Delete
						</Button>
					</AlertDialog.Action>
				</Flex>
			</AlertDialog.Content>
		</AlertDialog.Root>
	)
}
