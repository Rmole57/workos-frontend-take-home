import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PagedData, User } from "../api/types";
import { deleteUser } from "../api/users";
import { describeError } from "../lib/errors";

import { userKeys } from "./useUsers";

const fullName = (user: User) => `${user.first} ${user.last}`;

export const useDeleteUserMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (user: User) => deleteUser(user.id),
		onMutate: async (user) => {
			await queryClient.cancelQueries({ queryKey: userKeys.all });

			const snapshots = queryClient.getQueriesData<PagedData<User>>({
				queryKey: userKeys.all,
			});

			queryClient.setQueriesData<PagedData<User>>(
				{ queryKey: userKeys.all },
				(old) => {
					if (!old) return old;
					return {
						...old,
						data: old.data.filter((u) => u.id !== user.id),
					};
				},
			);

			return { snapshots };
		},
		onError: (error, user, context) => {
			if (context) {
				for (const [queryKey, data] of context.snapshots) {
					queryClient.setQueryData(queryKey, data);
				}
			}
			const { message } = describeError(error);
			toast.error(`Couldn't delete ${fullName(user)}`, {
				description: message,
			});
		},
		onSuccess: (_data, user) => {
			toast.success(`${fullName(user)} deleted`);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.all });
		},
	});
};
