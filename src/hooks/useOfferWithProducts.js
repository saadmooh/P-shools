import { useState, useEffect } from 'react';
import { supabase} from '../lib/supabase';

export const useOfferWithProducts = (offerId) => {
  const [offer, setOffer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!offerId) {
        setOffer(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch offer details
        const { data: offerData, error: offerError } = await supabase
          .from('offers')
          .select('*')
          .eq('id', offerId)
          .single();

        if (offerError) throw offerError;
        setOffer(offerData);

        // Fetch linked products
        if (offerData) {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select(`
              id, name, price, image_url,
              original_price, discount_percentage,
              is_exclusive, min_tier_to_view
            `)
            .neq('id', null)
            .or(`id.in.(SELECT product_id FROM offer_products WHERE offer_id='${offerId}')`);
          
          if (productError) throw productError;
          setProducts(productData || []);
        }
      } catch (err) {
        console.error('Error fetching offer with products:', err);
        setError(err.message);
        setOffer(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [offerId]);

  return { offer, products, loading, error };
};
