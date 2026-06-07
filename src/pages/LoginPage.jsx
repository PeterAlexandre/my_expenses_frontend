import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Center,
  Paper,
  Stack,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Anchor,
  Text,
  Alert,
} from '@mantine/core'
import bg1 from '../assets/background_image1.jpg'
import bg2 from '../assets/background_image2.jpg'

const backgrounds = [bg1, bg2]

function LoginPage() {
  const [bg] = useState(() => backgrounds[Math.floor(Math.random() * backgrounds.length)])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    const body = new URLSearchParams({ username: email, password })

    const response = await fetch('http://localhost:8000/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    if (!response.ok) {
      setError('Email ou senha incorretos')
      return
    }

    const data = await response.json()
    localStorage.setItem('token', data.access_token)
    navigate('/')
  }

  return (
    <Box style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <img
        src={bg}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(8px)',
          transform: 'scale(1.05)',
        }}
      />
      <Center mih="100vh" p="md" style={{ position: 'relative' }}>
      <Paper withBorder shadow="sm" radius="md" p="xl" w="100%" maw={400}>
        <Title order={2} mb="lg">Entrar</Title>
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <PasswordInput
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <Alert color="red" variant="light" p="xs">{error}</Alert>}
            <Button type="submit" fullWidth mt="xs">Entrar</Button>
          </Stack>
        </form>
        <Text ta="center" size="sm" c="dimmed" mt="lg">
          Não tem conta?{' '}
          <Anchor component={Link} to="/register" c="forest.6" fw={500}>
            Cadastre-se
          </Anchor>
        </Text>
      </Paper>
      </Center>
    </Box>
  )
}

export default LoginPage
