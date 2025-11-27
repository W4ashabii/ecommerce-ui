'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { X, SlidersHorizontal } from 'lucide-react';
import { productsApi, categoriesApi, ProductFilters } from '@/lib/api';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const priceRanges = [
  { label: 'All Prices', min: undefined, max: undefined },
  { label: 'Under NPR 5,000', min: 0, max: 5000 },
  { label: 'NPR 5,000 - 10,000', min: 5000, max: 10000 },
  { label: 'NPR 10,000 - 20,000', min: 10000, max: 20000 },
  { label: 'Over NPR 20,000', min: 20000, max: undefined },
];

function ShopPageLoading() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-[3/4] w-full rounded-xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopPageLoading />}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
    isActive: true,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(priceRanges[0]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getAll({
      ...filters,
      sizes: selectedSizes.length > 0 ? selectedSizes.join(',') : undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    }),
  });

  // Handle URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const newParam = searchParams.get('new');

    setFilters((prev) => ({
      ...prev,
      category: category || undefined,
      search: search || undefined,
      featured: featured === 'true' ? true : undefined,
      isNewArrival: newParam === 'true' ? true : undefined,
    }));
  }, [searchParams]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    );
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12, isActive: true });
    setSelectedSizes([]);
    setPriceRange(priceRanges[0]);
  };

  const hasActiveFilters =
    filters.category ||
    selectedSizes.length > 0 ||
    priceRange.min !== undefined;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-display font-bold mb-2"
          >
            Shop All
          </motion.h1>
          <p className="text-muted-foreground">
            {productsData?.total || 0} products
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              'lg:w-64 shrink-0',
              showFilters
                ? 'fixed inset-0 z-50 bg-background p-6 overflow-y-auto lg:relative lg:p-0'
                : 'hidden lg:block'
            )}
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, category: undefined }))
                  }
                  className={cn(
                    'block w-full text-left py-2 px-3 rounded-lg transition-colors',
                    !filters.category
                      ? 'bg-brand-pink/10 text-brand-pink'
                      : 'hover:bg-muted'
                  )}
                >
                  All Categories
                </button>
                {categories?.map((category) => (
                  <button
                    key={category._id}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, category: category._id }))
                    }
                    className={cn(
                      'block w-full text-left py-2 px-3 rounded-lg transition-colors',
                      filters.category === category._id
                        ? 'bg-brand-pink/10 text-brand-pink'
                        : 'hover:bg-muted'
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Price Range</h3>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setPriceRange(range)}
                    className={cn(
                      'block w-full text-left py-2 px-3 rounded-lg transition-colors',
                      priceRange.label === range.label
                        ? 'bg-brand-pink/10 text-brand-pink'
                        : 'hover:bg-muted'
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={cn(
                      'w-10 h-10 rounded-lg border-2 font-medium text-sm transition-colors',
                      selectedSizes.includes(size)
                        ? 'border-brand-pink bg-brand-pink/10 text-brand-pink'
                        : 'border-border hover:border-brand-pink'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Clear All Filters
              </Button>
            )}

            {/* Mobile Apply Button */}
            <div className="mt-6 lg:hidden">
              <Button
                onClick={() => setShowFilters(false)}
                className="w-full"
              >
                Apply Filters
              </Button>
            </div>
          </motion.aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 w-5 h-5 rounded-full bg-brand-pink text-white text-xs flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>

              <div className="flex items-center gap-4 ml-auto">
                <Select
                  value={String(filters.limit)}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, limit: parseInt(value), page: 1 }))
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="newest">
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-pink/10 text-brand-pink text-sm">
                    {categories?.find((c) => c._id === filters.category)?.name}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, category: undefined }))
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedSizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-pink/10 text-brand-pink text-sm"
                  >
                    Size: {size}
                    <button onClick={() => toggleSize(size)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {priceRange.min !== undefined && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-pink/10 text-brand-pink text-sm">
                    {priceRange.label}
                    <button onClick={() => setPriceRange(priceRanges[0])}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-product w-full rounded-xl" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : productsData?.products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No products found</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsData?.products.map((product, idx) => (
                  <ProductCard key={product._id} product={product} index={idx} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {productsData && productsData.pages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: productsData.pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: i + 1 }))
                    }
                    className={cn(
                      'w-10 h-10 rounded-lg font-medium transition-colors',
                      filters.page === i + 1
                        ? 'bg-brand-pink text-white'
                        : 'hover:bg-muted'
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

