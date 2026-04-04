// Supabase Edge Function: send-notification
// This function acts as the bridge between DB changes and the Telegram Bot

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

serve(async (req) => {
  try {
    const { record, table, type } = await req.json()
    
    // Initialize Supabase Client with Service Role Key
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Helper to send message
    const sendTGMessage = async (chatId: string, text: string) => {
      if (!chatId) return;
      const response = await fetch(TELEGRAM_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "HTML"
        })
      })
      return await response.json();
    }

    // 1. Session Notifications (Scheduled or Started)
    if (table === 'sessions') {
      const { data: sessionInfo } = await supabase
        .from('sessions')
        .select('*, groups(name), courses(name)')
        .eq('id', record.id)
        .single();

      const title = sessionInfo?.groups?.name || sessionInfo?.courses?.name || record.topic || 'Class';
      const time = new Date(record.scheduled_at).toLocaleString();

      if (type === 'INSERT') {
        // Notify Teacher about new schedule
        await sendTGMessage(record.teacher_id, `🗓 <b>New Session Scheduled</b>\n\nSubject: <b>${title}</b>\nTime: ${time}\nRoom: ${record.room_id || 'N/A'}`);
        
        // Notify enrolled students/guardians about upcoming session
        if (record.group_id) {
          const { data: enrollments } = await supabase
            .from('group_enrollments')
            .select('guardian_payer_id')
            .eq('group_id', record.group_id);
          
          for (const enrollment of enrollments || []) {
            await sendTGMessage(enrollment.guardian_payer_id, `🔔 <b>Upcoming Session Reminder</b>\n\nYour child has a <b>${title}</b> session scheduled for ${time}.`);
          }
        }
      } 
      
      if (type === 'UPDATE' && record.status === 'ongoing') {
        // Session Started Alert
        await sendTGMessage(record.teacher_id, `🚀 <b>Session Started!</b>\n\nYour session for <b>${title}</b> has officially begun.`);
        
        if (record.group_id) {
          const { data: enrollments } = await supabase.from('group_enrollments').select('guardian_payer_id').eq('group_id', record.group_id);
          for (const enrollment of enrollments || []) {
            await sendTGMessage(enrollment.guardian_payer_id, `🏃‍♂️ <b>Session Started</b>\n\nThe <b>${title}</b> session has started.`);
          }
        }
      }
    }

    // 2. Unexcused Absence Alert
    if (table === 'attendances' && record.status === 'absent_unexcused') {
      const { data: student } = await supabase
        .from('students')
        .select('full_name, guardian_id')
        .eq('id', record.student_id)
        .single();

      if (student) {
        await sendTGMessage(student.guardian_id, `⚠️ <b>Absence Alert!</b>\n\nYour child <b>${student.full_name}</b> was marked <b>Absent (Unexcused)</b> today.\n\nPlease provide a justification via the app to avoid fees.`);
      }
    }

    // 3. Invoice Notifications
    if (table === 'invoices' && type === 'INSERT') {
      const chatId = record.guardian_id || record.independent_user_id;
      await sendTGMessage(chatId, `💳 <b>New Invoice Generated</b>\n\nInvoice #${record.invoice_number} for <b>${record.total_amount} SAR</b> is now due.\n\nDue Date: ${new Date(record.due_date).toLocaleDateString()}`);
    }

    // 4. Payment Confirmations
    if (table === 'payments' && type === 'INSERT') {
      const chatId = record.guardian_id || record.independent_user_id;
      await sendTGMessage(chatId, `✅ <b>Payment Confirmation</b>\n\nWe have successfully received your payment of <b>${record.amount} SAR</b>.\n\nReference: ${record.reference || 'N/A'}\nThank you!`);
    }

    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } })
  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
