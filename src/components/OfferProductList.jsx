import React from 'react';
import ProductOfferCard from './ProductOfferCard';

export default function OfferProductList({ products, offerCategoryColor, isLoading }) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg bg-surface flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-surface rounded w-3/4"/>
              <div className="h-3 bg-surface rounded w-1/2"/>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
          <Package size={32} className="text-muted opacity-20" />
        </div>
        <p className="text-muted font-bold">No products found for this offer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <ProductOfferCard
          key={product.id}
          product={product}
          offerCategoryColor={offerCategoryColor}
          // Pass navigation handler if needed, or simply display info
          // onProductClick={() => navigate(`/products/${product.id}`)} 
        />
      ))}
    </div>
  );
}
