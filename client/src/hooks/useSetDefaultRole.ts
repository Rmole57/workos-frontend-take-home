import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateRole } from "../api/roles";
import type { PagedData, Role } from "../api/types";
import { describeError } from "../lib/errors";

import { roleKeys } from "./useRoles";

export const useSetDefaultRoleMutation = () => {
	const queryClient = useQueryClient();
	const pagedKeyPrefix = [...roleKeys.all, "paged"] as const;

	const flipDefault = (roles: Role[], targetId: string): Role[] =>
		roles.map((r) => {
			if (r.id === targetId) {
				return { ...r, isDefault: true };
			}
			if (r.isDefault) {
				return { ...r, isDefault: false };
			}
			return r;
		});

	return useMutation({
		mutationFn: (role: Role) => updateRole(role.id, { isDefault: true }),
		onMutate: async (role) => {
			await queryClient.cancelQueries({ queryKey: roleKeys.all });

			const listSnapshot = queryClient.getQueryData<Role[]>(roleKeys.list());
			const pagedSnapshots = queryClient.getQueriesData<PagedData<Role>>({
				queryKey: pagedKeyPrefix,
			});

			queryClient.setQueryData<Role[]>(roleKeys.list(), (old) =>
				old ? flipDefault(old, role.id) : old,
			);

			queryClient.setQueriesData<PagedData<Role>>(
				{ queryKey: pagedKeyPrefix },
				(old) => {
					if (!old) return old;
					return { ...old, data: flipDefault(old.data, role.id) };
				},
			);

			return { listSnapshot, pagedSnapshots };
		},
		onError: (error, role, context) => {
			if (context) {
				if (context.listSnapshot !== undefined) {
					queryClient.setQueryData(roleKeys.list(), context.listSnapshot);
				}
				for (const [key, data] of context.pagedSnapshots) {
					queryClient.setQueryData(key, data);
				}
			}
			const { message } = describeError(error);
			toast.error(`Couldn't set ${role.name} as default`, {
				description: message,
			});
		},
		onSuccess: (_data, role) => {
			toast.success(`${role.name} is now the default role`);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.all });
		},
	});
};
