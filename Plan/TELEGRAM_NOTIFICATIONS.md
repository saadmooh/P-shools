# Plan: Telegram Bot Offer Notifications

This plan details the implementation of a notification system that allows store owners to send promotional messages and offers directly to customers via the Telegram bot `@store_Loyalty_bot`.

## 1. Infrastructure: Supabase Edge Function
To keep the Bot API Token secure and handle bulk messaging without blocking the frontend, we will use a Supabase Edge Function.

### Function: `send-notification` (Deno)
**Endpoint**: `POST /functions/v1/send-notification`

#### Implementation Logic (Pseudocode/Deno):
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { store_id, message, image_url, target, target_tier, cta_url } = await req.json()

  // 1. Initialize Supabase Admin Client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 2. Fetch Bot Token from DB
  const { data: store } = await supabase
    .from('stores')
    .select('bot_token')
    .eq('id', store_id)
    .single()

  const BOT_TOKEN = store.bot_token

  // 3. Query Target User IDs
  let query = supabase
    .from('user_store_memberships')
    .select('user_id, users(telegram_id)')
    .eq('store_id', store_id)

  if (target === 'tier') query = query.eq('tier', target_tier)
  if (target === 'inactive') {
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    query = query.lt('last_purchase', sixtyDaysAgo.toISOString())
  }

  const { data: recipients } = await query

  // 4. Send Messages via Telegram API
  let successCount = 0
  for (const recipient of recipients) {
    const chatId = recipient.users.telegram_id
    const endpoint = image_url ? 'sendPhoto' : 'sendMessage'
    
    const payload: any = {
      chat_id: chatId,
      parse_mode: 'Markdown',
      reply_markup: cta_url ? {
        inline_keyboard: [[{ text: "Open Offer 🎁", url: cta_url }]]
      } : undefined
    }

    if (image_url) {
      payload.photo = image_url
      payload.caption = message
    } else {
      payload.text = message
    }

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (res.ok) successCount++
    
    // Simple rate limiting: 30ms delay
    await new Promise(r => setTimeout(r, 35))
  }

  return new Response(JSON.stringify({ success: true, sent: successCount }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

## 2. Database Preparation
We need to ensure the bot token is correctly stored in the database for the relevant store.

### SQL Update:
```sql
UPDATE public.stores 
SET bot_token = '8205884056:AAEpDlNiiQLplxFQzGINkc8-imYqUbev2B8' 
WHERE slug = 'store-alpha';
```

## 3. Frontend Integration (`src/pages/Notifications.jsx`)
Update the `send` function to use the Supabase client's `functions.invoke` method.

### Code Snippet:
```javascript
const send = async () => {
  if (!form.message) return
  setSending(true)
  try {
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: { 
        store_id: store.id,
        message: form.message,
        image_url: form.image_url,
        target: form.target,
        target_tier: form.target_tier,
        cta_url: form.cta_url 
      }
    })
    
    if (error) throw error
    setResult({ success: true, count: data.sent })
  } catch (err) {
    setResult({ error: err.message })
  }
  setSending(false)
}
```

## 4. Security & Error Handling
*   **Permissions**: The Edge Function should verify the user's role (Manager/Owner) before proceeding.
*   **Invalid Tokens**: If `fetch` to Telegram returns 401, the function should stop and report a configuration error.
*   **Blocked Bots**: Handle 403 errors (user blocked the bot) gracefully by logging them without stopping the loop.

## 5. Deployment Commands
```bash
# Login to Supabase CLI
supabase login

# Link project
supabase link --project-ref your-project-id

# Deploy function
supabase functions deploy send-notification
```
