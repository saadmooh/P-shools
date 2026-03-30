// Products - Product management page with add/edit form
import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useDashboardStore } from '../store/dashboardStore'

export default function Products() {
  const { store } = useDashboardStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [catFilter, setCatFilter] = useState('الكل')

  const { data: products, refetch } = useQuery({
    queryKey: ['products', store?.id, catFilter],
    queryFn: async () => {
      let q = supabase
        .from('products')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })
      if (catFilter !== 'الكل') q = q.eq('category', catFilter)
      return q.then(r => r.data ?? [])
    },
    enabled: !!store?.id
  })

  const categories = ['الكل', 'قمصان', 'بناطيل', 'إكسسوارات', 'عبايات', 'أحذية', 'عام']

  const toggleActive = async (product) => {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    refetch()
  }

  const deleteProduct = async (id) => {
    if (!confirm('حذف المنتج؟')) return
    await supabase.from('products').delete().eq('id', id)
    refetch()
  }

  return (
    <div className="page p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="page-header flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#f0f0f0]">المنتجات</h1>
        <button 
          className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#c4a02e] transition-colors"
          onClick={() => { setEditing(null); setShowForm(true) }}
        >
          + منتج جديد
        </button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              catFilter === cat
                ? 'bg-[#D4AF37] text-black'
                : 'bg-[#1e1e1e] text-[#888888] hover:text-[#f0f0f0] border border-[#2a2a2a]'
            }`}
            onClick={() => setCatFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products?.map(product => (
          <div 
            key={product.id} 
            className={`bg-[#1e1e1e] rounded-xl border border-[#2a2a2a] overflow-hidden ${!product.is_active ? 'opacity-60' : ''}`}
          >
            <div className="aspect-square bg-[#161616] relative">
              {product.image_url
                ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-[#2a2a2a] text-4xl font-bold">
                    {product.name?.[0] ?? 'P'}
                  </div>
              }
              {product.is_exclusive && (
                <span className="absolute top-2 right-2 bg-[#D4AF37] text-black text-xs px-2 py-0.5 rounded-full font-medium">
                  🔒 حصري
                </span>
              )}
            </div>
            <div className="p-3">
              <h4 className="text-[#f0f0f0] font-semibold text-sm truncate">{product.name}</h4>
              <p className="text-[#D4AF37] font-bold">{product.price?.toLocaleString()} دج</p>
              <p className="text-[#888888] text-xs">{product.category}</p>
              {product.is_exclusive && (
                <p className="text-[#888888] text-xs">يراه: {product.min_tier_to_view}+</p>
              )}
              <div className="flex gap-1 mt-3">
                <button
                  onClick={() => { setEditing(product); setShowForm(true) }}
                  className="flex-1 bg-[#2a2a2a] text-[#f0f0f0] py-1.5 rounded text-xs"
                >
                  تعديل
                </button>
                <button
                  onClick={() => toggleActive(product)}
                  className={`flex-1 py-1.5 rounded text-xs ${
                    product.is_active 
                      ? 'bg-[#2a2a2a] text-[#f59e0b]' 
                      : 'bg-[#22c55e] text-black'
                  }`}
                >
                  {product.is_active ? 'إيقاف' : 'تفعيل'}
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="bg-[#ef4444] text-white py-1.5 px-2 rounded text-xs"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!products?.length && (
        <div className="text-center py-12 text-[#888888]">
          لا توجد منتجات بعد
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editing}
          storeId={store.id}
          onSave={() => { setShowForm(false); refetch() }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

// Product Form Component
function ProductForm({ product, storeId, onSave, onClose }) {
  const [form, setForm] = useState({
    name:             product?.name             ?? '',
    description:      product?.description      ?? '',
    price:            product?.price            ?? '',
    category:         product?.category         ?? 'عام',
    image_url:        product?.image_url        ?? '',
    is_exclusive:     product?.is_exclusive     ?? false,
    min_tier_to_view: product?.min_tier_to_view ?? 'bronze',
    is_active:        product?.is_active        ?? true,
  })
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const uploadImage = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${storeId}/${Date.now()}.${ext}`
      await supabase.storage.from('product-images').upload(path, file, { upsert: true })
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      setForm(f => ({ ...f, image_url: data.publicUrl }))
    } catch (err) {
      console.error('Upload error:', err)
    }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.name || !form.price) return
    
    if (product?.id) {
      await supabase.from('products').update({ ...form, updated_at: new Date() }).eq('id', product.id)
    } else {
      await supabase.from('products').insert({ ...form, store_id: storeId })
    }
    onSave()
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1e1e1e] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-[#2a2a2a]">
        <div className="flex justify-between items-center p-4 border-b border-[#2a2a2a]">
          <h3 className="text-[#f0f0f0] font-semibold">{product ? 'تعديل منتج' : 'منتج جديد'}</h3>
          <button onClick={onClose} className="text-[#888888] hover:text-[#f0f0f0]">✕</button>
        </div>

        <div className="p-4 space-y-4">
          {/* Image upload */}
          <div 
            className="aspect-video bg-[#161616] rounded-xl border-2 border-dashed border-[#2a2a2a] flex items-center justify-center cursor-pointer hover:border-[#D4AF37] transition-colors overflow-hidden"
            onClick={() => fileRef.current?.click()}
          >
            {form.image_url
              ? <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
              : <span className="text-[#888888]">{uploading ? 'جاري الرفع...' : '+ رفع صورة'}</span>
            }
            <input 
              ref={fileRef} 
              type="file" 
              accept="image/*" 
              hidden 
              onChange={e => uploadImage(e.target.files[0])} 
            />
          </div>

          <input 
            value={form.name} 
            onChange={e => setForm(f => ({...f, name: e.target.value}))}
            placeholder="اسم المنتج *"
            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] placeholder-[#888888] focus:outline-none focus:border-[#D4AF37]"
          />

          <textarea 
            value={form.description} 
            onChange={e => setForm(f => ({...f, description: e.target.value}))}
            placeholder="الوصف"
            rows={2}
            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] placeholder-[#888888] focus:outline-none focus:border-[#D4AF37] resize-none"
          />

          <input 
            type="number"
            value={form.price} 
            onChange={e => setForm(f => ({...f, price: e.target.value}))}
            placeholder="السعر (دج) *"
            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] placeholder-[#888888] focus:outline-none focus:border-[#D4AF37]"
          />

          <select 
            value={form.category}
            onChange={e => setForm(f => ({...f, category: e.target.value}))}
            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] focus:outline-none focus:border-[#D4AF37]"
          >
            {['قمصان','بناطيل','إكسسوارات','عبايات','أحذية','عام'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={form.is_exclusive}
              onChange={e => setForm(f => ({...f, is_exclusive: e.target.checked}))}
              className="w-4 h-4 accent-[#D4AF37]"
            />
            <span className="text-[#f0f0f0] text-sm">منتج حصري (مخفي لفئات أدنى)</span>
          </label>

          {form.is_exclusive && (
            <select 
              value={form.min_tier_to_view}
              onChange={e => setForm(f => ({...f, min_tier_to_view: e.target.value}))}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="silver">Silver فما فوق</option>
              <option value="gold">Gold فما فوق</option>
              <option value="platinum">Platinum فقط</option>
            </select>
          )}

          <button 
            onClick={handleSave}
            className="w-full bg-[#D4AF37] text-black py-3 rounded-lg font-semibold hover:bg-[#c4a02e] transition-colors"
          >
            {product ? 'حفظ التعديلات' : 'إضافة المنتج'}
          </button>
        </div>
      </div>
    </div>
  )
}
