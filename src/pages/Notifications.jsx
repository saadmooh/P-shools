// Notifications - Send promotional notifications to customers
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useDashboardStore } from '../store/dashboardStore'
import { subDays } from 'date-fns'

export default function Notifications() {
  const { store } = useDashboardStore()
  const [form, setForm] = useState({
    message:     '',
    image_url:   '',
    target:      'all',
    target_tier: 'gold',
    cta_url:     '',
  })
  const [sending, setSending] = useState(false)
  const [result,  setResult]  = useState(null)

  // Recipient count estimation
  const { data: recipientCount } = useQuery({
    queryKey: ['notif-count', store?.id, form.target, form.target_tier],
    queryFn: async () => {
      let q = supabase
        .from('user_store_memberships')
        .select('id', { count: 'exact', head: true })
        .eq('store_id', store.id)
      if (form.target === 'tier')
        q = q.eq('tier', form.target_tier)
      if (form.target === 'inactive')
        q = q.lt('last_purchase', subDays(new Date(), 60).toISOString())
      return q.then(r => r.count ?? 0)
    },
    enabled: !!store?.id
  })

  const send = async () => {
    if (!form.message) return
    setSending(true)
    try {
      const { data } = await supabase.functions.invoke('send-notification', {
        body: { store_id: store.id, ...form }
      })
      setResult(data)
    } catch (err) {
      setResult({ error: err.message })
    }
    setSending(false)
  }

  return (
    <div className="page p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="page-header mb-6">
        <h1 className="text-xl font-bold text-[#f0f0f0]">إرسال إشعار</h1>
      </div>

      <div className="bg-[#1e1e1e] rounded-xl p-6 border border-[#2a2a2a] space-y-5">
        {/* Message */}
        <div>
          <label className="block text-[#f0f0f0] font-medium mb-2">نص الإشعار *</label>
          <textarea
            value={form.message}
            onChange={e => setForm(f => ({...f, message: e.target.value}))}
            placeholder="اكتب رسالتك هنا..."
            rows={4}
            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] placeholder-[#888888] focus:outline-none focus:border-[#D4AF37] resize-none"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-[#f0f0f0] font-medium mb-2">رابط صورة (اختياري)</label>
          <input
            value={form.image_url}
            onChange={e => setForm(f => ({...f, image_url: e.target.value}))}
            placeholder="https://..."
            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] placeholder-[#888888] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Target audience */}
        <div>
          <label className="block text-[#f0f0f0] font-medium mb-2">الجمهور</label>
          <div className="space-y-2">
            {[
              { value: 'all',      label: 'كل الأعضاء' },
              { value: 'tier',     label: 'فئة محددة' },
              { value: 'inactive', label: 'غير نشطين 60+ يوم' },
            ].map(opt => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  value={opt.value}
                  checked={form.target === opt.value}
                  onChange={() => setForm(f => ({...f, target: opt.value}))}
                  className="accent-[#D4AF37]"
                />
                <span className="text-[#f0f0f0]">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tier selector */}
        {form.target === 'tier' && (
          <div>
            <label className="block text-[#888888] text-sm mb-2">اختر الفئة</label>
            <select 
              value={form.target_tier}
              onChange={e => setForm(f => ({...f, target_tier: e.target.value}))}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] focus:outline-none focus:border-[#D4AF37]"
            >
              {['bronze','silver','gold','platinum'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}

        {/* CTA URL */}
        <div>
          <label className="block text-[#f0f0f0] font-medium mb-2">رابط CTA (اختياري)</label>
          <input
            value={form.cta_url}
            onChange={e => setForm(f => ({...f, cta_url: e.target.value}))}
            placeholder="رابط يفتح عند الضغط"
            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#f0f0f0] placeholder-[#888888] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Summary */}
        <div className="bg-[#161616] rounded-lg p-4 text-center">
          <p className="text-[#888888]">
            سيصل الإشعار إلى: <strong className="text-[#D4AF37]">{recipientCount ?? '...'}</strong> عضو
          </p>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-lg p-4 ${
            result.error ? 'bg-[#ef444420] text-[#ef4444]' : 'bg-[#22c55e20] text-[#22c55e]'
          }`}>
            {result.error ?? `✅ أُرسل بنجاح`}
          </div>
        )}

        {/* Send button */}
        <button 
          className="w-full bg-[#D4AF37] text-black py-3 rounded-xl font-semibold hover:bg-[#c4a02e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={send}
          disabled={!form.message || sending}
        >
          {sending ? 'جاري الإرسال...' : `إرسال للـ ${recipientCount ?? '...'} عضو`}
        </button>
      </div>
    </div>
  )
}
