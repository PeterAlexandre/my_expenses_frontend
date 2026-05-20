import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
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

function RegisterPage() {
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
    <Center mih="calc(100vh - 57px)" p="md">
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
  )
}

export default RegisterPage
