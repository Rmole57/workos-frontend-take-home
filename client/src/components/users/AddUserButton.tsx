import { PlusIcon } from "@radix-ui/react-icons"
import { Button } from "@radix-ui/themes"
import { useState } from "react"

import { useRolesByIdMap } from "../../hooks/useRoles"

import { AddUserDialog } from "./AddUserDialog"

export function AddUserButton() {
	const [open, setOpen] = useState(false)
	const { isLoading: rolesLoading } = useRolesByIdMap()

	return (
		<>
			<Button
				size="2"
				disabled={rolesLoading}
				onClick={() => setOpen(true)}
			>
				<PlusIcon />
				Add user
			</Button>
			<AddUserDialog open={open} onOpenChange={setOpen} />
		</>
	)
}
