const BASE_URL = 'http://localhost:8000'

export function useApi() {
  const token = localStorage.getItem('token')

  function apiFetch(path, options = {}) {
    const { headers = {}, ...rest } = options
    return fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers: {
        Authorization: `Bearer ${token}`,
        ...headers,
      },
    })
  }

  return apiFetch
}
