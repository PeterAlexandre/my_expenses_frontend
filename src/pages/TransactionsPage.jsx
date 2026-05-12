import { useState, useEffect } from 'react'
import { categoryColor } from '../utils/categoryColors'
import MonthYearPicker from '../components/MonthYearPicker'
import { fmt } from '../utils/formatting'

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


function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState({})
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())
  const [type, setType] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [csvFile, setCsvFile] = useState(null)

  const token = localStorage.getItem('token')

  useEffect(() => {
    fetch('http://localhost:8000/categories', {
      headers: { Authorization: `Bearer ${token}` },
    })
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

    fetch(`http://localhost:8000/transactions?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data)
        setLoading(false)
      })
  }

  function handleFormChange(e) {
    const { name, value, type: inputType, checked } = e.target
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: inputType === 'checkbox' ? checked : value,
      }
      if (name === 'transaction_type' && value === 'income') {
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

    await fetch('http://localhost:8000/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    fetchTransactions()
  }

  async function handleImport(e) {
    e.preventDefault()
    if (!csvFile) return

    const formData = new FormData()
    formData.append('file', csvFile)

    const result = await fetch(
      'http://localhost:8000/transactions/import/csv?transaction_type=expense&status=done',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    )

    const data = await result.json()
    alert(`Importadas: ${data.imported} | Ignoradas: ${data.skipped}`)
    setCsvFile(null)
    fetchTransactions()
  }

  return (
    <div className="page">
      <h2>Transações</h2>

      <div className="filters">
        <MonthYearPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Todos</option>
          <option value="expense">Despesas</option>
          <option value="income">Receitas</option>
        </select>
        <div className="actions">
          <label className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: '0.55rem 1.1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={(e) => { setCsvFile(e.target.files[0]); }}
            />
            {csvFile ? csvFile.name : 'CSV'}
          </label>
          {csvFile && (
            <button className="btn-primary" onClick={handleImport}>Importar</button>
          )}
        </div>
      </div>

      <div className="panel">
        <form onSubmit={handleCreate}>
          <div className="form-row cols-3">
            <input name="description" placeholder="Descrição" value={form.description} onChange={handleFormChange} required />
            <input name="amount" type="number" step="0.01" placeholder="Valor" value={form.amount} onChange={handleFormChange} required />
            <input name="transaction_date" type="date" value={form.transaction_date} onChange={handleFormChange} required />
          </div>
          <div className="form-row cols-3">
            <select name="transaction_type" value={form.transaction_type} onChange={handleFormChange}>
              <option value="expense">↓ Despesa</option>
              <option value="income">↑ Receita</option>
            </select>
            <select name="status" value={form.status} onChange={handleFormChange}>
              <option value="done">Realizado</option>
              <option value="provision">Provisão</option>
            </select>
            <select name="payment_method" value={form.payment_method} onChange={handleFormChange}>
              <option value="">Sem método</option>
              <option value="credit_card">Cartão de crédito</option>
              <option value="account">Conta</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label className="field-check">
              <input name="is_recurring" type="checkbox" checked={form.is_recurring} onChange={handleFormChange} />
              Recorrente
            </label>
            <button type="submit" className="btn-primary">Salvar</button>
          </div>
        </form>
      </div>

      {loading
        ? <p className="muted">Carregando...</p>
        : transactions.length === 0
          ? <p className="muted">Nenhuma transação encontrada.</p>
          : <div className="list">
              {transactions.map((t) => (
                <div key={t.transaction_id} className="list-item">
                  <span className="tx-date">{t.transaction_date}</span>
                  <span className="tx-desc">
                    {t.description}
                    {(t.payment_method || t.status === 'pending') && (
                      <div className="tx-meta">
                        {t.payment_method === 'credit_card' && `Cartão ${t.creditcard ? `•••• ${t.creditcard}` : ''}`}
                        {t.payment_method === 'account' && 'Conta'}
                        {t.status === 'provision' && ' · provisão'}
                      </div>
                    )}
                  </span>
                  {t.category_id && (
                    <span className="tx-badge" style={categoryColor(t.category_id)}>
                      {categories[t.category_id] ?? '—'}
                    </span>
                  )}
                  <span className={`tx-amount ${t.transaction_type === 'income' ? 'income' : 'expense'}`}>
                    {t.transaction_type === 'income' ? '↑' : '↓'} R$ {fmt(t.amount)}
                  </span>
                </div>
              ))}
            </div>
      }
    </div>
  )
}

export default TransactionsPage
