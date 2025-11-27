'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles, Star, Heart } from 'lucide-react';
import { productsApi, settingsApi, Product } from '@/lib/api';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme-context';

export default function HomePage() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  const { data: featuredProducts, isLoading: loadingFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.getFeatured(8),
  });

  const { data: newProducts, isLoading: loadingNew } = useQuery({
    queryKey: ['products', 'new'],
    queryFn: () => productsApi.getNew(4),
  });

  const activeHeroSlide = settings?.heroSlides?.find((s) => s.isActive);
  
  // Get first 3 featured products for hero floating cards
  const heroProducts = featuredProducts?.slice(0, 3) || [];

  return (
    <div className="min-h-screen">
      {/* Announcement Bar */}
      {settings?.announcementBar?.isActive && (
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="bg-brand-pink text-white py-2 text-center text-sm"
        >
          <Link href={settings.announcementBar.link || '/shop'} className="hover:underline">
            {settings.announcementBar.text}
          </Link>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          {activeHeroSlide?.image ? (
            <Image
              src={activeHeroSlide.image}
              alt={activeHeroSlide.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className={cn(
              "w-full h-full transition-colors duration-500",
              isDark 
                ? "bg-gradient-to-br from-brand-black via-gray-900 to-brand-black" 
                : "bg-gradient-to-br from-brand-beige via-white to-brand-cream"
            )} />
          )}
          <div className={cn(
            "absolute inset-0 transition-colors duration-500",
            isDark ? "bg-black/40" : "bg-white/20"
          )} />
          
          {/* Decorative Gradient Orbs */}
          <div className={cn(
            "absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl animate-float transition-colors duration-500",
            isDark ? "bg-brand-pink/20" : "bg-brand-baby-pink/40"
          )} />
          <div className={cn(
            "absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-float transition-colors duration-500",
            isDark ? "bg-brand-pink/10" : "bg-brand-pink/20"
          )} style={{ animationDelay: '1s' }} />
          <div className={cn(
            "absolute top-1/2 right-1/4 w-48 h-48 rounded-full blur-3xl animate-float transition-colors duration-500",
            isDark ? "bg-purple-500/10" : "bg-brand-baby-pink/30"
          )} style={{ animationDelay: '2s' }} />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm text-sm mb-6 transition-colors duration-500",
                  isDark 
                    ? "bg-white/10 text-white/80" 
                    : "bg-brand-pink/10 text-brand-pink-dark border border-brand-pink/20"
                )}>
                  <Sparkles className="h-4 w-4 text-brand-pink" />
                  New Collection Available
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={cn(
                  "text-5xl md:text-7xl font-display font-bold leading-tight mb-6 transition-colors duration-500",
                  isDark ? "text-white" : "text-gray-800"
                )}
              >
                {activeHeroSlide?.title || (
                  <>
                    Elegance
                    <br />
                    <span className="text-brand-pink">Redefined</span>
                  </>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={cn(
                  "text-lg mb-8 max-w-lg transition-colors duration-500",
                  isDark ? "text-white/70" : "text-gray-600"
                )}
              >
                {activeHeroSlide?.subtitle ||
                  'Discover our exclusive collection of sophisticated fashion pieces designed for the modern woman.'}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Button size="xl" asChild>
                  <Link href={activeHeroSlide?.buttonLink || '/shop'}>
                    {activeHeroSlide?.buttonText || 'Shop Now'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" className="transition-colors duration-500" asChild>
                  <Link href="/collections">
                    View Collections
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Right - Fashion Illustration */}
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-[3/4] max-w-md mx-auto">
                {/* Floating Fashion Cards - Using Featured Products */}
                {heroProducts[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 50, rotate: -5 }}
                    animate={{ opacity: 1, y: 0, rotate: -5 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    whileHover={{ scale: 1.05, rotate: 0 }}
                    className={cn(
                      "absolute top-0 left-0 w-48 h-64 rounded-2xl backdrop-blur-sm p-3 shadow-2xl cursor-pointer transition-colors duration-500",
                      isDark 
                        ? "bg-gradient-to-br from-brand-pink/90 to-pink-600/90" 
                        : "bg-white border border-brand-pink/20"
                    )}
                  >
                    <Link href={`/products/${heroProducts[0].slug}`}>
                      <div className={cn(
                        "w-full h-40 rounded-xl mb-3 overflow-hidden",
                        isDark ? "bg-white/20" : "bg-brand-beige"
                      )}>
                        {heroProducts[0].colorVariants[0]?.images[0] ? (
                          <Image
                            src={heroProducts[0].colorVariants[0].images[0]}
                            alt={heroProducts[0].name}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className={cn("w-12 h-12", isDark ? "text-white/40" : "text-brand-pink/40")} />
                          </div>
                        )}
                      </div>
                      <div className={cn("font-medium truncate", isDark ? "text-white" : "text-gray-800")}>{heroProducts[0].name}</div>
                      <div className={cn("text-sm font-semibold", isDark ? "text-white/70" : "text-brand-pink")}>{formatPrice(heroProducts[0].salePrice || heroProducts[0].price)}</div>
                    </Link>
                  </motion.div>
                )}

                {heroProducts[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 50, rotate: 5 }}
                    animate={{ opacity: 1, y: 0, rotate: 5 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    whileHover={{ scale: 1.05, rotate: 0 }}
                    className={cn(
                      "absolute top-20 right-0 w-48 h-64 rounded-2xl backdrop-blur-sm p-3 shadow-2xl cursor-pointer transition-colors duration-500",
                      isDark 
                        ? "bg-gradient-to-br from-purple-500/90 to-violet-600/90" 
                        : "bg-gradient-to-br from-brand-baby-pink to-brand-pink/30"
                    )}
                  >
                    <Link href={`/products/${heroProducts[1].slug}`}>
                      <div className={cn(
                        "w-full h-40 rounded-xl mb-3 overflow-hidden",
                        isDark ? "bg-white/20" : "bg-white/60"
                      )}>
                        {heroProducts[1].colorVariants[0]?.images[0] ? (
                          <Image
                            src={heroProducts[1].colorVariants[0].images[0]}
                            alt={heroProducts[1].name}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Star className={cn("w-12 h-12", isDark ? "text-white/40" : "text-brand-pink/40")} />
                          </div>
                        )}
                      </div>
                      <div className={cn("font-medium truncate", isDark ? "text-white" : "text-gray-800")}>{heroProducts[1].name}</div>
                      <div className={cn("text-sm font-semibold", isDark ? "text-white/70" : "text-brand-pink-dark")}>{formatPrice(heroProducts[1].salePrice || heroProducts[1].price)}</div>
                    </Link>
                  </motion.div>
                )}

                {heroProducts[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 50, rotate: -3 }}
                    animate={{ opacity: 1, y: 0, rotate: -3 }}
                    transition={{ duration: 1, delay: 0.7 }}
                    whileHover={{ scale: 1.05, rotate: 0 }}
                    className={cn(
                      "absolute bottom-10 left-10 w-48 h-64 rounded-2xl backdrop-blur-sm p-3 shadow-2xl cursor-pointer transition-colors duration-500",
                      isDark 
                        ? "bg-gradient-to-br from-rose-400/90 to-pink-500/90" 
                        : "bg-gradient-to-br from-white to-brand-baby-pink/50 border border-brand-pink/10"
                    )}
                  >
                    <Link href={`/products/${heroProducts[2].slug}`}>
                      <div className={cn(
                        "w-full h-40 rounded-xl mb-3 overflow-hidden",
                        isDark ? "bg-white/20" : "bg-brand-cream"
                      )}>
                        {heroProducts[2].colorVariants[0]?.images[0] ? (
                          <Image
                            src={heroProducts[2].colorVariants[0].images[0]}
                            alt={heroProducts[2].name}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Heart className={cn("w-12 h-12", isDark ? "text-white/40" : "text-brand-pink/40")} />
                          </div>
                        )}
                      </div>
                      <div className={cn("font-medium truncate", isDark ? "text-white" : "text-gray-800")}>{heroProducts[2].name}</div>
                      <div className={cn("text-sm font-semibold", isDark ? "text-white/70" : "text-brand-pink")}>{formatPrice(heroProducts[2].salePrice || heroProducts[2].price)}</div>
                    </Link>
                  </motion.div>
                )}

                {/* Floating Elements - Configurable */}
                {(settings?.floatingElements || [
                  { type: 'icon', icon: 'heart', position: 'top-right', isActive: true },
                  { type: 'icon', icon: 'star', position: 'bottom-right', isActive: true },
                  { type: 'icon', icon: 'sparkles', position: 'middle-left', isActive: true },
                ]).filter(el => el.isActive).map((element, index) => {
                  const positionClasses = {
                    'top-right': 'absolute -top-20 right-0',
                    'bottom-right': 'absolute bottom-0 -right-20',
                    'middle-left': 'absolute top-1/3 -left-32',
                  };
                  // For icons, keep smaller sizes. For images, use larger sizes (2x)
                  const iconContainerSizes = {
                    'top-right': 'w-32 h-32',
                    'bottom-right': 'w-28 h-28',
                    'middle-left': 'w-24 h-24',
                  };
                  const imageSizes = {
                    'top-right': 'w-[352px] h-[352px]',   // ~9cm
                    'bottom-right': 'w-80 h-80',          // 320px ~8.5cm
                    'middle-left': 'w-72 h-72',           // 288px ~7.6cm
                  };
                  const iconSizes = {
                    'top-right': 'w-16 h-16',
                    'bottom-right': 'w-14 h-14',
                    'middle-left': 'w-12 h-12',
                  };
                  const animations = [
                    { y: [-15, 15, -15], duration: 4 },
                    { y: [15, -15, 15], duration: 3 },
                    { y: [-10, 20, -10], duration: 5 },
                  ];
                  const bgClasses = {
                    'top-right': isDark ? "bg-brand-pink/30" : "bg-brand-pink/20",
                    'bottom-right': isDark ? "bg-purple-500/30" : "bg-brand-baby-pink/50",
                    'middle-left': isDark ? "bg-rose-400/30" : "bg-brand-pink/20",
                  };
                  
                  const isImage = element.type === 'image' && element.image;
                  
                  return (
                    <motion.div
                      key={element._id || index}
                      animate={animations[index % 3]}
                      transition={{ repeat: Infinity, duration: animations[index % 3].duration, ease: "easeInOut" }}
                      className={cn(
                        positionClasses[element.position],
                        isImage ? imageSizes[element.position] : iconContainerSizes[element.position],
                        "flex items-center justify-center transition-colors duration-500",
                        isImage ? "rounded-2xl" : "rounded-full backdrop-blur-sm",
                        isImage ? "bg-transparent" : bgClasses[element.position]
                      )}
                    >
                      {element.type === 'icon' ? (
                        <>
                          {element.icon === 'heart' && <Heart className={cn(iconSizes[element.position], "text-brand-pink")} />}
                          {element.icon === 'star' && <Star className={cn(iconSizes[element.position], isDark ? "text-purple-400" : "text-brand-pink")} />}
                          {element.icon === 'sparkles' && <Sparkles className={cn(iconSizes[element.position], isDark ? "text-rose-300" : "text-brand-pink")} />}
                        </>
                      ) : element.image ? (
                        <img 
                          src={element.image} 
                          alt="" 
                          className="w-full h-full object-contain drop-shadow-2xl"
                        />
                      ) : null}
                    </motion.div>
                  );
                })}

                {/* Decorative Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="120"
                    fill="none"
                    stroke={isDark ? "rgba(236, 72, 153, 0.2)" : "rgba(255, 79, 163, 0.3)"}
                    strokeWidth="1"
                    strokeDasharray="10 5"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  />
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="180"
                    fill="none"
                    stroke={isDark ? "rgba(168, 85, 247, 0.15)" : "rgba(255, 192, 203, 0.4)"}
                    strokeWidth="1"
                    strokeDasharray="15 10"
                    initial={{ rotate: 360 }}
                    animate={{ rotate: 0 }}
                    transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

      </section>


      {/* New Arrivals */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-brand-pink text-sm font-medium tracking-wider uppercase">
              Just In
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mt-2">
              New Arrivals
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingNew
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-product w-full rounded-xl" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              : newProducts?.map((product, idx) => (
                  <ProductCard key={product._id} product={product} index={idx} />
                ))}
          </div>
        </div>
      </section>

      {/* Featured Banner */}
      <section className="py-20 bg-card text-foreground overflow-hidden border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-brand-pink text-sm font-medium tracking-wider uppercase">
                Featured Collection
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold mt-4 mb-6">
                Summer<br />
                <span className="text-brand-pink">Essentials</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Embrace the season with our curated selection of lightweight fabrics
                and vibrant designs perfect for warm days.
              </p>
              <Button size="lg" asChild>
                <Link href="/collections/summer">
                  Explore Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/20 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-display font-bold text-foreground/10">
                  AMI
                </span>
              </div>
              {/* Decorative circles */}
              <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full border border-brand-pink/30 animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full border border-brand-pink/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-brand-pink text-sm font-medium tracking-wider uppercase">
                Best Sellers
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold mt-2">
                Featured Products
              </h2>
            </div>
            <Button variant="outline" asChild>
              <Link href="/shop">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingFeatured
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-product w-full rounded-xl" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              : featuredProducts?.map((product, idx) => (
                  <ProductCard key={product._id} product={product} index={idx} />
                ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-br from-brand-pink/10 to-brand-pink/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Join Our Community
            </h2>
            <p className="text-muted-foreground mb-8">
              Subscribe to get exclusive access to new arrivals, sales, and styling tips.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-pink/50"
              />
              <Button type="submit">
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

