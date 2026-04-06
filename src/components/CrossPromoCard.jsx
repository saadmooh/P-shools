import { supabase } from '../lib/supabase'
import useUserStore from '../store/userStore'

export default function CrossPromoCard() {
  const { user, membership, store } = useUserStore()

  if (!store?.id || !user?.id) return null

  return null
}
