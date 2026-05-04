import { apiFetch } from "./client";
import type { PagedData, Role } from "./types";

export type ListRolesParams = {
	page?: number;
	search?: string;
};

export const listRoles = (params: ListRolesParams = {}, signal?: AbortSignal) =>
	apiFetch<PagedData<Role>>("/roles", {
		search: { page: params.page, search: params.search },
		signal,
	});

export async function listAllRoles(signal?: AbortSignal): Promise<Role[]> {
	const all: Role[] = [];
	let page: number | null = 1;
	while (page !== null) {
		const result = await listRoles({ page }, signal);
		all.push(...result.data);
		page = result.next;
	}
	return all;
}

export const updateRole = (
	id: string,
	patch: { name?: string; description?: string },
) => apiFetch<Role>(`/roles/${id}`, { method: "PATCH", body: patch });
