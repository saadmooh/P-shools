import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ChevronRight, Zap, Crown } from 'lucide-react'
import useUserStore from '../store/userStore'
import { supabase } from '../lib/supabase'

export default function ClientProducts() {
  const navigate = useNavigate()
  const { store, membership } = useUserStore()
  const [catFilter, setCatFilter] = useState('الكل')

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', store?.id],
    queryFn: () => supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(r => r.data ?? []),
    enabled: !!store?.id
  })

  const categories = ['الكل', 'قمصان', 'بناطيل', 'إكسسوارات', 'عبايات', 'أحذية', 'عام']

  const userTier = membership?.tier || 'bronze'
  const tierOrder = { bronze: 0, silver: 1, gold: 2, platinum: 3 }
  const canViewProduct = (product) => {
    if (!product.is_exclusive) return true
    return tierOrder[userTier] >= tierOrder[product.min_tier_to_view]
  }

  const filteredProducts = products?.filter(p => 
    (catFilter === 'الكل' || p.category === catFilter) && canViewProduct(p)
  ) || []

  return (
    <div className="min-h-screen bg-surface gradient-mesh pb-24">
      <div className="p-5 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center">
            ←
          </button>
          <h1 className="text-2xl font-black text-text">المنتجات</h1>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 justify-end">
          {categories.map(cat => (
            <button
              key={cat}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                catFilter === cat
                  ? 'bg-accent text-white'
                  : 'bg-white text-muted border border-border'
              }`}
              onClick={() => setCatFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-square bg-white rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="bg-white rounded-3xl overflow-hidden border border-border shadow-soft cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="aspect-square bg-surface">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted/20">
                        <Package size={48} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    {product.is_exclusive && (
                      <div className="flex items-center gap-1 mb-1">
                        <Crown size={12} className="text-yellow-500" />
                        <span className="text-[10px] font-black text-yellow-600">حصري</span>
                      </div>
                    )}
                    <h4 className="text-sm font-black text-text truncate mb-1">{product.name}</h4>
                    <span className="text-accent font-black text-sm">{product.price?.toLocaleString()} <span className="text-[10px]">دج</span></span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-muted opacity-20" />
            </div>
            <p className="text-muted font-bold">لا توجد منتجات</p>
          </div>
        )}
      </div>
    </div>
  )
}
