import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { type CreateUserInput, createUser } from "../api/users";
import { describeError } from "../lib/errors";

import { userKeys } from "./useUsers";

export const useCreateUserMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateUserInput) => createUser(input),
		onError: (error, input) => {
			const { message } = describeError(error);
			toast.error(`Couldn't create ${input.first} ${input.last}`, {
				description: message,
			});
		},
		onSuccess: (user) => {
			queryClient.invalidateQueries({ queryKey: userKeys.all });
			toast.success(`${user.first} ${user.last} created`);
		},
	});
};
