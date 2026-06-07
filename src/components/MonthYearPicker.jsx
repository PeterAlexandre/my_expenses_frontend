import { useState, useEffect } from 'react'
import { Select, NumberInput, Tooltip } from '@mantine/core'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const MONTH_OPTIONS = MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))

function MonthYearPicker({ month, year, onMonthChange, onYearChange }) {
  const [yearRaw, setYearRaw] = useState(year)

  useEffect(() => {
    if (typeof year === 'number' && year >= 2000) setYearRaw(year)
  }, [year])

  const yearInvalid = typeof yearRaw === 'number' && yearRaw < 2000

  return (
    <>
      <Select
        value={String(month)}
        onChange={(value) => onMonthChange(Number(value))}
        data={MONTH_OPTIONS}
        allowDeselect={false}
        w={140}
      />
      <Tooltip label="Mínimo: 2000" disabled={!yearInvalid}>
        <NumberInput
          value={yearRaw}
          onChange={(value) => {
            setYearRaw(value)
            if (typeof value === 'number' && value >= 2000) onYearChange(value)
          }}
          error={yearInvalid}
          hideControls
          w={90}
        />
      </Tooltip>
    </>
  )
}

export default MonthYearPicker
