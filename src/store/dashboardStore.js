import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { initTelegram } from '../lib/telegram'
import { resolveUser, resolveStoreAccess } from '../lib/auth'

export const useDashboardStore = create((set, get) => ({
  user:       null,
  store:      null,
  membership: null,
  hasAccess:  false,
  loading:    true,
  error:      null,

  init: async () => {
    try {
      initTelegram()
      const user = await resolveUser()
      if (!user) { set({ loading: false, error: 'user_not_found' }); return }

      const { store, membership, hasAccess } = await resolveStoreAccess(user.id)

      // Apply store color dynamically
      if (store?.primary_color) {
        document.documentElement.style.setProperty('--accent', store.primary_color)
        document.documentElement.style.setProperty('--accent-dim', store.primary_color + '40')
      }

      set({ user, store, membership, hasAccess, loading: false })
    } catch (err) {
      set({ loading: false, error: err.message })
    }
  },

  refreshStore: async () => {
    const { store } = get()
    const { data } = await supabase
      .from('stores')
      .select('*')
      .eq('id', store.id)
      .single()
    if (data) set({ store: data })
  }
}))
