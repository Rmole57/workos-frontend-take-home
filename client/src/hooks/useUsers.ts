import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { type ListUsersParams, listUsers } from "../api/users";

export const userKeys = {
	all: ["users"] as const,
	list: (params: ListUsersParams) => [...userKeys.all, params] as const,
};

export function useUsersQuery(params: ListUsersParams) {
	return useQuery({
		queryKey: userKeys.list(params),
		queryFn: ({ signal }) => listUsers(params, signal),
		placeholderData: keepPreviousData,
	});
}
