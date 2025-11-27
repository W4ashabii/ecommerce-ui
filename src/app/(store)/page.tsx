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
import { formatPrice } from '@/lib/utils';

export default function HomePage() {
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
            <div className="w-full h-full bg-gradient-to-br from-brand-black via-gray-900 to-brand-black" />
          )}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Decorative Gradient Orbs */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-brand-pink/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-pink/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
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
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm mb-6">
                  <Sparkles className="h-4 w-4 text-brand-pink" />
                  New Collection Available
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-7xl font-display font-bold text-white leading-tight mb-6"
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
                className="text-lg text-white/70 mb-8 max-w-lg"
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
                <Button size="xl" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-black" asChild>
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
                    className="absolute top-0 left-0 w-48 h-64 rounded-2xl bg-gradient-to-br from-brand-pink/90 to-pink-600/90 backdrop-blur-sm p-3 shadow-2xl cursor-pointer"
                  >
                    <Link href={`/products/${heroProducts[0].slug}`}>
                      <div className="w-full h-40 rounded-xl bg-white/20 mb-3 overflow-hidden">
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
                            <Sparkles className="w-12 h-12 text-white/40" />
                          </div>
                        )}
                      </div>
                      <div className="text-white font-medium truncate">{heroProducts[0].name}</div>
                      <div className="text-white/70 text-sm font-semibold">{formatPrice(heroProducts[0].salePrice || heroProducts[0].price)}</div>
                    </Link>
                  </motion.div>
                )}

                {heroProducts[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 50, rotate: 5 }}
                    animate={{ opacity: 1, y: 0, rotate: 5 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    whileHover={{ scale: 1.05, rotate: 0 }}
                    className="absolute top-20 right-0 w-48 h-64 rounded-2xl bg-gradient-to-br from-purple-500/90 to-violet-600/90 backdrop-blur-sm p-3 shadow-2xl cursor-pointer"
                  >
                    <Link href={`/products/${heroProducts[1].slug}`}>
                      <div className="w-full h-40 rounded-xl bg-white/20 mb-3 overflow-hidden">
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
                            <Star className="w-12 h-12 text-white/40" />
                          </div>
                        )}
                      </div>
                      <div className="text-white font-medium truncate">{heroProducts[1].name}</div>
                      <div className="text-white/70 text-sm font-semibold">{formatPrice(heroProducts[1].salePrice || heroProducts[1].price)}</div>
                    </Link>
                  </motion.div>
                )}

                {heroProducts[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 50, rotate: -3 }}
                    animate={{ opacity: 1, y: 0, rotate: -3 }}
                    transition={{ duration: 1, delay: 0.7 }}
                    whileHover={{ scale: 1.05, rotate: 0 }}
                    className="absolute bottom-10 left-10 w-48 h-64 rounded-2xl bg-gradient-to-br from-rose-400/90 to-pink-500/90 backdrop-blur-sm p-3 shadow-2xl cursor-pointer"
                  >
                    <Link href={`/products/${heroProducts[2].slug}`}>
                      <div className="w-full h-40 rounded-xl bg-white/20 mb-3 overflow-hidden">
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
                            <Heart className="w-12 h-12 text-white/40" />
                          </div>
                        )}
                      </div>
                      <div className="text-white font-medium truncate">{heroProducts[2].name}</div>
                      <div className="text-white/70 text-sm font-semibold">{formatPrice(heroProducts[2].salePrice || heroProducts[2].price)}</div>
                    </Link>
                  </motion.div>
                )}

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -top-5 right-20 w-12 h-12 rounded-full bg-brand-pink/30 backdrop-blur-sm flex items-center justify-center"
                >
                  <Heart className="w-6 h-6 text-brand-pink" />
                </motion.div>

                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute bottom-20 -right-5 w-10 h-10 rounded-full bg-purple-500/30 backdrop-blur-sm flex items-center justify-center"
                >
                  <Star className="w-5 h-5 text-purple-400" />
                </motion.div>

                <motion.div
                  animate={{ y: [-5, 15, -5] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  className="absolute top-1/2 -left-5 w-8 h-8 rounded-full bg-rose-400/30 backdrop-blur-sm flex items-center justify-center"
                >
                  <Sparkles className="w-4 h-4 text-rose-300" />
                </motion.div>

                {/* Decorative Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="120"
                    fill="none"
                    stroke="rgba(236, 72, 153, 0.2)"
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
                    stroke="rgba(168, 85, 247, 0.15)"
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

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Star, title: 'Premium Quality', desc: 'Handcrafted with the finest materials' },
              { icon: Heart, title: 'Designed with Love', desc: 'Each piece tells a unique story' },
              { icon: Sparkles, title: 'Limited Editions', desc: 'Exclusive designs for you' },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-pink/10 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-brand-pink" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
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
      <section className="py-20 bg-brand-black text-white overflow-hidden">
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
              <p className="text-white/70 mb-8 max-w-md">
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
                <span className="text-6xl font-display font-bold text-white/10">
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

