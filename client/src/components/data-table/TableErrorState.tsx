import { Button, Flex, Text } from "@radix-ui/themes"

import { describeError } from "../../lib/errors"

type TableErrorStateProps = {
	error: unknown
	onRetry?: () => void
}

export function TableErrorState({ error, onRetry }: TableErrorStateProps) {
	const { message, retryable } = describeError(error)

	return (
		<Flex
			direction="column"
			align="center"
			justify="center"
			gap="3"
			py="6"
			role="alert"
		>
			<Text color="gray" size="2">
				{message}
			</Text>
			{retryable && onRetry && (
				<Button size="2" variant="solid" onClick={onRetry}>
					Try again
				</Button>
			)}
		</Flex>
	)
}
