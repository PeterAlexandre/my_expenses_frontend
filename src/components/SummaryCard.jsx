import { Card, Text } from '@mantine/core'
import { fmt } from '../utils/formatting'

const COLORS = {
  income: 'teal.7',
  expense: 'red.7',
}

function SummaryCard({ title, value, variant }) {
  return (
    <Card withBorder shadow="xs" padding="md" radius="md">
      <Text
        size="xs"
        fw={600}
        c="dimmed"
        tt="uppercase"
        style={{ letterSpacing: '0.09em' }}
        mb={6}
      >
        {title}
      </Text>
      <Text size="xl" fw={600} c={COLORS[variant] ?? 'dark'} style={{ letterSpacing: '-0.03em' }}>
        R$ {fmt(value)}
      </Text>
    </Card>
  )
}

export default SummaryCard
