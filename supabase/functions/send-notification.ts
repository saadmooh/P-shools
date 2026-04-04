// Supabase Edge Function: send-notification
// This function acts as the bridge between DB changes and the Telegram Bot

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

serve(async (req) => {
  try {
    const { record, table, type } = await req.json()

    let message = ""
    let chatId = "" // This should be the Telegram User ID stored in our 'users' table

    // 1. Session Start Alert
    if (table === 'sessions' && type === 'INSERT') {
      message = `🔔 <b>Session Scheduled!</b>\n\nA new session for <b>${record.topic || 'Class'}</b> has been scheduled at ${new Date(record.scheduled_at).toLocaleString()}.`
      chatId = record.teacher_id // Notify the teacher
    }

    // 2. Unexcused Absence Alert
    if (table === 'attendances' && record.status === 'absent_unexcused') {
      // Logic to fetch guardian's TG ID would happen here
      message = `⚠️ <b>Absence Alert!</b>\n\nYour child was marked <b>Absent (Unexcused)</b> today. Please provide a justification via the app.`
      chatId = "fetch_from_db" 
    }

    // 3. Invoice Reminder
    if (table === 'invoices' && type === 'INSERT') {
      message = `💳 <b>New Invoice Generated</b>\n\nInvoice #${record.invoice_number} for <b>${record.total_amount} SAR</b> is now due.`
      chatId = record.guardian_id || record.independent_user_id
    }

    // 4. Payment Confirmation
    if (table === 'payments' && type === 'INSERT') {
      message = `✅ <b>Payment Confirmed!</b>\n\nWe have received your payment of <b>${record.amount} SAR</b>. Thank you!`
      chatId = record.guardian_id || record.independent_user_id
    }

    if (message && chatId) {
      await fetch(TELEGRAM_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML"
        })
      })
    }

    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
