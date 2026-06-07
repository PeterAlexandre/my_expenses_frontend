import { Select, NumberInput } from '@mantine/core'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const MONTH_OPTIONS = MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))

function MonthYearPicker({ month, year, onMonthChange, onYearChange }) {
  return (
    <>
      <Select
        value={String(month)}
        onChange={(value) => onMonthChange(Number(value))}
        data={MONTH_OPTIONS}
        allowDeselect={false}
        w={140}
      />
      <NumberInput
        value={Number(year)}
        onChange={(value) => onYearChange(value)}
        min={2000}
        hideControls
        w={90}
      />
    </>
  )
}

export default MonthYearPicker
