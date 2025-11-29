'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { ordersApi, productsApi, categoriesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboard() {
  const { user, token } = useAuth();

  const { data: orderStats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin', 'order-stats'],
    queryFn: () => ordersApi.getStats(token || ''),
    enabled: !!token,
  });

  const { data: products } = useQuery({
    queryKey: ['admin', 'products-count'],
    queryFn: () => productsApi.getAll({ limit: 1 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => categoriesApi.getAll(true),
  });

  const stats = [
    {
      title: 'Total Revenue',
      value: orderStats ? formatPrice(orderStats.totalRevenue) : '$0',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      title: 'Total Orders',
      value: orderStats?.totalOrders || 0,
      change: '+8.2%',
      changeType: 'positive',
      icon: ShoppingCart,
    },
    {
      title: 'Products',
      value: products?.total || 0,
      change: '+3',
      changeType: 'neutral',
      icon: Package,
    },
    {
      title: 'Pending Orders',
      value: orderStats?.pendingOrders || 0,
      change: orderStats?.pendingOrders ? '-' : '',
      changeType: 'neutral',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          Dashboard
        </motion.h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.name?.split(' ')[0]}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.change && (
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        {stat.changeType === 'positive' ? (
                          <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                        ) : stat.changeType === 'negative' ? (
                          <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                        ) : null}
                        <span
                          className={
                            stat.changeType === 'positive'
                              ? 'text-green-500'
                              : stat.changeType === 'negative'
                              ? 'text-red-500'
                              : ''
                          }
                        >
                          {stat.change}
                        </span>
                        <span className="ml-1">from last month</span>
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Pending', value: orderStats?.pendingOrders || 0, color: 'bg-yellow-500' },
                { label: 'Processing', value: orderStats?.processingOrders || 0, color: 'bg-blue-500' },
                { label: 'Delivered', value: orderStats?.deliveredOrders || 0, color: 'bg-green-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {categories ? (
              <div className="space-y-3">
                {categories.slice(0, 5).map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-brand-pink/10 flex items-center justify-center">
                          <Package className="h-5 w-5 text-brand-pink" />
                        </div>
                      )}
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        category.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Add Product', href: '/admin/products/new', color: 'bg-brand-pink' },
          { label: 'View Orders', href: '/admin/orders', color: 'bg-blue-500' },
          { label: 'Edit Content', href: '/admin/content', color: 'bg-purple-500' },
          { label: 'Site Settings', href: '/admin/settings', color: 'bg-gray-500' },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={`${link.color} text-white p-4 rounded-xl font-medium text-center hover:opacity-90 transition-opacity`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

