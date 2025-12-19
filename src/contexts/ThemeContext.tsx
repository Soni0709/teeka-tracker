/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('teekaSetu-theme')
    if (stored !== null) {
      return stored === 'dark'
    }
    return true // Default to dark
  })

  const theme = isDark ? 'dark' : 'light'

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    applyTheme(newIsDark)
    localStorage.setItem('teekaSetu-theme', newIsDark ? 'dark' : 'light')
  }

  const applyTheme = (isDarkMode: boolean) => {
    const root = document.documentElement
    
    if (isDarkMode) {
      // Dark mode
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      // Light mode
      root.classList.remove('dark')
      root.classList.add('light')
    }
  }

  useEffect(() => {
    applyTheme(isDark)
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
