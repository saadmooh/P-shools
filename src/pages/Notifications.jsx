// Notifications - Send promotional notifications to customers
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useDashboardStore } from '../store/dashboardStore'
import { subDays } from 'date-fns'
import { Send, Image, Link as LinkIcon, Users, ChevronDown } from 'lucide-react'

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
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: { store_id: store.id, ...form }
      })
      if (error) throw error
      setResult({ success: true, ...data })
    } catch (err) {
      setResult({ error: err.message })
    }
    setSending(false)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24">
      <div className="text-right">
        <h1 className="text-2xl font-black text-text tracking-tight">إرسال إشعار</h1>
        <p className="text-sm text-muted font-medium">أرسل عروضاً وتحديثات لزبائنك عبر Telegram</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-border shadow-soft space-y-5">
        {/* Message */}
        <div className="space-y-2 text-right">
          <label className="text-xs font-black text-muted tracking-widest px-1">نص الإشعار *</label>
          <textarea
            value={form.message}
            onChange={e => setForm(f => ({...f, message: e.target.value}))}
            placeholder="اكتب رسالتك هنا..."
            rows={4}
            className="w-full bg-surface border border-border rounded-2xl px-4 py-3 text-text font-medium placeholder-muted focus:outline-none focus:border-accent resize-none"
          />
        </div>

        {/* Image URL */}
        <div className="space-y-2 text-right">
          <label className="text-xs font-black text-muted tracking-widest px-1 flex items-center gap-2">
            <Image size={14} />
            رابط صورة (اختياري)
          </label>
          <input
            value={form.image_url}
            onChange={e => setForm(f => ({...f, image_url: e.target.value}))}
            placeholder="https://..."
            className="w-full bg-surface border border-border rounded-2xl px-4 py-3 text-text font-medium placeholder-muted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Target audience */}
        <div className="space-y-3 text-right">
          <label className="text-xs font-black text-muted tracking-widest px-1 flex items-center gap-2">
            <Users size={14} />
            الجمهور المستهدف
          </label>
          <div className="space-y-2">
            {[
              { value: 'all',      label: 'كل الأعضاء' },
              { value: 'tier',     label: 'فئة محددة' },
              { value: 'inactive', label: 'غير نشطين (60+ يوم)' },
            ].map(opt => (
              <label key={opt.value} className="flex items-center justify-end gap-3 cursor-pointer p-3 rounded-2xl border border-border hover:border-accent hover:bg-surface transition-all">
                <span className="text-text font-bold text-sm">{opt.label}</span>
                <input 
                  type="radio" 
                  value={opt.value}
                  checked={form.target === opt.value}
                  onChange={() => setForm(f => ({...f, target: opt.value}))}
                  className="accent-accent"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Tier selector */}
        {form.target === 'tier' && (
          <div className="space-y-2 text-right relative">
            <label className="text-xs font-black text-muted tracking-widest px-1">اختر الفئة</label>
            <select 
              value={form.target_tier}
              onChange={e => setForm(f => ({...f, target_tier: e.target.value}))}
              className="w-full bg-surface border border-border rounded-2xl px-4 py-3 text-text font-bold focus:outline-none focus:border-accent appearance-none"
            >
              {['bronze','silver','gold','platinum'].map(t => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-4 bottom-4 text-muted pointer-events-none" size={16} />
          </div>
        )}

        {/* CTA URL */}
        <div className="space-y-2 text-right">
          <label className="text-xs font-black text-muted tracking-widest px-1 flex items-center gap-2">
            <LinkIcon size={14} />
            رابط CTA (اختياري)
          </label>
          <input
            value={form.cta_url}
            onChange={e => setForm(f => ({...f, cta_url: e.target.value}))}
            placeholder="رابط يفتح عند الضغط على الزر"
            className="w-full bg-surface border border-border rounded-2xl px-4 py-3 text-text font-medium placeholder-muted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Summary */}
        <div className="bg-surface rounded-2xl p-4 text-center border border-border">
          <p className="text-muted text-sm font-medium">
            سيصل الإشعار إلى: <strong className="text-accent font-black">{recipientCount ?? '...'}</strong> عضو
          </p>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-2xl p-4 text-right ${
            result.error ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-green-50 border border-green-100 text-green-600'
          }`}>
            {result.error 
              ? `❌ خطأ: ${result.error}`
              : `✅ أُرسل بنجاح إلى ${result.sent} عضو${result.failed ? ` (${result.failed} فشل)` : ''}`
            }
          </div>
        )}

        {/* Send button */}
        <button 
          className="w-full bg-accent text-white py-4 rounded-2xl font-black text-sm shadow-soft shadow-accent/20 hover:bg-accent-dark transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={send}
          disabled={!form.message || sending}
        >
          {sending ? (
            'جاري الإرسال...'
          ) : (
            <>
              <Send size={18} />
              إرسال للـ {recipientCount ?? '...'} عضو
            </>
          )}
        </button>
      </div>
    </div>
  )
}