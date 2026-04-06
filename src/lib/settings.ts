import { supabase } from '../lib/supabase';

export const fetchSetting = async (key: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', key)
    .single(); // Assuming each key is unique

  if (error) {
    console.error(`Error fetching setting "${key}":`, error);
    return null;
  }
  return data?.value || null;
};
