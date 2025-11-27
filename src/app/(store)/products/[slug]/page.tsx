'use client';

import { useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Heart, 
  Share2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ChevronRight,
  Truck,
  RotateCcw,
  Shield,
  Check
} from 'lucide-react';
import { productsApi, Product } from '@/lib/api';
import { useCartStore } from '@/store/cart';
import { formatPrice, getDiscountPercentage, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductCard } from '@/components/products/product-card';
import { ModelViewer, ModelViewerFallback } from '@/components/products/model-viewer';
import dynamic from 'next/dynamic';

// Dynamic import for 3D viewer to prevent SSR issues
const DynamicModelViewer = dynamic(
  () => import('@/components/products/model-viewer').then(mod => mod.ModelViewer),
  { 
    ssr: false,
    loading: () => <Skeleton className="w-full aspect-square rounded-2xl" />
  }
);

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const { addItem, openCart } = useCartStore();
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [view3D, setView3D] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getBySlug(slug),
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['products', 'category', product?.category._id],
    queryFn: () => productsApi.getByCategory(product!.category._id, 1, 4),
    enabled: !!product,
  });

  if (isLoading) {
    return <ProductSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Product not found</h1>
          <Button asChild>
            <Link href="/shop">Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentVariant = product.colorVariants[selectedColor];
  const images = currentVariant?.images || [];
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? getDiscountPercentage(product.price, product.salePrice!)
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      // Could show toast here
      return;
    }

    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      salePrice: product.salePrice,
      quantity,
      size: selectedSize,
      color: currentVariant?.name,
      colorHex: currentVariant?.hex,
      image: images[0],
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/shop" className="hover:text-foreground transition-colors">
            Shop
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/shop?category=${product.category._id}`}
            className="hover:text-foreground transition-colors"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image / 3D View */}
            <div className="relative">
              {view3D && product.modelUrl ? (
                <DynamicModelViewer modelUrl={product.modelUrl} />
              ) : (
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative aspect-product rounded-2xl overflow-hidden bg-muted"
                >
                  {images[activeImage] ? (
                    <Image
                      src={images[activeImage]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isNewArrival && <Badge variant="pink">New</Badge>}
                    {hasDiscount && (
                      <Badge variant="destructive">-{discountPercent}%</Badge>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-brand-pink hover:text-white transition-colors shadow-lg">
                      <Heart className="h-5 w-5" />
                    </button>
                    <button className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-brand-pink hover:text-white transition-colors shadow-lg">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 3D Toggle */}
              {product.modelUrl && (
                <button
                  onClick={() => setView3D(!view3D)}
                  className={cn(
                    'absolute bottom-4 left-4 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-lg',
                    view3D
                      ? 'bg-brand-pink text-white'
                      : 'bg-white/90 backdrop-blur-sm hover:bg-brand-pink hover:text-white'
                  )}
                >
                  {view3D ? 'View Photos' : 'View in 3D'}
                </button>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && !view3D && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      'relative w-20 h-24 rounded-lg overflow-hidden shrink-0 border-2 transition-colors',
                      activeImage === idx
                        ? 'border-brand-pink'
                        : 'border-transparent hover:border-brand-pink/50'
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <Link
              href={`/shop?category=${product.category._id}`}
              className="text-sm text-brand-pink uppercase tracking-wider hover:underline"
            >
              {product.category.name}
            </Link>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-bold text-brand-pink">
                    {formatPrice(product.salePrice!)}
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                  <Badge variant="destructive">Save {discountPercent}%</Badge>
                </>
              ) : (
                <span className="text-3xl font-bold">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Color Selection */}
            {product.colorVariants.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Color: {currentVariant?.name}
                </label>
                <div className="flex gap-2">
                  {product.colorVariants.map((variant, idx) => (
                    <button
                      key={variant._id || idx}
                      onClick={() => {
                        setSelectedColor(idx);
                        setActiveImage(0);
                      }}
                      className={cn(
                        'w-10 h-10 rounded-full border-2 transition-all relative',
                        selectedColor === idx
                          ? 'border-brand-pink scale-110'
                          : 'border-transparent hover:scale-110'
                      )}
                      style={{ backgroundColor: variant.hex }}
                      title={variant.name}
                    >
                      {selectedColor === idx && (
                        <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Size</label>
                  <button className="text-sm text-brand-pink hover:underline">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'min-w-12 h-12 px-4 rounded-lg border-2 font-medium transition-colors',
                        selectedSize === size
                          ? 'border-brand-pink bg-brand-pink/10 text-brand-pink'
                          : 'border-border hover:border-brand-pink'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium mb-3 block">Quantity</label>
              <div className="flex items-center gap-1 w-fit bg-muted rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:text-brand-pink transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:text-brand-pink transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <Button
                size="xl"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.sizes.length > 0 && !selectedSize}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="xl" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-brand-pink" />
                <p className="text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-brand-pink" />
                <p className="text-xs text-muted-foreground">30-Day Returns</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-brand-pink" />
                <p className="text-xs text-muted-foreground">Secure Payment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <div className="prose prose-gray max-w-none">
                <p>{product.description}</p>
              </div>
            </TabsContent>
            <TabsContent value="details" className="mt-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-3">Product Details</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Category: {product.category.name}</li>
                    <li>Available Sizes: {product.sizes.join(', ')}</li>
                    <li>Colors: {product.colorVariants.map(v => v.name).join(', ')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Care Instructions</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Machine wash cold</li>
                    <li>Do not bleach</li>
                    <li>Tumble dry low</li>
                    <li>Iron on low heat</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <p className="text-muted-foreground">No reviews yet.</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.products.length > 1 && (
          <section className="mt-20">
            <h2 className="text-2xl font-display font-bold mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.products
                .filter((p) => p._id !== product._id)
                .slice(0, 4)
                .map((product, idx) => (
                  <ProductCard key={product._id} product={product} index={idx} />
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Skeleton className="h-4 w-64 mb-8" />
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Skeleton className="aspect-product rounded-2xl" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-20 h-24 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-10 h-10 rounded-full" />
              ))}
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="w-12 h-12 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

