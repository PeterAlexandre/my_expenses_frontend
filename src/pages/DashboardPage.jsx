import { useState, useEffect } from 'react'
import {
  Container,
  Group,
  Stack,
  Title,
  Text,
  SimpleGrid,
  Card,
  Progress,
  Badge,
  Center,
  Loader,
} from '@mantine/core'
import MonthYearPicker from '../components/MonthYearPicker'
import SummaryCard from '../components/SummaryCard'
import { fmt } from '../utils/formatting'
import { categoryColor } from '../utils/categoryColors'
import { useApi } from '../hooks/useApi'

const currentDate = new Date()

function DashboardPage() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())

  const apiFetch = useApi()

  useEffect(() => {
    fetchReport()
  }, [month, year])

  function fetchReport() {
    setLoading(true)
    const query = new URLSearchParams({ month, year }).toString()

    apiFetch(`/reports/monthly?${query}`)
      .then((res) => res.json())
      .then((data) => {
        setReport(data)
        setLoading(false)
      })
  }

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Dashboard</Title>
        <Group gap="sm">
          <MonthYearPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />
        </Group>
      </Group>

      {loading || !report ? (
        <Center py="xl"><Loader /></Center>
      ) : (
        <Stack gap="xl">
          <Stack gap="sm">
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.09em' }}>
              Resumo
            </Text>
            <SimpleGrid cols={3}>
              <SummaryCard title="Receitas" value={report.summary.income_total} variant="income" />
              <SummaryCard title="Despesas" value={report.summary.expenses_total} variant="expense" />
              <SummaryCard title="Diferença" value={report.summary.difference} />
            </SimpleGrid>
            <SimpleGrid cols={2}>
              <SummaryCard title="Cartão de Crédito" value={report.credit_card_total} />
              <SummaryCard title="Saldo Atual" value={report.current_balance} />
            </SimpleGrid>
          </Stack>

          {report.by_category.length > 0 && (
            <Stack gap="sm">
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.09em' }}>
                Por Categoria
              </Text>
              <Card withBorder padding="md" radius="md">
                <Stack gap="xs">
                  {report.by_category.map((cat) => {
                    const color = cat.category_id != null ? categoryColor(cat.category_id) : 'gray'
                    return (
                      <Group key={cat.name} gap="md" wrap="nowrap">
                        <Badge
                          variant="light"
                          radius="sm"
                          color={color}
                          style={{ flex: 1, maxWidth: 160 }}
                        >
                          {cat.name === 'Uncategorized' ? 'Sem categoria' : cat.name}
                        </Badge>
                        <Progress
                          value={cat.percentage}
                          color={color}
                          size="sm"
                          style={{ flex: 2 }}
                        />
                        <Text size="sm" c="dimmed" fw={500} ta="right" miw={90}>
                          R$ {fmt(cat.total)}
                        </Text>
                      </Group>
                    )
                  })}
                </Stack>
              </Card>
            </Stack>
          )}

          <SimpleGrid cols={2}>
            <SummaryCard title="A Receber" value={report.provisions.to_receive.total} variant="income" />
            <SummaryCard title="A Pagar" value={report.provisions.to_pay.total} variant="expense" />
          </SimpleGrid>
        </Stack>
      )}
    </Container>
  )
}

export default DashboardPage
