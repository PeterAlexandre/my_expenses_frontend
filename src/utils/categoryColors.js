const PALETTE = [
  { backgroundColor: '#dcfce7', color: '#166534' }, // verde
  { backgroundColor: '#dbeafe', color: '#1e40af' }, // azul
  { backgroundColor: '#fce7f3', color: '#9d174d' }, // rosa
  { backgroundColor: '#ede9fe', color: '#5b21b6' }, // roxo
  { backgroundColor: '#ffedd5', color: '#9a3412' }, // laranja
  { backgroundColor: '#cffafe', color: '#155e75' }, // ciano
  { backgroundColor: '#fef08a', color: '#854d0e' }, // amarelo
  { backgroundColor: '#fee2e2', color: '#991b1b' }, // vermelho claro
]

export function categoryColor(id) {
  return PALETTE[id % PALETTE.length]
}
