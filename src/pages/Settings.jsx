// Settings - Store configuration page
import { useState } from 'react'
import { useDashboardStore } from '../store/dashboardStore'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const { store, refreshStore } = useDashboardStore()
  const [form, setForm] = useState({
    name:           store?.name ?? '',
    description:    store?.description ?? '',
    category:       store?.category ?? '',
    city:           store?.city ?? '',
    phone:          store?.phone ?? '',
    primary_color:  store?.primary_color ?? '#D4AF37',
    points_rate:    store?.points_rate ?? 1,
    welcome_points: store?.welcome_points ?? 100,
    tier_config:    store?.tier_config ?? { bronze: 0, silver: 10000, gold: 50000, platinum: 100000 },
  })
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    // Apply color immediately
    document.documentElement.style.setProperty('--accent', form.primary_color)

    await supabase.from('stores')
      .update({ ...form, updated_at: new Date() })
      .eq('id', store.id)

    await refreshStore()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="page-header mb-6">
        <h1 className="text-xl font-bold text-[#f0f0f0]">الإعدادات</h1>
      </div>

      <div className="space-y-6">
        {/* Store info */}
        <div className="bg-[#1e1e1e] rounded-xl p-6 border border-[#2a2a2a]">
          <h3 className="text-[#f0f0f0] font-semibold mb-4">معلومات المتجر</h3>
          <div className="space-y-4">
            <input 
              value={form.name}
              onChange={e => setForm(f => ({...f, name: e.target.value}))}
              placeholder="اسم المتجر"
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] placeholder-[#888888] focus:outline-none focus:border-[#D4AF37]"
            />
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({...f, description: e.target.value}))}
              placeholder="وصف المتجر"
              rows={2}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] placeholder-[#888888] focus:outline-none focus:border-[#D4AF37] resize-none"
            />
            <select
              value={form.category}
              onChange={e => setForm(f => ({...f, category: e.target.value}))}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="">اختر الفئة</option>
              {['ملابس رجالية','ملابس نسائية','ملابس أطفال','عام'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              value={form.city}
              onChange={e => setForm(f => ({...f, city: e.target.value}))}
              placeholder="المدينة"
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] placeholder-[#888888] focus:outline-none focus:border-[#D4AF37]"
            />
            <input
              value={form.phone}
              onChange={e => setForm(f => ({...f, phone: e.target.value}))}
              placeholder="رقم الهاتف"
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] placeholder-[#888888] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {/* Visual identity */}
        <div className="bg-[#1e1e1e] rounded-xl p-6 border border-[#2a2a2a]">
          <h3 className="text-[#f0f0f0] font-semibold mb-4">الهوية البصرية</h3>
          <div className="flex items-center gap-4">
            <input 
              type="color"
              value={form.primary_color}
              onChange={e => setForm(f => ({...f, primary_color: e.target.value}))}
              className="w-12 h-12 rounded-lg cursor-pointer border-0"
            />
            <div>
              <p className="text-[#f0f0f0] font-medium">لون الهوية</p>
              <p className="text-[#888888] text-sm font-mono">{form.primary_color}</p>
            </div>
          </div>
        </div>

        {/* Points system */}
        <div className="bg-[#1e1e1e] rounded-xl p-6 border border-[#2a2a2a]">
          <h3 className="text-[#f0f0f0] font-semibold mb-4">نظام النقاط</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[#888888] text-sm mb-2">نقاط لكل 10 دج</label>
              <input 
                type="number"
                value={form.points_rate}
                min={1}
                max={10}
                onChange={e => setForm(f => ({...f, points_rate: Number(e.target.value)}))}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-[#888888] text-sm mb-2">نقاط الترحيب (للأعضاء الجدد)</label>
              <input 
                type="number"
                value={form.welcome_points}
                onChange={e => setForm(f => ({...f, welcome_points: Number(e.target.value)}))}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Tier thresholds */}
        <div className="bg-[#1e1e1e] rounded-xl p-6 border border-[#2a2a2a]">
          <h3 className="text-[#f0f0f0] font-semibold mb-4">حدود الفئات (نقاط)</h3>
          <div className="space-y-4">
            {['silver','gold','platinum'].map(tier => (
              <div key={tier} className="flex items-center gap-4">
                <span className="w-20 text-[#888888] capitalize">{tier}</span>
                <input 
                  type="number"
                  value={form.tier_config?.[tier] ?? 0}
                  onChange={e => setForm(f => ({
                    ...f,
                    tier_config: { ...f.tier_config, [tier]: Number(e.target.value) }
                  }))}
                  className="flex-1 bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] focus:outline-none focus:border-[#D4AF37]"
                />
                <span className="text-[#888888]">نقطة</span>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button 
          onClick={handleSave}
          className="w-full bg-[#D4AF37] text-black py-3 rounded-xl font-semibold hover:bg-[#c4a02e] transition-colors"
        >
          {saved ? '✅ تم الحفظ' : 'حفظ الإعدادات'}
        </button>
      </div>
    </div>
  )
}
