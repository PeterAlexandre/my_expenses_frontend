import { useState, useEffect } from 'react'
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
    <div className="keyword-inputs">
      {list.map((kw, i) => (
        <div key={i} className="keyword-input-row">
          <input
            type="text"
            placeholder="Palavra-chave"
            value={kw}
            onChange={(e) => update(i, e.target.value)}
          />
          <button
            type="button"
            className="btn-ghost btn-icon"
            onClick={() => remove(i)}
            title="Remover"
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" className="btn-ghost btn-sm" onClick={add}>
        + palavra
      </button>
    </div>
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
    <div className="page">
      <h2>Categorias</h2>

      <form className="inline-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ flex: '0 0 180px' }}
        />
        <KeywordInputs list={keywords} setList={setKeywords} />
        <button type="submit" className="btn-primary">
          Criar
        </button>
      </form>

      {loading ? (
        <p className="muted">Carregando...</p>
      ) : categories.length === 0 ? (
        <p className="muted">Nenhuma categoria cadastrada.</p>
      ) : (
        <div className="list">
          {categories.map((cat) => (
            <div
              key={cat.category_id}
              className={`list-item${editingId === cat.category_id ? ' list-item--editing' : ''}`}
            >
              {editingId === cat.category_id ? (
                <div className="edit-panel">
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Nome"
                    autoFocus
                  />
                  <KeywordInputs list={editingKeywords} setList={setEditingKeywords} />
                  <div className="edit-panel-actions">
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => handleEdit(cat.category_id)}
                    >
                      Salvar
                    </button>
                    <button className="btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="tx-badge" style={categoryColor(cat.category_id)}>
                    {cat.name}
                  </span>
                  <div className="keyword-tags">
                    {patternTags(cat.pattern).map((tag) => (
                      <span key={tag} className="keyword-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="list-item-actions">
                    <button className="btn-ghost btn-sm" onClick={() => startEditing(cat)}>
                      Editar
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(cat.category_id)}>
                      Deletar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoriesPage
