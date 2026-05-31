import { fmt } from '../utils/formatting'

function SummaryCard({ title, value, variant }) {
  return (
    <div className="summary-card">
      <h3>{title}</h3>
      <div className={`value${variant ? ` ${variant}` : ''}`}>R$ {fmt(value)}</div>
    </div>
  )
}

export default SummaryCard
