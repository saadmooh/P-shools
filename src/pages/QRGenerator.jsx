import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QRCodeCanvas } from 'qrcode.react'
import { supabase } from '../lib/supabase'
import { useDashboardStore } from '../store/dashboardStore'
import { startOfDay } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

const EXPIRY_SECONDS = 300

export default function QRGenerator() {
  const { store } = useDashboardStore()
  const [amount, setAmount] = useState('')
  const [qrToken, setQrToken] = useState(null)
  const [timeLeft, setTimeLeft] = useState(EXPIRY_SECONDS)
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState('idle') // 'idle', 'active', 'expired'
  const timerRef = useRef(null)

  const points = amount ? Math.floor(Number(amount) / 10) * (store?.points_rate ?? 1) : 0

  const generate = async () => {
    if (!amount || Number(amount) <= 0) return
    setIsGenerating(true)

    const token = `QR-${store.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const expiresAt = new Date(Date.now() + EXPIRY_SECONDS * 1000)

    // Optimistic Update: Show QR directly without waiting for DB
    setQrToken(token)
    setStatus('active')
    setTimeLeft(EXPIRY_SECONDS)
    setIsGenerating(false)

    // Background Insert
    supabase.from('transactions').insert({
      store_id: store.id,
      type: 'earn',
      points,
      amount: Number(amount),
      qr_token: token,
      expires_at: expiresAt.toISOString(),
      note: 'Generated QR Code',
    }).then(({ error }) => {
      if (error) { 
        console.error('Error recording QR transaction:', error)
        // In a real app, we might want to invalidate the QR if the DB fails
      }
    })
  }

  useEffect(() => {
    if (status !== 'active') return
    
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setStatus('expired')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timerRef.current)
  }, [status])

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setAmount('')
    setQrToken(null)
    setStatus('idle')
    setTimeLeft(EXPIRY_SECONDS)
  }

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const { data: todayTx } = useQuery({
    queryKey: ['today-tx', store?.id],
    queryFn: () => supabase
      .from('transactions')
      .select('points, amount, created_at, users(full_name)')
      .eq('store_id', store.id)
      .eq('type', 'earn')
      .gte('created_at', startOfDay(new Date()).toISOString())
      .order('created_at', { ascending: false })
      .limit(5)
      .then(r => r.data),
    enabled: !!store?.id
  })

  return (
    <div className="qr-page p-4 lg:p-6 max-w-md mx-auto pb-24 text-right">
      <h2 className="text-xl font-bold text-[#f0f0f0] mb-6 text-center tracking-tight">توليد نقاط البيع</h2>
      
      {/* Input Card */}
      <div className="bg-[#1e1e1e] rounded-2xl p-6 border border-[#2a2a2a] shadow-xl mb-6">
        <div className="amount-wrapper flex flex-col items-center">
          <label className="text-xs text-[#888888] uppercase tracking-widest mb-2">قيمة الطلبية</label>
          <div className="relative w-full">
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              disabled={status === 'active'}
              placeholder="0"
              className="text-5xl font-black text-center bg-transparent border-b-2 border-[#2a2a2a] text-[#f0f0f0] pb-4 w-full focus:outline-none focus:border-[#D4AF37] transition-colors disabled:opacity-50 text-right"
              autoFocus
            />
            <span className="absolute left-0 bottom-4 text-[#888888] font-bold">دج</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-[#888888]">
            نقاط الزبون: <span className="text-[#D4AF37] font-bold">{points}</span>
          </div>
          {status === 'idle' ? (
            <button
              className="bg-[#D4AF37] text-black px-8 py-3 rounded-xl font-black hover:bg-[#c4a02e] transition-all transform active:scale-95 disabled:opacity-50"
              onClick={generate}
              disabled={!amount || Number(amount) <= 0 || isGenerating}
            >
              توليد QR
            </button>
          ) : (
            <button
              className="text-[#888888] hover:text-[#f0f0f0] text-sm underline"
              onClick={reset}
            >
              إلغاء وإعادة تعيين
            </button>
          )}
        </div>
      </div>

      {/* QR Code Section */}
      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-2xl relative">
              {status === 'expired' && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-3xl p-6 text-center">
                  <span className="text-5xl mb-4">⌛</span>
                  <h3 className="text-white text-xl font-bold mb-2">انتهت الصلاحية</h3>
                  <button 
                    onClick={reset}
                    className="bg-[#D4AF37] text-black px-6 py-2 rounded-lg font-bold"
                  >
                    توليد جديد
                  </button>
                </div>
              )}

              <div className="relative p-2 bg-white rounded-xl border-4 border-gray-100">
                <QRCodeCanvas value={qrToken} size={240} level="H" includeMargin={false} />
              </div>

              <div className="mt-6 text-center">
                <div className={`text-3xl font-mono font-black mb-1 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-black'}`}>
                  {formatTime(timeLeft)}
                </div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-tighter">
                  صالح لمرة واحدة • {Number(amount).toLocaleString()} دج
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Activity */}
      {todayTx?.length > 0 && status === 'idle' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8"
        >
          <h4 className="text-[#888888] text-xs font-bold uppercase mb-4 px-2 text-right">عمليات اليوم الأخيرة</h4>
          <div className="space-y-3">
            {todayTx.map((tx, i) => (
              <div key={i} className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-4 flex justify-between items-center flex-row-reverse">
                <div className="flex items-center gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-sm">👤</div>
                  <div className="text-right">
                    <p className="text-white text-sm font-bold">{tx.users?.full_name ?? 'زبون جديد'}</p>
                    <p className="text-[#888888] text-[10px]">{new Date(tx.created_at).toLocaleTimeString('ar-DZ')}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-[#22c55e] text-sm font-black">+{tx.points} نقطة</p>
                  <p className="text-[#888888] text-[10px]">{(tx.amount ?? 0).toLocaleString()} دج</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
