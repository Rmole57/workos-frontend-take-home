import { Navigate, Route, Routes } from 'react-router'

import { AppShell } from './components/layout/AppShell'
import { RolesPage } from './routes/RolesPage'
import { UsersPage } from './routes/UsersPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/users" replace />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="*" element={<Navigate to="/users" replace />} />
      </Route>
    </Routes>
  )
}
