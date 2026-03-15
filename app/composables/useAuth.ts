export const useAuth = () => {
  const user = useState('auth:user', () => ({
    name: 'Mike Nielsen',
    email: 'mike@admin.com',
    role: 'Admin',
    avatar: 'https://i.pravatar.cc/150?img=11',
  }))

  const isLoggedIn = useState('auth:loggedIn', () => false)

  const login = (email: string, _password: string) => {
    // Replace with real API call when backend is ready
    user.value = { name: 'Mike Nielsen', email, role: 'Admin', avatar: 'https://i.pravatar.cc/150?img=11' }
    isLoggedIn.value = true
  }

  const logout = () => {
    isLoggedIn.value = false
    navigateTo('/login')
  }

  return { user, isLoggedIn, login, logout }
}
