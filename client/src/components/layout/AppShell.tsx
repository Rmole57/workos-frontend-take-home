import { Box, Container } from '@radix-ui/themes'
import { Outlet } from 'react-router'

import { TabsNav } from './TabsNav'

export function AppShell() {
  return (
    <Box minHeight="100vh" py={{ initial: '4', sm: '7' }}>
      <Container size="3" px={{ initial: '4', sm: '5' }}>
        <TabsNav />
        <Box mt="5">
          <Outlet />
        </Box>
      </Container>
    </Box>
  )
}
