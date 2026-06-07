import { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Group,
  Stack,
  Paper,
  Box,
  Center,
  Loader,
  TextInput,
  Select,
  Input,
  Checkbox,
  Popover,
  ComboboxChevron,
  Button,
  FileButton,
  Badge,
  Text,
  Divider,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { DateInput } from '@mantine/dates'
import { categoryColor } from '../utils/categoryColors'
import MonthYearPicker from '../components/MonthYearPicker'
import { fmt } from '../utils/formatting'
import { useApi } from '../hooks/useApi'
import { CurrencyInput } from '../components/CurrencyInput'
import { useDebouncedValue } from '@mantine/hooks'

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
  { value: 'credit_card', label: 'Cartão de crédito' },
  { value: 'account', label: 'Conta' },
]
const FILTER_TYPE_OPTIONS = [
  { value: '', label: 'Todos tipos' },
  { value: 'expense', label: 'Despesas' },
  { value: 'income', label: 'Receitas' },
]
const FILTER_STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'done', label: 'Realizado' },
  { value: 'provision', label: 'Provisão' },
]
const FILTER_PAYMENT_OPTIONS = [
  { value: '', label: 'Todos os métodos' },
  { value: 'credit_card', label: 'Cartão de crédito' },
  { value: 'account', label: 'Conta' },
]

function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState({})
  const [categoriesList, setCategoriesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [categoryIds, setCategoryIds] = useState([])
  const [description, setDescription] = useState('')
  const [debouncedDescription] = useDebouncedValue(description, 500)
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
        setCategoriesList(
          data.map((cat) => ({ value: String(cat.category_id), label: cat.name }))
        )
      })
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [month, year, type, status, paymentMethod, categoryIds, debouncedDescription])

  function fetchTransactions() {
    setLoading(true)
    const params = { month, year }
    if (type) params.type = type
    if (status) params.status = status
    if (paymentMethod) params.payment_method = paymentMethod
    if (debouncedDescription) params.description = debouncedDescription
    const query = new URLSearchParams(params).toString()
    const categoryQuery = categoryIds.map((id) => `category_id=${id}`).join('&')
    const fullQuery = [query, categoryQuery].filter(Boolean).join('&')

    apiFetch(`/transactions?${fullQuery}`)
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
    notifications.show({
      message: `Importadas: ${data.imported} | Ignoradas: ${data.skipped}`,
      color: 'green',
    })
    setCsvFile(null)
    fetchTransactions()
  }

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="xl">Transações</Title>

      <Stack gap="xs" mb="xl">
        <Group gap="sm" wrap="wrap">
          <MonthYearPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />
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
        <Group gap="sm" grow wrap="nowrap">
          <TextInput
            placeholder="Buscar por descrição..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select
            value={type}
            onChange={(value) => setType(value ?? '')}
            data={FILTER_TYPE_OPTIONS}
            allowDeselect={false}
          />
          <Select
            value={status}
            onChange={(value) => setStatus(value ?? '')}
            data={FILTER_STATUS_OPTIONS}
            allowDeselect={false}
          />
          <Select
            value={paymentMethod}
            onChange={(value) => setPaymentMethod(value ?? '')}
            data={FILTER_PAYMENT_OPTIONS}
            allowDeselect={false}
          />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <CategoryFilter
              value={categoryIds}
              onChange={setCategoryIds}
              data={categoriesList}
            />
          </Box>
        </Group>
      </Stack>

      <Paper withBorder radius="md" p="md" mb="lg" shadow="xs">
        <form onSubmit={handleCreate}>
          <Stack gap="sm">
            <SimpleRow>
              <TextInput
                placeholder="Descrição"
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                required
              />
              <CurrencyInput
                placeholder="Valor"
                value={form.amount}
                onChange={(value) => updateForm('amount', value)}
                required
              />
              <DateInput
                value={form.transaction_date}
                onChange={(value) => updateForm('transaction_date', value)}
                valueFormat="DD/MM/YYYY"
                required
              />
            </SimpleRow>
            <SimpleRow>
              <Select
                value={form.transaction_type}
                onChange={(value) => updateForm('transaction_type', value)}
                data={TYPE_OPTIONS}
                allowDeselect={false}
              />
              <Select
                value={form.status}
                onChange={(value) => updateForm('status', value)}
                data={STATUS_OPTIONS}
                allowDeselect={false}
              />
              <Select
                placeholder="Sem método"
                value={form.payment_method || null}
                onChange={(value) => updateForm('payment_method', value ?? '')}
                data={PAYMENT_OPTIONS}
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
        <Center py="xl"><Loader /></Center>
      ) : transactions.length === 0 ? (
        <Text c="dimmed">Nenhuma transação encontrada.</Text>
      ) : (
        <Paper withBorder radius="md" shadow="xs">
          {transactions.map((t, i) => (
            <Box key={t.transaction_id}>
              {i > 0 && <Divider />}
              <Group p="sm" gap="md" wrap="nowrap">
                <Text size="xs" c="dimmed" miw={75}>
                  {t.transaction_date}
                </Text>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm">{t.description}</Text>
                  {(t.payment_method || t.status === 'provision') && (
                    <Text size="xs" c="dimmed">
                      {t.payment_method === 'credit_card' && `Cartão ${t.creditcard ? `•••• ${t.creditcard}` : ''}`}
                      {t.payment_method === 'account' && 'Conta'}
                      {t.status === 'provision' && ' · provisão'}
                    </Text>
                  )}
                </Box>
                {t.category_id && (
                  <Badge
                    variant="light"
                    radius="sm"
                    color={categoryColor(t.category_id)}
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
            </Box>
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

function CategoryFilter({ value, onChange, data }) {
  const [opened, setOpened] = useState(false)

  const label =
    value.length === 0
      ? 'Todas as categorias'
      : value.length === 1
        ? (data.find((d) => d.value === value[0])?.label ?? 'Todas as categorias')
        : `${value.length} categorias`

  return (
    <Popover opened={opened} onChange={setOpened} width="target">
      <Popover.Target>
        <Input
          component="button"
          type="button"
          pointer
          rightSection={<ComboboxChevron />}
          onClick={() => setOpened((o) => !o)}
          w="100%"
        >
          <Text size="sm" c={value.length === 0 ? 'dimmed' : undefined} truncate>
            {label}
          </Text>
        </Input>
      </Popover.Target>
      <Popover.Dropdown p="xs">
        <Checkbox.Group value={value} onChange={onChange}>
          <Stack gap={6}>
            {data.map((item) => (
              <Checkbox key={item.value} value={item.value} label={item.label} size="sm" />
            ))}
          </Stack>
        </Checkbox.Group>
      </Popover.Dropdown>
    </Popover>
  )
}

export default TransactionsPage
