import { createContext, useContext, useReducer, useEffect } from 'react'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload, isAuthenticated: true }
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload, isAuthenticated: false }
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false }
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload }
    default:
      return state
  }
}

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
}

// Demo accounts for different roles
const demoAccounts = {
  user: {
    email: 'user@demo.com',
    password: 'user123',
    userData: {
      id: 1,
      email: 'user@demo.com',
      name: 'John Player',
      role: 'user',
      phone: '+91 98765 43210',
      location: 'Mumbai, Maharashtra',
      avatar: null
    }
  },
  owner: {
    email: 'owner@demo.com',
    password: 'owner123',
    userData: {
      id: 2,
      email: 'owner@demo.com',
      name: 'Sarah Owner',
      role: 'owner',
      phone: '+91 98765 43211',
      location: 'Delhi, NCR',
      avatar: null,
      businessName: 'Elite Sports Complex',
      totalBoxes: 3,
      totalRevenue: 125000
    }
  },
  admin: {
    email: 'admin@demo.com',
    password: 'admin123',
    userData: {
      id: 3,
      email: 'admin@demo.com',
      name: 'Mike Admin',
      role: 'admin',
      phone: '+91 98765 43212',
      location: 'Bangalore, Karnataka',
      avatar: null,
      permissions: ['all']
    }
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(userData) })
    }
  }, [])

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      // Check demo accounts
      const account = Object.values(demoAccounts).find(
        acc => acc.email === credentials.email && acc.password === credentials.password
      )

      if (account) {
        localStorage.setItem('token', 'demo-jwt-token')
        localStorage.setItem('user', JSON.stringify(account.userData))
        dispatch({ type: 'LOGIN_SUCCESS', payload: account.userData })
        return { success: true, user: account.userData }
      } else {
        throw new Error('Invalid credentials. Use demo accounts: user@demo.com/user123, owner@demo.com/owner123, admin@demo.com/admin123')
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const signup = async (userData) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const newUser = {
        id: Date.now(),
        email: userData.email,
        name: userData.name,
        role: userData.role || 'user',
        phone: userData.phone || '',
        location: userData.location || ''
      }
      localStorage.setItem('token', 'demo-jwt-token')
      localStorage.setItem('user', JSON.stringify(newUser))
      dispatch({ type: 'LOGIN_SUCCESS', payload: newUser })
      return { success: true }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
  }

  const getDemoCredentials = () => {
    return {
      user: { email: 'user@demo.com', password: 'user123' },
      owner: { email: 'owner@demo.com', password: 'owner123' },
      admin: { email: 'admin@demo.com', password: 'admin123' }
    }
  }

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      signup,
      logout,
      getDemoCredentials
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthContext }