import { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Group,
  Stack,
  Paper,
  Box,
  TextInput,
  Button,
  ActionIcon,
  Badge,
  Text,
  Divider,
} from '@mantine/core'
import { categoryColor } from '../utils/categoryColors'
import { useApi } from '../hooks/useApi'

function KeywordInputs({ list, setList }) {
  function update(index, value) {
    const next = [...list]
    next[index] = value
    setList(next)
  }
  function add() { setList([...list, '']) }
  function remove(index) {
    if (list.length === 1) setList([''])
    else setList(list.filter((_, i) => i !== index))
  }

  return (
    <Stack gap={6} style={{ flex: 1.5 }}>
      {list.map((kw, i) => (
        <Group key={i} gap={6} wrap="nowrap">
          <TextInput
            placeholder="Palavra-chave"
            value={kw}
            onChange={(e) => update(i, e.target.value)}
            style={{ flex: 1 }}
          />
          <ActionIcon
            variant="default"
            size="lg"
            onClick={() => remove(i)}
            title="Remover"
          >
            ×
          </ActionIcon>
        </Group>
      ))}
      <Button variant="default" size="xs" onClick={add} style={{ alignSelf: 'flex-start' }}>
        + palavra
      </Button>
    </Stack>
  )
}

function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [keywords, setKeywords] = useState([''])
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [editingKeywords, setEditingKeywords] = useState([''])

  const apiFetch = useApi()

  useEffect(() => {
    fetchCategories()
  }, [])

  function fetchCategories() {
    setLoading(true)
    apiFetch('/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data)
        setLoading(false)
      })
  }

  async function handleCreate(e) {
    e.preventDefault()
    const pattern = keywords.filter((k) => k.trim()).join(';')
    await apiFetch('/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, pattern: pattern || null }),
    })
    setName('')
    setKeywords([''])
    fetchCategories()
  }

  async function handleDelete(id) {
    await apiFetch(`/categories/${id}`, { method: 'DELETE' })
    fetchCategories()
  }

  async function handleEdit(id) {
    const pattern = editingKeywords.filter((k) => k.trim()).join(';')
    await apiFetch(`/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingName, pattern: pattern || null }),
    })
    setEditingId(null)
    setEditingName('')
    setEditingKeywords([''])
    fetchCategories()
  }

  function startEditing(cat) {
    setEditingId(cat.category_id)
    setEditingName(cat.name)
    setEditingKeywords(cat.pattern ? cat.pattern.split(';') : [''])
  }

  function patternTags(pattern) {
    if (!pattern) return []
    return pattern.split(';').filter(Boolean)
  }

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="xl">Categorias</Title>

      <Paper withBorder radius="md" p="md" mb="lg" shadow="xs">
        <form onSubmit={handleCreate}>
          <Group align="flex-start" gap="sm">
            <TextInput
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ flex: '0 0 180px' }}
            />
            <KeywordInputs list={keywords} setList={setKeywords} />
            <Button type="submit">Criar</Button>
          </Group>
        </form>
      </Paper>

      {loading ? (
        <Text c="dimmed">Carregando...</Text>
      ) : categories.length === 0 ? (
        <Text c="dimmed">Nenhuma categoria cadastrada.</Text>
      ) : (
        <Paper withBorder radius="md" shadow="xs">
          {categories.map((cat, i) => (
            <Box key={cat.category_id}>
              {i > 0 && <Divider />}
              {editingId === cat.category_id ? (
                <Stack gap="sm" p="md">
                  <TextInput
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Nome"
                    autoFocus
                  />
                  <KeywordInputs list={editingKeywords} setList={setEditingKeywords} />
                  <Group gap="xs">
                    <Button size="xs" onClick={() => handleEdit(cat.category_id)}>
                      Salvar
                    </Button>
                    <Button size="xs" variant="default" onClick={() => setEditingId(null)}>
                      Cancelar
                    </Button>
                  </Group>
                </Stack>
              ) : (
                <Group p="sm" gap="md" wrap="nowrap">
                  <Badge variant="light" radius="sm" color={categoryColor(cat.category_id)}>
                    {cat.name}
                  </Badge>
                  <Group gap={6} style={{ flex: 1 }} wrap="wrap">
                    {patternTags(cat.pattern).map((tag) => (
                      <Badge
                        key={tag}
                        variant="default"
                        radius="sm"
                        style={{ fontFamily: 'monospace', textTransform: 'none' }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                  <Group gap={4}>
                    <Button size="xs" variant="default" onClick={() => startEditing(cat)}>
                      Editar
                    </Button>
                    <Button size="xs" variant="subtle" color="red" onClick={() => handleDelete(cat.category_id)}>
                      Deletar
                    </Button>
                  </Group>
                </Group>
              )}
            </Box>
          ))}
        </Paper>
      )}
    </Container>
  )
}

export default CategoriesPage
