import { useState, useEffect } from 'react'
import { categoryColor } from '../utils/categoryColors'

function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [pattern, setPattern] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchCategories()
  }, [])

  function fetchCategories() {
    setLoading(true)
    fetch('http://localhost:8000/categories', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCategories(data)
        setLoading(false)
      })
  }

  async function handleCreate(e) {
    e.preventDefault()
    await fetch('http://localhost:8000/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, pattern }),
    })
    setName('')
    setPattern('')
    fetchCategories()
  }

  async function handleDelete(id) {
    await fetch(`http://localhost:8000/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchCategories()
  }

  async function handleEdit(id) {
    await fetch(`http://localhost:8000/categories/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingName }),
    })
    setEditingId(null)
    setEditingName('')
    fetchCategories()
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
        />
        <input
          type="text"
          placeholder="Padrão (Ex: uber;passagem;transporte)"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          style={{ flex: 1.5 }}
        />
        <button type="submit" className="btn-primary">Criar</button>
      </form>

      {loading
        ? <p className="muted">Carregando...</p>
        : categories.length === 0
          ? <p className="muted">Nenhuma categoria cadastrada.</p>
          : <div className="list">
              {categories.map((cat) => (
                <div key={cat.category_id} className="list-item">
                  {editingId === cat.category_id
                    ? <div className="edit-row">
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          autoFocus
                        />
                        <button className="btn-primary btn-sm" onClick={() => handleEdit(cat.category_id)}>Salvar</button>
                        <button className="btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancelar</button>
                      </div>
                    : <>
                        <span
                          className="tx-badge"
                          style={categoryColor(cat.category_id)}
                        >
                          {cat.name}
                        </span>
                        {cat.pattern && <span className="cat-pattern">{cat.pattern}</span>}
                        <div className="list-item-actions">
                          <button className="btn-ghost btn-sm" onClick={() => { setEditingId(cat.category_id); setEditingName(cat.name) }}>Editar</button>
                          <button className="btn-danger" onClick={() => handleDelete(cat.category_id)}>Deletar</button>
                        </div>
                      </>
                  }
                </div>
              ))}
            </div>
      }
    </div>
  )
}

export default CategoriesPage
