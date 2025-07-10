import React from 'react';

interface ProductVariant {
  id: string;
  type: 'size' | 'color' | 'style';
  name: string;
  value: string;
  price_modifier?: number;
  stock?: number;
}

interface ProductVariantsProps {
  variants: ProductVariant[];
  selectedVariants: Record<string, string>;
  onVariantChange: (variantType: string, value: string) => void;
  className?: string;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({
  variants,
  selectedVariants,
  onVariantChange,
  className = ''
}) => {
  // Group variants by type
  const groupedVariants = variants.reduce((acc, variant) => {
    if (!acc[variant.type]) {
      acc[variant.type] = [];
    }
    acc[variant.type].push(variant);
    return acc;
  }, {} as Record<string, ProductVariant[]>);

  // Format price modifier for display
  const formatPriceModifier = (modifier: number) => {
    const sign = modifier >= 0 ? '+' : '';
    return `${sign}$${Math.abs(modifier).toFixed(2)}`;
  };

  // Get variant type display name
  const getVariantTypeDisplayName = (type: string) => {
    switch (type) {
      case 'size':
        return 'Size';
      case 'color':
        return 'Color';
      case 'style':
        return 'Style';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Check if variant is out of stock
  const isVariantOutOfStock = (variant: ProductVariant) => {
    return variant.stock !== undefined && variant.stock <= 0;
  };

  // Render color variant (special styling for colors)
  const renderColorVariant = (variant: ProductVariant, isSelected: boolean) => {
    const isOutOfStock = isVariantOutOfStock(variant);
    
    return (
      <button
        key={variant.id}
        onClick={() => !isOutOfStock && onVariantChange(variant.type, variant.value)}
        disabled={isOutOfStock}
        className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 ${
          isSelected
            ? 'border-blue-500 ring-2 ring-blue-500/30'
            : 'border-gray-600 hover:border-gray-500'
        } ${
          isOutOfStock
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer'
        }`}
        title={`${variant.name}${variant.price_modifier ? ` (${formatPriceModifier(variant.price_modifier)})` : ''}${isOutOfStock ? ' - Out of Stock' : ''}`}
      >
        {/* Color circle */}
        <div
          className="w-full h-full rounded-full"
          style={{ backgroundColor: variant.value.toLowerCase() }}
        />
        
        {/* Out of stock indicator */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-0.5 bg-red-500 rotate-45"></div>
          </div>
        )}
        
        {/* Selected indicator */}
        {isSelected && !isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full border border-gray-800"></div>
          </div>
        )}
      </button>
    );
  };

  // Render size or style variant (button styling)
  const renderButtonVariant = (variant: ProductVariant, isSelected: boolean) => {
    const isOutOfStock = isVariantOutOfStock(variant);
    
    return (
      <button
        key={variant.id}
        onClick={() => !isOutOfStock && onVariantChange(variant.type, variant.value)}
        disabled={isOutOfStock}
        className={`px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
          isSelected
            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
            : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
        } ${
          isOutOfStock
            ? 'opacity-50 cursor-not-allowed line-through'
            : 'cursor-pointer'
        }`}
      >
        <span className="flex items-center space-x-1">
          <span>{variant.name}</span>
          {variant.price_modifier && (
            <span className="text-xs opacity-75">
              ({formatPriceModifier(variant.price_modifier)})
            </span>
          )}
          {isOutOfStock && (
            <span className="text-xs text-red-400 ml-1">
              (Out of Stock)
            </span>
          )}
        </span>
      </button>
    );
  };

  if (Object.keys(groupedVariants).length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(groupedVariants).map(([variantType, variantList]) => {
        const selectedValue = selectedVariants[variantType];
        const displayName = getVariantTypeDisplayName(variantType);
        
        return (
          <div key={variantType} className="space-y-3">
            {/* Variant Type Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-200">
                {displayName}
              </h3>
              {selectedValue && (
                <span className="text-sm text-gray-400">
                  Selected: {variantList.find(v => v.value === selectedValue)?.name || selectedValue}
                </span>
              )}
            </div>

            {/* Variant Options */}
            <div className={`flex flex-wrap gap-3 ${
              variantType === 'color' ? 'items-center' : ''
            }`}>
              {variantList.map((variant) => {
                const isSelected = selectedValue === variant.value;
                
                if (variantType === 'color') {
                  return renderColorVariant(variant, isSelected);
                } else {
                  return renderButtonVariant(variant, isSelected);
                }
              })}
            </div>

            {/* Variant Description */}
            {selectedValue && (
              <div className="text-sm text-gray-400">
                {(() => {
                  const selectedVariant = variantList.find(v => v.value === selectedValue);
                  if (!selectedVariant) return null;
                  
                  const parts = [];
                  if (selectedVariant.price_modifier) {
                    parts.push(`${formatPriceModifier(selectedVariant.price_modifier)} price adjustment`);
                  }
                  if (selectedVariant.stock !== undefined) {
                    parts.push(`${selectedVariant.stock} available`);
                  }
                  
                  return parts.length > 0 ? parts.join(' • ') : null;
                })()}
              </div>
            )}
          </div>
        );
      })}

      {/* Variant Selection Status */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="font-medium text-gray-200 mb-2">Selection Summary</h4>
        <div className="space-y-1">
          {Object.entries(groupedVariants).map(([variantType, variantList]) => {
            const selectedValue = selectedVariants[variantType];
            const selectedVariant = variantList.find(v => v.value === selectedValue);
            const displayName = getVariantTypeDisplayName(variantType);
            
            return (
              <div key={variantType} className="flex justify-between text-sm">
                <span className="text-gray-400">{displayName}:</span>
                <span className="text-gray-200">
                  {selectedVariant ? selectedVariant.name : 'Not selected'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductVariants;
