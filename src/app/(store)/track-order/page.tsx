'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Package, 
  Truck, 
  Home, 
  CheckCircle, 
  Clock, 
  XCircle,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatDateTime } from '@/lib/utils';

const statusSteps = [
  { id: 'pending', label: 'Order Placed', icon: Clock },
  { id: 'processing', label: 'Processing', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: Home },
];

const statusColors: Record<string, string> = {
  pending: 'text-yellow-500',
  processing: 'text-blue-500',
  shipped: 'text-purple-500',
  delivered: 'text-green-500',
  cancelled: 'text-red-500',
};

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';
  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [searchQuery, setSearchQuery] = useState(initialOrder);

  const { data: trackingData, isLoading, error, refetch } = useQuery({
    queryKey: ['order-tracking', searchQuery],
    queryFn: () => ordersApi.track(searchQuery),
    enabled: !!searchQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setSearchQuery(orderNumber.trim());
    }
  };

  const getCurrentStep = () => {
    if (!trackingData) return -1;
    const idx = statusSteps.findIndex(s => s.id === trackingData.status);
    return idx >= 0 ? idx : -1;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Track Your Order
          </h1>
          <p className="text-muted-foreground">
            Enter your order number to see the current status
          </p>
        </motion.div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                placeholder="Enter order number (e.g., ORD-202411-000001)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                Track
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && searchQuery && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Order Not Found</h3>
              <p className="text-muted-foreground">
                We couldn't find an order with number "{searchQuery}". 
                Please check the order number and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tracking Result */}
        {trackingData && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Order Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Status</CardTitle>
                  <span className={`font-medium capitalize ${statusColors[trackingData.status]}`}>
                    {trackingData.status === 'cancelled' ? (
                      <span className="flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        Cancelled
                      </span>
                    ) : (
                      trackingData.status
                    )}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-mono font-bold text-lg">{trackingData.orderNumber}</p>
                </div>

                {trackingData.status !== 'cancelled' ? (
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-muted" />
                    <div 
                      className="absolute left-5 top-5 w-0.5 bg-brand-pink transition-all duration-500"
                      style={{ 
                        height: `${Math.max(0, getCurrentStep()) * 33.33}%`
                      }}
                    />

                    {/* Steps */}
                    <div className="space-y-8 relative">
                      {statusSteps.map((step, idx) => {
                        const isCompleted = idx <= getCurrentStep();
                        const isCurrent = idx === getCurrentStep();
                        
                        return (
                          <div key={step.id} className="flex items-center gap-4">
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                isCompleted 
                                  ? 'bg-brand-pink text-white' 
                                  : 'bg-muted text-muted-foreground'
                              } ${isCurrent ? 'ring-4 ring-brand-pink/20' : ''}`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <step.icon className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className={`font-medium ${isCompleted ? '' : 'text-muted-foreground'}`}>
                                {step.label}
                              </p>
                              {isCurrent && (
                                <p className="text-sm text-brand-pink">Current status</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">This order has been cancelled</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tracking Number */}
            {trackingData.trackingNumber && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Truck className="h-8 w-8 text-brand-pink" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tracking Number</p>
                      <p className="font-mono font-bold">{trackingData.trackingNumber}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Section */}
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-4">Need Help?</h4>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>+977-1-XXXXXXX</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>support@ami.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {!searchQuery && !isLoading && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Enter Your Order Number</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                You can find your order number in the confirmation email we sent you after placing your order.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function TrackOrderLoading() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-48 mx-auto" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<TrackOrderLoading />}>
      <TrackOrderContent />
    </Suspense>
  );
}


