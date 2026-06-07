import { useState, useEffect, useRef } from 'react'
import {
  Container,
  Title,
  Group,
  Stack,
  Paper,
  Box,
  Center,
  Loader,
  Modal,
  TextInput,
  Button,
  ActionIcon,
  Badge,
  Text,
  Divider,
  Alert,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { categoryColor } from '../utils/categoryColors'
import { useApi } from '../hooks/useApi'

function KeywordEditor({ keywords, onChange }) {
  const [input, setInput] = useState('')

  function addKeyword() {
    const kw = input.trim()
    if (!kw || keywords.includes(kw)) {
      setInput('')
      return
    }
    onChange([...keywords, kw])
    setInput('')
  }

  function removeKeyword(kw) {
    onChange(keywords.filter((k) => k !== kw))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  return (
    <Group gap={4} wrap="wrap" align="center">
      {keywords.map((kw) => (
        <Badge
          key={kw}
          variant="outline"
          radius="sm"
          style={{ fontFamily: 'monospace', textTransform: 'none' }}
          rightSection={
            <ActionIcon
              size={14}
              variant="transparent"
              color="gray"
              onClick={() => removeKeyword(kw)}
              style={{ cursor: 'pointer' }}
            >
              ×
            </ActionIcon>
          }
        >
          {kw}
        </Badge>
      ))}
      <input
        type="text"
        placeholder="nova palavra"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          border: '1px solid var(--mantine-color-gray-4)',
          borderRadius: 'var(--mantine-radius-sm)',
          padding: '0 calc(var(--mantine-spacing-xs) / 2)',
          height: 'var(--badge-height, 20px)',
          fontSize: 'var(--mantine-font-size-xs)',
          lineHeight: 1,
          fontFamily: 'monospace',
          outline: 'none',
          background: 'transparent',
          color: 'inherit',
          minWidth: '14ch',
          width: `${Math.max(14, input.length + 2)}ch`,
          transition: 'width 0.1s',
        }}
      />
    </Group>
  )
}

