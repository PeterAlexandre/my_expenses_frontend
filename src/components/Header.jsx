import { NavLink, useNavigate } from 'react-router-dom'
import './Header.css'

function Header({ title }) {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('token')

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <header className="header">
      <span className="header-logo">{title}</span>
      {isLoggedIn && (
        <>
          <nav className="header-nav">
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/transactions">Transações</NavLink>
            <NavLink to="/categories">Categorias</NavLink>
          </nav>
          <button className="header-logout" onClick={handleLogout}>Sair</button>
        </>
      )}
    </header>
  )
}

export default Header
