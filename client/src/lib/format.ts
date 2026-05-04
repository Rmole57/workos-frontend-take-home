const joinedDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export const formatJoined = (iso: string) => joinedDateFormatter.format(new Date(iso))

export const initialsOf = (first: string, last: string) =>
  `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
