import { motion } from 'framer-motion';
import { Package, Lock, Crown } from 'lucide-react'; // Icons for placeholder, exclusivity, and tier

// Helper function to display price info with discounts
const DisplayPriceInfo = ({ product }) => {
  // Check if product has offer details with discount percentage
  const hasDiscount = product.original_price !== null && product.original_price !== undefined &&
                      product.discount_percentage !== null && product.discount_percentage !== undefined &&
                      product.discount_percentage > 0;

  if (hasDiscount) {
    const discountAmount = product.original_price * (product.discount_percentage / 100);
    const discountedPrice = product.original_price - discountAmount;
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-muted line-through text-sm">{product.original_price?.toLocaleString()} دج</span>
        <span className="text-accent font-black text-base">{discountedPrice?.toLocaleString()} دج</span>
        <span className="text-xs text-green-600 font-bold">-{product.discount_percentage}%</span>
      </div>
    );
  } else if (product.price) {
    return <span className="text-accent font-black text-base">{product.price?.toLocaleString()} دج</span>;
  }
  return null; // No price info to display
};

export default function ProductOfferCard({ product, offerCategoryColor, onProductClick }) {
  const imageSizeClass = "w-24 h-24"; // Consistent size for product images

  // Determine if this product has an active offer with a discount
  const hasActiveOfferDiscount = product.original_price !== null && product.original_price !== undefined &&
                                 product.discount_percentage !== null && product.discount_percentage !== undefined &&
                                 product.discount_percentage > 0;

  return (
    <motion.div
      whileHover={{ y: -6, shadow: '0 12px 24px -4px rgb(0 0 0 / 0.15)', scale: 1.02 }} // Enhanced hover effect for indicator
      onClick={onProductClick} // Make the entire card clickable
      className={`bg-white rounded-2xl overflow-hidden shadow-card cursor-pointer flex transition-all duration-300 ease-in-out
                 ${hasActiveOfferDiscount ? 'border-2 border-accent' : ''} // Subtle border highlight for offers
                `}
    >
      {/* Product Image Section */}
      <div className={`relative flex-shrink-0 ${imageSizeClass}`}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-tl-2xl" />
        ) : (
          <div className={`w-full h-full bg-surface rounded-tl-2xl flex items-center justify-center text-muted/20 ${imageSizeClass}`}>
            <Package size={32} /> {/* Placeholder icon */}
          </div>
        )}
        {/* Exclusivity Badge */}
        {product.is_exclusive && (
          <div className="absolute top-1 right-1 p-1 bg-yellow-400/80 backdrop-blur-sm rounded-md z-10">
            <Lock size={14} className="text-white" />
          </div>
        )}
      </div>

      {/* Product Info Section */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-black text-text truncate flex-grow">{product.name}</h4>
            {/* Tier indicator if min_tier_to_view is relevant and not 'basic' */}
            {product.min_tier_to_view && product.min_tier_to_view.toLowerCase() !== 'basic' && (
              <div className="flex items-center ml-2 flex-shrink-0">
                <Crown size={12} className="text-yellow-500" />
                <span className="text-[10px] font-black text-yellow-600 uppercase ml-0.5">{product.min_tier_to_view}</span>
              </div>
            )}
          </div>
          
          {/* Price and Discount Display */}
          <div className="price-section">
            <DisplayPriceInfo product={product} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
