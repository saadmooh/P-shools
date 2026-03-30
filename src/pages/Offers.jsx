// Offers - Offer management with create/edit form
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useDashboardStore } from '../store/dashboardStore'

export default function Offers() {
  const { store } = useDashboardStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data: offers, refetch } = useQuery({
    queryKey: ['offers', store?.id],
    queryFn: () => supabase
      .from('offers')
      .select('*, redemptions(id)')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
      .then(r => r.data ?? []),
    enabled: !!store?.id
  })

  const toggleOffer = async (offer) => {
    await supabase.from('offers').update({ is_active: !offer.is_active }).eq('id', offer.id)
    refetch()
  }

  const OCCASION_LABELS = {
    always: 'دائم', fixed: 'تاريخ محدد', birthday: 'عيد ميلاد',
    anniversary: 'ذكرى سنوية', win_back: 'إعادة زبون', flash: 'فلاش'
  }
  const TYPE_LABELS = {
    discount: 'تخفيض', gift: 'هدية', double_points: 'نقاط×2',
    flash: 'فلاش', exclusive: 'حصري'
  }

  return (
    <div className="page p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="page-header flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#f0f0f0]">العروض</h1>
        <button 
          className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#c4a02e] transition-colors"
          onClick={() => { setEditing(null); setShowForm(true) }}
        >
          + عرض جديد
        </button>
      </div>

      <div className="space-y-3">
        {offers?.map(offer => (
          <div 
            key={offer.id} 
            className={`bg-[#1e1e1e] rounded-xl p-4 border border-[#2a2a2a] ${!offer.is_active ? 'opacity-60' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="text-[#f0f0f0] font-semibold">{offer.title}</h4>
                {offer.description && (
                  <p className="text-[#888888] text-sm mt-1">{offer.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-[#2a2a2a] text-[#f0f0f0] text-xs px-2 py-1 rounded">
                    {TYPE_LABELS[offer.type] || offer.type}
                  </span>
                  <span className="bg-[#2a2a2a] text-[#f0f0f0] text-xs px-2 py-1 rounded">
                    {OCCASION_LABELS[offer.occasion_type] || offer.occasion_type}
                  </span>
                  <span className="bg-[#2a2a2a] text-[#D4AF37] text-xs px-2 py-1 rounded">
                    {offer.min_tier}+
                  </span>
                  {offer.points_cost > 0 && (
                    <span className="bg-[#2a2a2a] text-[#f0f0f0] text-xs px-2 py-1 rounded">
                      {offer.points_cost} نقطة
                    </span>
                  )}
                  {offer.discount_percent && (
                    <span className="bg-[#22c55e] text-black text-xs px-2 py-1 rounded font-medium">
                      {offer.discount_percent}% تخفيض
                    </span>
                  )}
                </div>
                <p className="text-[#888888] text-xs mt-2">
                  استُخدم {offer.redemptions?.length ?? 0} مرة
                </p>
              </div>
              <div className="flex gap-2 mr-4">
                <button
                  onClick={() => { setEditing(offer); setShowForm(true) }}
                  className="bg-[#2a2a2a] text-[#f0f0f0] px-3 py-1.5 rounded text-sm"
                >
                  تعديل
                </button>
                <button
                  onClick={() => toggleOffer(offer)}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    offer.is_active 
                      ? 'bg-[#ef4444] text-white' 
                      : 'bg-[#22c55e] text-black'
                  }`}
                >
                  {offer.is_active ? 'إيقاف' : 'تفعيل'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!offers?.length && (
        <div className="text-center py-12 text-[#888888]">
          لا توجد عروض بعد
        </div>
      )}

      {showForm && (
        <OfferForm
          offer={editing}
          storeId={store.id}
          onSave={() => { setShowForm(false); refetch() }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

function OfferForm({ offer, storeId, onSave, onClose }) {
  const [form, setForm] = useState({
    title:            offer?.title            ?? '',
    description:      offer?.description      ?? '',
    type:             offer?.type             ?? 'discount',
    discount_percent: offer?.discount_percent ?? '',
    points_cost:      offer?.points_cost      ?? 0,
    min_tier:         offer?.min_tier         ?? 'bronze',
    occasion_type:    offer?.occasion_type    ?? 'always',
    occasion_date:    offer?.occasion_date    ?? '',
    valid_from:       offer?.valid_from       ?? '',
    valid_until:      offer?.valid_until      ?? '',
    usage_limit:      offer?.usage_limit      ?? '',
    is_active:        offer?.is_active        ?? true,
  })

  const handleSave = async () => {
    if (!form.title) return
    const payload = {
      ...form,
      discount_percent: form.discount_percent || null,
      usage_limit:      form.usage_limit      || null,
      occasion_date:    form.occasion_date    || null,
      valid_from:       form.valid_from       || null,
      valid_until:      form.valid_until      || null,
    }
    if (offer?.id) {
      await supabase.from('offers').update({ ...payload, updated_at: new Date() }).eq('id', offer.id)
    } else {
      await supabase.from('offers').insert({ ...payload, store_id: storeId })
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
          <h3 className="text-[#f0f0f0] font-semibold">{offer ? 'تعديل عرض' : 'عرض جديد'}</h3>
          <button onClick={onClose} className="text-[#888888] hover:text-[#f0f0f0]">✕</button>
        </div>

        <div className="p-4 space-y-4">
          <input 
            value={form.title} 
            onChange={e => setForm(f => ({...f, title: e.target.value}))}
            placeholder="عنوان العرض *"
            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] placeholder-[#888888] focus:outline-none focus:border-[#D4AF37]"
          />

          <textarea 
            value={form.description} 
            onChange={e => setForm(f => ({...f, description: e.target.value}))}
            placeholder="الوصف"
            rows={2}
            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] placeholder-[#888888] focus:outline-none focus:border-[#D4AF37] resize-none"
          />

          <div>
            <label className="block text-[#888888] text-sm mb-2">نوع العرض</label>
            <select 
              value={form.type}
              onChange={e => setForm(f => ({...f, type: e.target.value}))}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="discount">تخفيض بنسبة</option>
              <option value="gift">هدية مجانية</option>
              <option value="double_points">نقاط مضاعفة</option>
              <option value="flash">عرض فلاش</option>
              <option value="exclusive">حصري</option>
            </select>
          </div>

          {form.type === 'discount' && (
            <input 
              type="number"
              value={form.discount_percent}
              onChange={e => setForm(f => ({...f, discount_percent: e.target.value}))}
              placeholder="نسبة التخفيض %"
              min={1}
              max={100}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] placeholder-[#888888] focus:outline-none focus:border-[#D4AF37]"
            />
          )}

          <div>
            <label className="block text-[#888888] text-sm mb-2">تكلفة النقاط (0 = مجاني)</label>
            <input 
              type="number"
              value={form.points_cost}
              onChange={e => setForm(f => ({...f, points_cost: Number(e.target.value)}))}
              min={0}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] placeholder-[#888888] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-[#888888] text-sm mb-2">الفئة المؤهلة</label>
            <select 
              value={form.min_tier}
              onChange={e => setForm(f => ({...f, min_tier: e.target.value}))}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="bronze">Bronze فما فوق</option>
              <option value="silver">Silver فما فوق</option>
              <option value="gold">Gold فما فوق</option>
              <option value="platinum">Platinum فقط</option>
            </select>
          </div>

          <div>
            <label className="block text-[#888888] text-sm mb-2">المناسبة</label>
            <select 
              value={form.occasion_type}
              onChange={e => setForm(f => ({...f, occasion_type: e.target.value}))}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="always">دائم</option>
              <option value="fixed">تاريخ محدد</option>
              <option value="birthday">عيد ميلاد (تلقائي)</option>
              <option value="anniversary">ذكرى الانضمام</option>
              <option value="win_back">إعادة زبون غائب</option>
              <option value="flash">فلاش — وقت محدود</option>
            </select>
          </div>

          {(form.occasion_type === 'flash' || form.occasion_type === 'fixed') && (
            <>
              <input 
                type="datetime-local"
                value={form.valid_from}
                onChange={e => setForm(f => ({...f, valid_from: e.target.value}))}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] focus:outline-none focus:border-[#D4AF37]"
              />
              <input 
                type="datetime-local"
                value={form.valid_until}
                onChange={e => setForm(f => ({...f, valid_until: e.target.value}))}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] focus:outline-none focus:border-[#D4AF37]"
              />
            </>
          )}

          <button 
            onClick={handleSave}
            className="w-full bg-[#D4AF37] text-black py-3 rounded-lg font-semibold hover:bg-[#c4a02e] transition-colors"
          >
            {offer ? 'حفظ التعديلات' : 'إضافة العرض'}
          </button>
        </div>
      </div>
    </div>
  )
}