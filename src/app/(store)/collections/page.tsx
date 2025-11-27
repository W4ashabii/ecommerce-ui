'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles } from 'lucide-react';
import { categoriesApi, settingsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function CollectionsPage() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const collectionsPage = settings?.collectionsPage;
  
  // Get featured collections first, then remaining
  const featuredIds = collectionsPage?.featuredCollectionIds || [];
  const featuredCollections = categories?.filter(c => featuredIds.includes(c._id)) || [];
  const otherCollections = categories?.filter(c => !featuredIds.includes(c._id) && c.isActive) || [];
  const allCollections = [...featuredCollections, ...otherCollections];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {collectionsPage?.heroImage ? (
            <Image
              src={collectionsPage.heroImage}
              alt={collectionsPage.title || 'Collections'}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-black via-purple-900/50 to-brand-black" />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm mb-4"
          >
            <Sparkles className="h-4 w-4 text-brand-pink" />
            Curated for You
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold text-white mb-4"
          >
            {collectionsPage?.title || 'Collections'}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/70 max-w-2xl mx-auto"
          >
            {collectionsPage?.subtitle || 'Explore our curated collections of sophisticated fashion pieces'}
          </motion.p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
              ))}
            </div>
          ) : allCollections.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No collections available yet</p>
              <Button asChild>
                <Link href="/shop">Browse All Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allCollections.map((collection, index) => (
                <motion.div
                  key={collection._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/shop?category=${collection._id}`} className="group block">
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
                      {collection.image ? (
                        <Image
                          src={collection.image}
                          alt={collection.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-pink/20 to-purple-500/20 flex items-center justify-center">
                          <span className="text-6xl font-display font-bold text-white/20">
                            {collection.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Featured Badge */}
                      {featuredIds.includes(collection._id) && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full bg-brand-pink text-white text-xs font-medium">
                            Featured
                          </span>
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-brand-pink transition-colors">
                          {collection.name}
                        </h3>
                        {collection.description && (
                          <p className="text-white/70 text-sm mb-4 line-clamp-2">
                            {collection.description}
                          </p>
                        )}
                        <span className="inline-flex items-center text-white/80 text-sm group-hover:text-brand-pink transition-colors">
                          Explore Collection
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Browse our complete catalog of products and discover something new
            </p>
            <Button size="xl" asChild>
              <Link href="/shop">
                Shop All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

