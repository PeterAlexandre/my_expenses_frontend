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

function RegisterPage() {
  const [bg] = useState(() => backgrounds[Math.floor(Math.random() * backgrounds.length)])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    const response = await fetch('http://localhost:8000/account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      setError('Erro ao criar conta')
      return
    }

    navigate('/login')
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
        <Title order={2} mb="lg">Criar conta</Title>
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
            <Button type="submit" fullWidth mt="xs">Cadastrar</Button>
          </Stack>
        </form>
        <Text ta="center" size="sm" c="dimmed" mt="lg">
          Já tem conta?{' '}
          <Anchor component={Link} to="/login" c="forest.6" fw={500}>
            Entrar
          </Anchor>
        </Text>
      </Paper>
      </Center>
    </Box>
  )
}

export default RegisterPage