function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [draft, setDraft] = useState([])
  const [saving, setSaving] = useState(false)
  const [nameErrors, setNameErrors] = useState({})
  const [confirmingDeleteKey, setConfirmingDeleteKey] = useState(null)
  const [bulkConfirmOpened, { open: openBulkConfirm, close: closeBulkConfirm }] = useDisclosure(false)
  const nextKey = useRef(0)

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

  function enterEditMode() {
    setDraft(
      categories.map((cat) => ({
        _key: String(cat.category_id),
        category_id: cat.category_id,
        name: cat.name,
        keywords: cat.pattern ? cat.pattern.split(';').filter(Boolean) : [],
        deleted: false,
      }))
    )
    setNameErrors({})
    setConfirmingDeleteKey(null)
    setEditMode(true)
  }

  function cancelEdit() {
    setDraft([])
    setEditMode(false)
    setConfirmingDeleteKey(null)
  }

  function addNewCategory() {
    const key = `new_${nextKey.current++}`
    setDraft((d) => [
      ...d,
      { _key: key, category_id: null, name: '', keywords: [], deleted: false },
    ])
  }

  function updateDraftItem(_key, patch) {
    setDraft((d) => d.map((item) => (item._key === _key ? { ...item, ...patch } : item)))
  }

  function requestDelete(_key) {
    const item = draft.find((d) => d._key === _key)
    if (item.keywords.length > 0) {
      setConfirmingDeleteKey(_key)
    } else if (item.category_id) {
      updateDraftItem(_key, { deleted: true })
    } else {
      setDraft((d) => d.filter((i) => i._key !== _key))
    }
  }

  function confirmDelete(_key) {
    const item = draft.find((d) => d._key === _key)
    if (item.category_id) {
      updateDraftItem(_key, { deleted: true })
    } else {
      setDraft((d) => d.filter((i) => i._key !== _key))
    }
    setConfirmingDeleteKey(null)
  }

  function deletedExistingCategories() {
    return draft.filter((item) => item.deleted && item.category_id !== null)
  }

  function validate() {
    const errors = {}
    draft
      .filter((item) => !item.deleted)
      .forEach((item) => {
        if (!item.name.trim()) errors[item._key] = 'Nome é obrigatório'
      })
    setNameErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleSaveClick() {
    if (!validate()) return
    if (deletedExistingCategories().length > 0) {
      openBulkConfirm()
    } else {
      performSave()
    }
  }

  async function performSave() {
    closeBulkConfirm()
    setSaving(true)
    const payload = draft
      .filter((item) => !item.deleted)
      .map((item) => ({
        ...(item.category_id ? { category_id: item.category_id } : {}),
        name: item.name.trim(),
        pattern: item.keywords.length ? item.keywords.join(';') : null,
      }))

    await apiFetch('/categories/bulk', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: payload }),
    })
    setSaving(false)
    setEditMode(false)
    setDraft([])
    fetchCategories()
  }

  function patternTags(pattern) {
    if (!pattern) return []
    return pattern.split(';').filter(Boolean)
  }

  const activeItems = draft.filter((item) => !item.deleted)

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Categorias</Title>
        {!editMode && !loading && (
          <Button onClick={enterEditMode}>Editar categorias</Button>
        )}
      </Group>

      {loading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : !editMode ? (
        categories.length === 0 ? (
          <Text c="dimmed">Nenhuma categoria cadastrada.</Text>
        ) : (
          <Paper withBorder radius="md" shadow="xs">
            {categories.map((cat, i) => (
              <Box key={cat.category_id}>
                {i > 0 && <Divider />}
                <Group p="sm" gap="md" wrap="nowrap">
                  <Badge
                    variant="light"
                    radius="sm"
                    color={categoryColor(cat.category_id)}
                    style={{ flexShrink: 0 }}
                  >
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
                </Group>
              </Box>
            ))}
          </Paper>
        )
      ) : (
        <Stack>
          <Paper withBorder radius="md" shadow="xs">
            {activeItems.length === 0 && (
              <Text c="dimmed" p="md">
                Nenhuma categoria ativa. Clique em "+ Nova categoria" para adicionar.
              </Text>
            )}
            {activeItems.map((item, i) => (
              <Box key={item._key}>
                {i > 0 && <Divider />}
                <Stack p="md" gap="sm">
                  <Group align="flex-start" gap="sm">
                    <TextInput
                      placeholder="Nome da categoria *"
                      value={item.name}
                      onChange={(e) => updateDraftItem(item._key, { name: e.target.value })}
                      error={nameErrors[item._key]}
                      style={{ flex: 1 }}
                    />
                    <Button
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={() => requestDelete(item._key)}
                    >
                      Remover
                    </Button>
                  </Group>

                  {confirmingDeleteKey === item._key && (
                    <Alert color="orange" title="Atenção" radius="sm">
                      <Stack gap="xs">
                        <Text size="sm">
                          As transações categorizadas como{' '}
                          <strong>"{item.name || 'esta categoria'}"</strong> perderão a categoria.
                        </Text>
                        <Group gap="xs">
                          <Button size="xs" color="red" onClick={() => confirmDelete(item._key)}>
                            Confirmar remoção
                          </Button>
                          <Button
                            size="xs"
                            variant="default"
                            onClick={() => setConfirmingDeleteKey(null)}
                          >
                            Manter
                          </Button>
                        </Group>
                      </Stack>
                    </Alert>
                  )}

                  <KeywordEditor
                    keywords={item.keywords}
                    onChange={(kws) => updateDraftItem(item._key, { keywords: kws })}
                  />
                </Stack>
              </Box>
            ))}
          </Paper>

          <Button
            variant="default"
            onClick={addNewCategory}
            style={{ alignSelf: 'flex-start' }}
          >
            + Nova categoria
          </Button>

          <Group>
            <Button onClick={handleSaveClick} loading={saving}>
              Salvar
            </Button>
            <Button variant="default" onClick={cancelEdit} disabled={saving}>
              Cancelar
            </Button>
          </Group>
        </Stack>
      )}

      <Modal
        opened={bulkConfirmOpened}
        onClose={closeBulkConfirm}
        title="Confirmar exclusão de categorias"
        size="sm"
        centered
      >
        <Text size="sm" mb="xs">
          As seguintes categorias serão removidas permanentemente. As transações vinculadas
          perderão a categoria:
        </Text>
        <Stack gap={4} mb="lg">
          {deletedExistingCategories().map((item) => (
            <Badge key={item._key} variant="light" color="red">
              {item.name}
            </Badge>
          ))}
        </Stack>
        <Group justify="flex-end" gap="xs">
          <Button variant="default" onClick={closeBulkConfirm}>
            Cancelar
          </Button>
          <Button color="red" onClick={performSave} loading={saving}>
            Confirmar e salvar
          </Button>
        </Group>
      </Modal>
    </Container>
  )
}

export default CategoriesPage
