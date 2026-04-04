import { Bot } from 'grammy';
import * as dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is required');

const bot = new Bot(token);

// 1. Basic Commands
bot.command('start', (ctx) => {
  ctx.reply('Welcome to the EMS Education Management Bot! 🎓\n\nYou will receive notifications about attendance, invoices, and session changes here.', {
    reply_markup: {
      inline_keyboard: [[
        { text: 'Open Mini App', web_app: { url: process.env.VITE_APP_URL || '' } }
      ]]
    }
  });
});

// 2. Notification API (Conceptual)
// In a real Node server, you would have an endpoint that Supabase Webhooks call
export async function sendNotification(chatId: string, message: string) {
  try {
    await bot.api.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (err) {
    console.error('Failed to send TG message:', err);
  }
}

console.log('Bot is running...');
bot.start();
