import { useQuery } from "@tanstack/react-query";

import { listAllRoles } from "../api/roles";
import type { Role } from "../api/types";

export const roleKeys = {
	all: ["roles"] as const,
	list: () => [...roleKeys.all, "list"] as const,
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
