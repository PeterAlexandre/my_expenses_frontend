const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function MonthYearPicker({ month, year, onMonthChange, onYearChange }) {
  return (
    <>
      <select value={month} onChange={(e) => onMonthChange(e.target.value)}>
        {MONTHS.map((m, i) => (
          <option key={i + 1} value={i + 1}>{m}</option>
        ))}
      </select>
      <input
        type="number"
        value={year}
        onChange={(e) => onYearChange(e.target.value)}
        min="2000"
        style={{ width: 80 }}
      />
    </>
  )
}

export default MonthYearPicker
