import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { type ListRolesParams, listAllRoles, listRoles } from "../api/roles";
import type { Role } from "../api/types";

export const roleKeys = {
	all: ["roles"] as const,
	list: () => [...roleKeys.all, "list"] as const,
	paged: (params: ListRolesParams) =>
		[...roleKeys.all, "paged", params] as const,
};

export function useRolesByIdMap() {
	return useQuery({
		queryKey: roleKeys.list(),
		queryFn: ({ signal }) => listAllRoles(signal),
		staleTime: 5 * 60_000,
		select: (roles): Map<string, Role> =>
			new Map(roles.map((role) => [role.id, role])),
	});
}

export function useRolesQuery(params: ListRolesParams) {
	return useQuery({
		queryKey: roleKeys.paged(params),
		queryFn: ({ signal }) => listRoles(params, signal),
		placeholderData: keepPreviousData,
	});
}
