import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PagedData, User } from "../api/types";
import { type UpdateUserPatch, updateUser } from "../api/users";
import { describeError } from "../lib/errors";

import { userKeys } from "./useUsers";

type UpdateUserVariables = {
	user: User;
	patch: UpdateUserPatch;
};

const fullName = (user: User) => `${user.first} ${user.last}`;

/**
 * Optimistically update a user.
 *
 * Same lifecycle shape as `useDeleteUserMutation` — the only difference is
 * the cache patch: we `map` instead of `filter`, replacing the matching
 * row with `{ ...user, ...patch }`. The row's new values appear instantly;
 * `onSettled` invalidates so the server's authoritative response (including
 * `updatedAt`) replaces our local guess.
 */
export const useUpdateUserMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ user, patch }: UpdateUserVariables) =>
			updateUser(user.id, patch),
		onMutate: async ({ user, patch }) => {
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
						data: old.data.map((u) =>
							u.id === user.id ? { ...u, ...patch } : u,
						),
					};
				},
			);

			return { snapshots };
		},
		onError: (error, { user }, context) => {
			if (context) {
				for (const [queryKey, data] of context.snapshots) {
					queryClient.setQueryData(queryKey, data);
				}
			}
			const { message } = describeError(error);
			toast.error(`Couldn't update ${fullName(user)}`, {
				description: message,
			});
		},
		onSuccess: (_data, { user }) => {
			toast.success(`${fullName(user)} updated`);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.all });
		},
	});
};
