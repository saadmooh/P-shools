import { useEffect, useState } from 'react';
import { useTelegram } from './useTelegram';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook to handle automatic Telegram authentication.
 * It uses the Telegram user info and session data to authenticate.
 */
export function useTelegramAuth() {
  const { user: tgUser, sessionData } = useTelegram();
  const { setAuth, logout, user: authenticatedUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function authenticate() {
      console.log('Telegram User Detected:', tgUser);
      if (!tgUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // In a production environment, you should send sessionData.initDataRaw 
        // to your server for validation using the Bot Token.
        // For now, we use the user ID as our source of truth.

        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', tgUser.id.toString())
          .single();

        if (existingUser) {
          setAuth(existingUser, 'session-token');
        } else {
          // Auto-register new users as guardians
          const fullName = [tgUser.firstName, tgUser.lastName].filter(Boolean).join(' ');
          
          const newUser = {
            id: tgUser.id.toString(),
            phone: '', // Can be requested later using requestPhone() from useTelegram
            role: 'guardian' as const,
            is_active: true,
            full_name: fullName,
          };

          const { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert([newUser])
            .select()
            .single();

          if (createError) throw createError;
          if (createdUser) {
            setAuth(createdUser, 'session-token');
          }
        }
      } catch (err: any) {
        console.error('Auth error:', err);
        setError(err.message || 'Failed to authenticate');
      } finally {
        setIsLoading(false);
      }
    }

    if (!authenticatedUser && tgUser) {
      authenticate();
    } else if (!tgUser) {
      setIsLoading(false);
    }
  }, [tgUser, sessionData, authenticatedUser, setAuth]);

  return { isLoading, error, isAuthenticated: !!authenticatedUser };
}
