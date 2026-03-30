// Authentication logic for merchant dashboard
// No traditional auth - authentication via Telegram WebApp SDK

import { supabase } from './supabase'
import { getTelegramUser } from './telegram'

// Get or create user based on telegram_id
export async function resolveUser() {
  const tgUser = getTelegramUser()

  // Development mode (outside Telegram) - use super_admin
  if (!tgUser) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('is_super_admin', true)
      .single()
    return data
  }

  // Is user already exists?
  let { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', tgUser.id)
    .single()

  if (!user) {
    // Create new user
    const { data: newUser } = await supabase
      .from('users')
      .insert({
        telegram_id:   tgUser.id,
        username:      tgUser.username,
        full_name:     `${tgUser.first_name} ${tgUser.last_name ?? ''}`.trim(),
        photo_url:     tgUser.photo_url,
        language_code: tgUser.language_code,
        is_premium:    tgUser.is_premium,
        is_bot:        tgUser.is_bot,
      })
      .select()
      .single()
    user = newUser
  }

  return user
}

// Get store and user membership
export async function resolveStoreAccess(userId) {
  const storeSlug = import.meta.env.VITE_STORE_SLUG

  // Get store
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', storeSlug)
    .single()

  if (!store) return { store: null, membership: null, hasAccess: false }

  // Get membership
  const { data: membership } = await supabase
    .from('user_store_memberships')
    .select('*')
    .eq('user_id', userId)
    .eq('store_id', store.id)
    .single()

  // Does user have access to dashboard?
  const hasAccess = membership?.role === 'owner'
    || membership?.role === 'manager'
    || membership?.role === 'cashier'

  return { store, membership, hasAccess }
}
