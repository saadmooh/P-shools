import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, ChevronRight, Zap, Clock, Gift } from 'lucide-react'
import useUserStore from '../store/userStore'
import { supabase } from '../lib/supabase'

export default function ClientOffers() {
  const navigate = useNavigate()
  const { store } = useUserStore()

  const { data: offers, isLoading } = useQuery({
    queryKey: ['offers', store?.id],
    queryFn: () => supabase
      .from('offers')
      .select('*')
      .eq('store_id', store.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(r => r.data ?? []),
    enabled: !!store?.id
  })

  const TYPE_ICONS = {
    discount: '💰',
    gift: <Gift size={16} />,
    double_points: '✨',
    flash: <Zap size={16} className="text-orange-500" />,
    exclusive: '⭐'
  }

  const TYPE_LABELS = {
    discount: 'تخفيض', gift: 'هدية', double_points: 'نقاط×2',
    flash: 'فلاش', exclusive: 'حصري'
  }

  return (
    <div className="min-h-screen bg-surface gradient-mesh pb-24">
      <div className="p-5 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center">
            ←
          </button>
          <h1 className="text-2xl font-black text-text">العروض</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-40 bg-white rounded-3xl border border-border animate-pulse" />
            ))}
          </div>
        ) : offers?.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {offers.map((offer, i) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/offers/${offer.id}`)}
                  className="bg-white rounded-3xl p-5 border border-border shadow-soft cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{TYPE_ICONS[offer.type]}</span>
                      <span className="text-xs font-black text-accent bg-accent/10 px-2 py-1 rounded-lg">
                        {TYPE_LABELS[offer.type]}
                      </span>
                    </div>
                    {offer.points_cost > 0 && (
                      <span className="bg-orange-50 text-orange-600 text-xs font-black px-3 py-1.5 rounded-xl">
                        {offer.points_cost} نقطة
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-text mb-2">{offer.title}</h3>
                  <p className="text-sm text-muted font-medium line-clamp-2 mb-3">
                    {offer.description || 'لا يوجد وصف'}
                  </p>
                  {offer.discount_percent && (
                    <div className="bg-green-50 text-green-600 text-sm font-black px-3 py-1.5 rounded-xl inline-block">
                      {offer.discount_percent}% تخفيض
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag size={32} className="text-muted opacity-20" />
            </div>
            <p className="text-muted font-bold">لا توجد عروض حالياً</p>
          </div>
        )}
      </div>
    </div>
  )
}
