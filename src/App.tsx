import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { type Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { ThemeProvider } from './contexts/ThemeContext'
import type { UserProfile } from './types'

import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchUserProfile(session.user.id, session.user.email, session.user.user_metadata)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchUserProfile(session.user.id, session.user.email, session.user.user_metadata)
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (
    userId: string, 
    email?: string, 
    metadata?: { name?: string; role?: string; district?: string }
  ) => {
    try {
      // Try to fetch existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle instead of single to avoid error on 0 rows

      if (error) {
        console.error('Error fetching user profile:', error)
        setLoading(false)
        return
      }

      // If profile exists, use it
      if (data) {
        setUserProfile(data)
        setLoading(false)
        return
      }

      // If no profile exists, create one
      console.log('No profile found, creating one...')
      const newProfile = {
        id: userId,
        name: metadata?.name || email?.split('@')[0] || 'User',
        email: email || '',
        role: metadata?.role || 'health_worker'
      }

      const { data: createdProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single()

      if (createError) {
        console.error('Error creating user profile:', createError)
        // Still set a fallback profile for UI
        setUserProfile({
          id: userId,
          name: metadata?.name || email?.split('@')[0] || 'User',
          email: email || '',
          role: 'health_worker'
        })
      } else {
        setUserProfile(createdProfile)
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!session ? <Signup /> : <Navigate to="/dashboard" />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute session={session} />}>
            <Route path="/dashboard" element={<Dashboard userProfile={userProfile} />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
