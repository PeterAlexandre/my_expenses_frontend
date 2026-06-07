import { useNavigate } from 'react-router-dom'

const BASE_URL = 'http://localhost:8000'

export function useApi() {
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  async function apiFetch(path, options = {}) {
    const { headers = {}, ...rest } = options
    const res = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers: {
        Authorization: `Bearer ${token}`,
        ...headers,
      },
    })

    if (res.status === 401) {
      localStorage.removeItem('token')
      navigate('/login')
      throw new Error('Unauthorized')
    }

    return res
  }

  return apiFetch
}
