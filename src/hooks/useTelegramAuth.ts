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
      console.log('--- STARTING AUTHENTICATION ---');
      console.log('Telegram User Detected:', tgUser);
      
      if (!tgUser) {
        console.warn('No Telegram User found, skipping authentication.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Searching for existing user in Supabase with ID:', tgUser.id);
        
        // In a production environment, you should send sessionData.initDataRaw 
        // to your server for validation using the Bot Token.
        // For now, we use the user ID as our source of truth.

        // Fetch user from Supabase to get the authoritative role
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', tgUser.id.toString())
          .maybeSingle();

        if (fetchError) {
          console.error('Supabase fetch error:', fetchError);
          throw fetchError;
        }

        if (existingUser) {
          console.log('Existing user found with role:', existingUser.role);
          setAuth(existingUser, 'session-token');
        } else {
          console.log('User not found. Auto-registering new user...');
          // Auto-register new users as guardians (default)
          const fullName = [tgUser.firstName, tgUser.lastName].filter(Boolean).join(' ');
          
          const newUser = {
            id: tgUser.id.toString(),
            phone: '',
            role: 'guardian' as const, // Default role
            is_active: true,
            full_name: fullName,
          };

          const { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert([newUser])
            .select()
            .single();

          if (createError) {
            console.error('Supabase registration error:', createError);
            throw createError;
          }
          if (createdUser) {
            console.log('New user registered successfully with role:', createdUser.role);
            setAuth(createdUser, 'session-token');
          }
        }
      } catch (err: any) {
        console.error('--- AUTHENTICATION ERROR ---');
        console.error('Error details:', err);
        setError(err.message || 'Failed to authenticate');
      } finally {
        setIsLoading(false);
        console.log('--- AUTHENTICATION FINISHED ---');
      }
    }

    if (!authenticatedUser && tgUser) {
      authenticate();
    } else if (!tgUser) {
      console.log('No Telegram user found and no authenticated user, showing login.');
      setIsLoading(false);
    } else {
      console.log('User already authenticated:', authenticatedUser);
      setIsLoading(false);
    }
  }, [tgUser, sessionData, authenticatedUser, setAuth]);

  return { isLoading, error, isAuthenticated: !!authenticatedUser };
}
