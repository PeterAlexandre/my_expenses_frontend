import { useState, useEffect } from 'react'
import MonthYearPicker from '../components/MonthYearPicker'
import SummaryCard from '../components/SummaryCard'
import { fmt } from '../utils/formatting'
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
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <div className="filters" style={{ margin: 0 }}>
          <MonthYearPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />
        </div>
      </div>

      {loading || !report
        ? <p className="muted">Carregando...</p>
        : <>
            <div className="section">
              <h3>Resumo</h3>
              <div className="summary-grid">
                <SummaryCard title="Receitas" value={report.summary.income_total} variant="income" />
                <SummaryCard title="Despesas" value={report.summary.expenses_total} variant="expense" />
                <SummaryCard title="Diferença" value={report.summary.difference} />
              </div>
              <div className="summary-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <SummaryCard title="Cartão de Crédito" value={report.credit_card_total} />
                <SummaryCard title="Saldo Atual" value={report.current_balance} />
              </div>
            </div>

            {report.by_category.length > 0 && (
              <div className="section">
                <h3>Por Categoria</h3>
                <div className="card">
                  {report.by_category.map((cat) => (
                    <div key={cat.name} className="cat-bar-row">
                      <span className="cat-bar-label">{cat.name === 'Uncategorized' ? 'Sem categoria' : cat.name}</span>
                      <div className="cat-bar-track">
                        <div className="cat-bar-fill" style={{ width: `${cat.percentage}%` }} />
                      </div>
                      <span className="cat-bar-amount">R$ {fmt(cat.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="summary-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <SummaryCard title="A Receber" value={report.provisions.to_receive.total} variant="income" />
              <SummaryCard title="A Pagar" value={report.provisions.to_pay.total} variant="expense" />
            </div>
          </>
      }
    </div>
  )
}

export default DashboardPage
