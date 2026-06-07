const COLORS = ['green', 'blue', 'grape', 'violet', 'orange', 'cyan', 'yellow', 'red']

export function categoryColor(id) {
  return COLORS[id % COLORS.length]
}
