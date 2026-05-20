import { NavLink, useNavigate } from 'react-router-dom'
import { Group, Button, Text, Anchor } from '@mantine/core'

function Header({ title }) {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('token')

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <Group
      h={57}
      px="xl"
      gap="lg"
      bg="white"
      style={{
        borderBottom: '1px solid var(--mantine-color-gray-3)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Text fw={700} c="forest.6" size="sm">{title}</Text>
      {isLoggedIn && (
        <>
          <Group gap={4} style={{ flex: 1 }}>
            <NavItem to="/" end>Dashboard</NavItem>
            <NavItem to="/transactions">Transações</NavItem>
            <NavItem to="/categories">Categorias</NavItem>
          </Group>
          <Button variant="default" size="xs" onClick={handleLogout}>Sair</Button>
        </>
      )}
    </Group>
  )
}

function NavItem({ to, end, children }) {
  return (
    <NavLink to={to} end={end} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <Anchor
          component="span"
          underline="never"
          c={isActive ? 'forest.6' : 'dimmed'}
          fw={isActive ? 500 : 400}
          size="sm"
          px="sm"
          py={6}
          style={{
            display: 'inline-block',
            borderRadius: 6,
            background: isActive ? 'var(--mantine-color-forest-0)' : 'transparent',
          }}
        >
          {children}
        </Anchor>
      )}
    </NavLink>
  )
}

export default Header
