'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, Home, Copy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    toast.success('Order number copied!');
  };

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Order Placed Successfully!
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Thank you for your order. We've received your order and will begin processing it soon.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
            <span className="text-muted-foreground">Order Number:</span>
            <span className="font-mono font-bold">{orderNumber}</span>
            <button onClick={copyOrderNumber} className="p-1 hover:bg-muted-foreground/20 rounded">
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Order Timeline */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-6">What's Next?</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Order Confirmed</p>
                  <p className="text-sm text-muted-foreground">We've received your order</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Processing</p>
                  <p className="text-sm text-muted-foreground">Your order is being prepared</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Home className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Delivered</p>
                  <p className="text-sm text-muted-foreground">Package delivered</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">📧 Confirmation Email</h4>
              <p className="text-sm text-muted-foreground">
                A confirmation email with your order details has been sent to your email address.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">📞 Need Help?</h4>
              <p className="text-sm text-muted-foreground">
                Contact us at support@ami.com or call +977-1-XXXXXXX for any questions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href={`/track-order?order=${orderNumber}`}>
              Track Your Order
            </Link>
          </Button>
          <Button asChild>
            <Link href="/shop">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}



