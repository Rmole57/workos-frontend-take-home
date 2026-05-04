import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "../api/client";
import { type UpdateRolePatch, updateRole } from "../api/roles";
import type { PagedData, Role } from "../api/types";
import { describeError } from "../lib/errors";

import { roleKeys } from "./useRoles";

type UpdateRoleVariables = {
	role: Role;
	patch: UpdateRolePatch;
};

export const useUpdateRoleMutation = () => {
	const queryClient = useQueryClient();
	const pagedKeyPrefix = [...roleKeys.all, "paged"] as const;

	return useMutation({
		mutationFn: ({ role, patch }: UpdateRoleVariables) =>
			updateRole(role.id, patch),
		onMutate: async ({ role, patch }) => {
			await queryClient.cancelQueries({ queryKey: roleKeys.all });

			const listSnapshot = queryClient.getQueryData<Role[]>(roleKeys.list());
			const pagedSnapshots = queryClient.getQueriesData<PagedData<Role>>({
				queryKey: pagedKeyPrefix,
			});

			queryClient.setQueryData<Role[]>(roleKeys.list(), (old) =>
				old?.map((r) => (r.id === role.id ? { ...r, ...patch } : r)),
			);

			queryClient.setQueriesData<PagedData<Role>>(
				{ queryKey: pagedKeyPrefix },
				(old) => {
					if (!old) return old;
					return {
						...old,
						data: old.data.map((r) =>
							r.id === role.id ? { ...r, ...patch } : r,
						),
					};
				},
			);

			return { listSnapshot, pagedSnapshots };
		},
		onError: (error, { role }, context) => {
			if (context) {
				if (context.listSnapshot !== undefined) {
					queryClient.setQueryData(roleKeys.list(), context.listSnapshot);
				}
				for (const [key, data] of context.pagedSnapshots) {
					queryClient.setQueryData(key, data);
				}
			}

			if (error instanceof ApiError && error.status === 400) return;
			const { message } = describeError(error);
			toast.error(`Couldn't update ${role.name}`, { description: message });
		},
		onSuccess: (_data, { role }) => {
			toast.success(`${role.name} updated`);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.all });
		},
	});
};
