import { useEffect, useState } from 'react'
import { TextInput } from '@mantine/core'

export function CurrencyInput({ value, onChange, placeholder, required }) {
  const [cents, setCents] = useState(Math.round((value || 0) * 100))

  useEffect(() => {
    setCents(Math.round((value || 0) * 100))
  }, [value])

  function handleKeyDown(e) {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault()
      const next = cents * 10 + Number(e.key)
      if (next > 9999999999) return // max 99.999.999,99
      setCents(next)
      onChange(next / 100)
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      const next = Math.floor(cents / 10)
      setCents(next)
      onChange(next / 100)
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '')
    if (!digits) return
    const next = Math.min(parseInt(digits, 10), 9999999999)
    setCents(next)
    onChange(next / 100)
  }

  const display = (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <TextInput
      value={display}
      onChange={() => {}}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder={placeholder}
      required={required}
      inputMode="numeric"
    />
  )
}
