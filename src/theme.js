import { createTheme } from '@mantine/core'

export const theme = createTheme({
  primaryColor: 'forest',
  primaryShade: { light: 7, dark: 5 },
  fontFamily: 'system-ui, -apple-system, sans-serif',
  defaultRadius: 'md',
  colors: {
    forest: [
      '#eef6ef',
      '#d6e6d8',
      '#a8d0ad',
      '#76b87f',
      '#4ea358',
      '#369641',
      '#2a7a38',
      '#206030',
      '#174825',
      '#0f3019',
    ],
  },
})
