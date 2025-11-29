'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useState } from 'react';
import { Product } from '@/lib/api';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);

  const currentVariant = product.colorVariants[selectedColor];
  const mainImage = product.images?.[0] || '/placeholder-product.jpg';
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? getDiscountPercentage(product.price, product.salePrice!)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-product overflow-hidden rounded-xl bg-muted">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {product.isNewArrival && (
              <Badge variant="pink">New</Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive">-{discountPercent}%</Badge>
            )}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute top-3 right-3 z-10 flex flex-col gap-2"
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                // Add to wishlist logic
              }}
              className="p-2 rounded-full bg-card/90 backdrop-blur-sm hover:bg-brand-pink text-foreground hover:text-white transition-colors shadow-lg border border-border"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                // Quick view logic
              }}
              className="p-2 rounded-full bg-card/90 backdrop-blur-sm hover:bg-brand-pink text-foreground hover:text-white transition-colors shadow-lg border border-border"
            >
              <Eye className="h-4 w-4" />
            </button>
          </motion.div>

          {/* Image */}
          <div className="relative h-full w-full">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className={cn(
                'object-cover transition-transform duration-500',
                isHovered && 'scale-105'
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </div>

          {/* Add to Cart */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: isHovered ? 0 : '100%' }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                // Quick add to cart logic
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-pink text-white rounded-lg font-medium hover:bg-brand-pink/80 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </button>
          </motion.div>
        </div>

        {/* Info */}
        <div className="mt-4 space-y-2">
          {/* Color Options */}
          {product.colorVariants.length > 1 && (
            <div className="flex gap-1">
              {product.colorVariants.slice(0, 5).map((variant, idx) => (
                <button
                  key={variant._id || idx}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedColor(idx);
                  }}
                  className={cn(
                    'w-5 h-5 rounded-full border-2 transition-all',
                    selectedColor === idx
                      ? 'border-brand-pink scale-110'
                      : 'border-transparent hover:scale-110'
                  )}
                  style={{ backgroundColor: variant.hex }}
                  title={variant.name}
                />
              ))}
              {product.colorVariants.length > 5 && (
                <span className="text-xs text-muted-foreground ml-1">
                  +{product.colorVariants.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Category */}
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {product.category.name}
          </p>

          {/* Name */}
          <h3 className="font-medium text-foreground group-hover:text-brand-pink transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="font-semibold text-brand-pink">
                  {formatPrice(product.salePrice!)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="font-semibold">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

