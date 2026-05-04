import { apiFetch } from './client'
import type { PagedData, User } from './types'

export type ListUsersParams = {
  page?: number
  search?: string
}

export const listUsers = (params: ListUsersParams = {}, signal?: AbortSignal) =>
  apiFetch<PagedData<User>>('/users', {
    search: { page: params.page, search: params.search },
    signal,
  })

export const deleteUser = (id: string) =>
  apiFetch<User>(`/users/${id}`, { method: 'DELETE' })
