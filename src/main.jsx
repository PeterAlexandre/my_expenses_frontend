import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'
import 'dayjs/locale/pt-br'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import './index.css'
import App from './App.jsx'
import { theme } from './theme'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <DatesProvider settings={{ locale: 'pt-br' }}>
        <App />
      </DatesProvider>
    </MantineProvider>
  </StrictMode>,
)
