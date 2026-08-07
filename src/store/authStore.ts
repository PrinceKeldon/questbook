import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  initialized: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user?.email) {
        // Get user profile from our users table
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single()

        if (!error && profile) {
          set({
            user: profile,
            initialized: true,
          })
        }
      }

      set({ initialized: true })
    } catch (error) {
      set({ error: 'Failed to initialize auth', initialized: true })
    }
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.signUp({ email, password })

      if (authError) throw authError

      // Create user profile
      if (authUser) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .insert([
            {
              auth_id: authUser.id,
              email: authUser.email,
              subscription_status: 'free',
            },
          ])
          .select()
          .single()

        if (profileError) throw profileError

        set({ user: profile, loading: false })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Sign up failed',
        loading: false,
      })
      throw error
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) throw authError

      if (authUser?.email) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', authUser.id)
          .single()

        if (profileError) throw profileError

        set({ user: profile, loading: false })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Sign in failed',
        loading: false,
      })
      throw error
    }
  },

  signOut: async () => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ user: null, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Sign out failed',
        loading: false,
      })
      throw error
    }
  },
}))
