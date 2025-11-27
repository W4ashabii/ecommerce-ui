'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Heart, Sparkles, Star, ArrowRight, Check } from 'lucide-react';
import { settingsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const defaultValues = [
  'Quality craftsmanship in every piece',
  'Sustainable and ethical practices',
  'Customer-first approach',
  'Timeless elegance over trends',
  'Inclusive sizing and styles',
];

export default function AboutPage() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  const aboutPage = settings?.aboutPage;
  const values = aboutPage?.values?.items?.length ? aboutPage.values.items : defaultValues;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="h-[50vh] w-full" />
        <div className="container mx-auto px-4 py-16">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-32 w-full max-w-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {aboutPage?.heroImage ? (
            <Image
              src={aboutPage.heroImage}
              alt={aboutPage.title || 'About Us'}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-black via-brand-pink/20 to-brand-black" />
          )}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-brand-pink/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm mb-4"
          >
            <Heart className="h-4 w-4 text-brand-pink" />
            {aboutPage?.subtitle || 'Our Story'}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold text-white mb-4"
          >
            {aboutPage?.title || 'About AMI'}
          </motion.h1>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 text-brand-pink text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                Our Journey
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                {aboutPage?.story?.title || 'Our Story'}
              </h2>
              <div className="prose prose-lg text-muted-foreground">
                <p>
                  {aboutPage?.story?.content || 
                    `Welcome to AMI, where fashion meets elegance. Founded with a passion for timeless style and quality craftsmanship, we've been dressing modern women with sophisticated pieces that transcend seasons.
                    
                    Our journey began with a simple belief: every woman deserves to feel confident and beautiful. From our carefully curated collections to our commitment to sustainable practices, we strive to make fashion that matters.`
                  }
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-brand-pink/20 to-purple-500/20">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Heart className="h-20 w-20 text-brand-pink/50 mx-auto mb-4" />
                    <span className="text-2xl font-display text-white/50">AMI</span>
                  </div>
                </div>
              </div>
              
              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-8 -left-8 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl"
              >
                <div className="text-3xl font-bold text-brand-pink mb-1">5000+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute -top-8 -right-8 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl"
              >
                <div className="text-3xl font-bold text-brand-pink mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Quality Assured</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 text-brand-pink text-sm font-medium mb-4">
                <Star className="h-4 w-4" />
                Why We Exist
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                {aboutPage?.mission?.title || 'Our Mission'}
              </h2>
              <p className="text-lg text-muted-foreground">
                {aboutPage?.mission?.content || 
                  'To empower every woman with fashion that combines elegance, quality, and sustainability. We believe style should be accessible, and every piece we create is designed to make you feel your most confident self.'
                }
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                {aboutPage?.values?.title || 'Our Values'}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                The principles that guide everything we do
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-muted/50"
              >
                <div className="w-6 h-6 rounded-full bg-brand-pink/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-brand-pink" />
                </div>
                <span className="text-foreground">{value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      {aboutPage?.team?.members && aboutPage.team.members.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  {aboutPage.team.title || 'Meet Our Team'}
                </h2>
                {aboutPage.team.subtitle && (
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    {aboutPage.team.subtitle}
                  </p>
                )}
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {aboutPage.team.members.map((member, index) => (
                <motion.div
                  key={member._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-brand-pink/20 to-purple-500/20">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-display font-bold text-white/30">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-muted-foreground text-sm">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-pink to-purple-600" />
            <div className="relative z-10 py-16 px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Ready to Discover Your Style?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Explore our latest collections and find pieces that speak to you
              </p>
              <Button size="xl" variant="secondary" asChild>
                <Link href="/shop">
                  Start Shopping
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

