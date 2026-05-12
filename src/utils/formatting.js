export function fmt(value) {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}
