import { Flex, Text } from '@radix-ui/themes'

type TableEmptyStateProps = {
  message?: string
}

export function TableEmptyState({ message = 'No results.' }: TableEmptyStateProps) {
  return (
    <Flex justify="center" py="6">
      <Text color="gray" size="2">
        {message}
      </Text>
    </Flex>
  )
}
