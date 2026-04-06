import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useRedemption = (userId, offerId) => {
  const [redemption, setRedemption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRedemption = async () => {
      if (!userId || !offerId) {
        setRedemption(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('redemptions')
          .select('*')
          .eq('user_id', userId)
          .eq('offer_id', offerId)
          .maybeSingle(); // Use maybeSingle to get one record or null

        if (error) throw error;
        setRedemption(data);
      } catch (err) {
        console.error('Error fetching redemption:', err);
        setError(err.message);
        setRedemption(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRedemption();
  }, [userId, offerId]);

  return { redemption, loading, error };
};
