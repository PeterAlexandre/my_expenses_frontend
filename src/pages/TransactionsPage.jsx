import { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Group,
  Stack,
  Paper,
  TextInput,
  NumberInput,
  Select,
  Checkbox,
  Button,
  FileButton,
  Badge,
  Text,
  Divider,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { categoryColor } from '../utils/categoryColors'
import MonthYearPicker from '../components/MonthYearPicker'
import { fmt } from '../utils/formatting'
import { useApi } from '../hooks/useApi'

const currentDate = new Date()

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const emptyForm = {
  description: '',
  amount: '',
  transaction_date: todayStr(),
  transaction_type: 'expense',
  status: 'done',
  payment_method: '',
  is_recurring: false,
  category_id: '',
}

const TYPE_OPTIONS = [
  { value: 'expense', label: '↓ Despesa' },
  { value: 'income', label: '↑ Receita' },
]
const STATUS_OPTIONS = [
  { value: 'done', label: 'Realizado' },
  { value: 'provision', label: 'Provisão' },
]
const PAYMENT_OPTIONS = [
  { value: '', label: 'Sem método' },
  { value: 'credit_card', label: 'Cartão de crédito' },
  { value: 'account', label: 'Conta' },
]
const FILTER_TYPE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'expense', label: 'Despesas' },
  { value: 'income', label: 'Receitas' },
]

function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState({})
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())
  const [type, setType] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [csvFile, setCsvFile] = useState(null)

  const apiFetch = useApi()

  useEffect(() => {
    apiFetch('/categories')
      .then((res) => res.json())
      .then((data) => {
        const map = {}
        data.forEach((cat) => { map[cat.category_id] = cat.name })
        setCategories(map)
      })
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [month, year, type])

  function fetchTransactions() {
    setLoading(true)
    const params = { month, year }
    if (type) params.type = type
    const query = new URLSearchParams(params).toString()

    apiFetch(`/transactions?${query}`)
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data)
        setLoading(false)
      })
  }

  function updateForm(field, value) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'transaction_type' && value === 'income') {
        updated.payment_method = 'account'
      }
      return updated
    })
  }

  async function handleCreate(e) {
    e.preventDefault()

    const body = {
      ...form,
      amount: parseFloat(form.amount),
      category_id: form.category_id ? parseInt(form.category_id) : null,
      payment_method: form.payment_method || null,
    }

    await apiFetch('/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setForm(emptyForm)
    fetchTransactions()
  }

  async function handleImport() {
    if (!csvFile) return

    const formData = new FormData()
    formData.append('file', csvFile)

    const result = await apiFetch(
      '/transactions/import/csv?transaction_type=expense&status=done',
      { method: 'POST', body: formData }
    )

    const data = await result.json()
    alert(`Importadas: ${data.imported} | Ignoradas: ${data.skipped}`)
    setCsvFile(null)
    fetchTransactions()
  }

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="xl">Transações</Title>

      <Group gap="sm" mb="xl" wrap="wrap">
        <MonthYearPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />
        <Select
          value={type}
          onChange={(value) => setType(value ?? '')}
          data={FILTER_TYPE_OPTIONS}
          allowDeselect={false}
          w={140}
        />
        <Group gap="xs" ml="auto">
          <FileButton onChange={setCsvFile} accept=".csv">
            {(props) => (
              <Button variant="default" {...props}>
                {csvFile ? csvFile.name : 'CSV'}
              </Button>
            )}
          </FileButton>
          {csvFile && <Button onClick={handleImport}>Importar</Button>}
        </Group>
      </Group>

      <Paper withBorder radius="md" p="md" mb="lg" shadow="xs">
        <form onSubmit={handleCreate}>
          <Stack gap="sm">
            <SimpleRow>
              <TextInput
                placeholder="Descrição"
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                required
                style={{ flex: 1 }}
              />
              <NumberInput
                placeholder="Valor"
                value={form.amount}
                onChange={(value) => updateForm('amount', value)}
                decimalScale={2}
                fixedDecimalScale
                hideControls
                required
                style={{ flex: 1 }}
              />
              <DateInput
                value={form.transaction_date}
                onChange={(value) => updateForm('transaction_date', value)}
                valueFormat="DD/MM/YYYY"
                required
                style={{ flex: 1 }}
              />
            </SimpleRow>
            <SimpleRow>
              <Select
                value={form.transaction_type}
                onChange={(value) => updateForm('transaction_type', value)}
                data={TYPE_OPTIONS}
                allowDeselect={false}
                style={{ flex: 1 }}
              />
              <Select
                value={form.status}
                onChange={(value) => updateForm('status', value)}
                data={STATUS_OPTIONS}
                allowDeselect={false}
                style={{ flex: 1 }}
              />
              <Select
                value={form.payment_method}
                onChange={(value) => updateForm('payment_method', value ?? '')}
                data={PAYMENT_OPTIONS}
                allowDeselect={false}
                style={{ flex: 1 }}
              />
            </SimpleRow>
            <Group justify="space-between">
              <Checkbox
                label="Recorrente"
                checked={form.is_recurring}
                onChange={(e) => updateForm('is_recurring', e.currentTarget.checked)}
              />
              <Button type="submit">Salvar</Button>
            </Group>
          </Stack>
        </form>
      </Paper>

      {loading ? (
        <Text c="dimmed">Carregando...</Text>
      ) : transactions.length === 0 ? (
        <Text c="dimmed">Nenhuma transação encontrada.</Text>
      ) : (
        <Paper withBorder radius="md" shadow="xs">
          {transactions.map((t, i) => (
            <div key={t.transaction_id}>
              {i > 0 && <Divider />}
              <Group p="sm" gap="md" wrap="nowrap">
                <Text size="xs" c="dimmed" miw={75}>
                  {t.transaction_date}
                </Text>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm">{t.description}</Text>
                  {(t.payment_method || t.status === 'provision') && (
                    <Text size="xs" c="dimmed">
                      {t.payment_method === 'credit_card' && `Cartão ${t.creditcard ? `•••• ${t.creditcard}` : ''}`}
                      {t.payment_method === 'account' && 'Conta'}
                      {t.status === 'provision' && ' · provisão'}
                    </Text>
                  )}
                </div>
                {t.category_id && (
                  <Badge
                    variant="light"
                    radius="sm"
                    style={categoryColor(t.category_id)}
                  >
                    {categories[t.category_id] ?? '—'}
                  </Badge>
                )}
                <Text
                  size="sm"
                  fw={600}
                  miw={110}
                  ta="right"
                  c={t.transaction_type === 'income' ? 'teal.7' : 'red.7'}
                >
                  {t.transaction_type === 'income' ? '↑' : '↓'} R$ {fmt(t.amount)}
                </Text>
              </Group>
            </div>
          ))}
        </Paper>
      )}
    </Container>
  )
}

function SimpleRow({ children }) {
  return (
    <Group gap="sm" grow align="flex-start">
      {children}
    </Group>
  )
}

export default TransactionsPage
