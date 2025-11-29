'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { CreditCard, Truck, Check, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { ordersApi, CreateOrderInput } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal > 5000 ? 0 : 200; // Free shipping over NPR 5000
  const tax = Math.round(subtotal * 0.13); // 13% VAT in Nepal
  const total = subtotal + shipping + tax;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    country: 'Nepal',
  });

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirm'>('shipping');

  const createOrderMutation = useMutation({
    mutationFn: (order: CreateOrderInput) => ordersApi.create(order),
    onSuccess: (order) => {
      clearCart();
      toast.success('Order placed successfully!');
      router.push(`/order-confirmation/${order.orderNumber}`);
    },
    onError: () => {
      toast.error('Failed to place order. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'shipping') {
      setStep('payment');
      return;
    }

    if (step === 'payment') {
      setStep('confirm');
      return;
    }

    // Place order
    createOrderMutation.mutate({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      shippingAddress: formData,
      paymentMethod: 'card',
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 text-center">
          <ShoppingBag className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-display font-bold mb-4">
            Your cart is empty
          </h1>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-display font-bold mb-8"
        >
          Checkout
        </motion.h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[
            { id: 'shipping', label: 'Shipping', icon: Truck },
            { id: 'payment', label: 'Payment', icon: CreditCard },
            { id: 'confirm', label: 'Confirm', icon: Check },
          ].map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex items-center gap-2 ${
                  step === s.id
                    ? 'text-brand-pink'
                    : ['shipping', 'payment', 'confirm'].indexOf(step) >
                      ['shipping', 'payment', 'confirm'].indexOf(s.id)
                    ? 'text-green-500'
                    : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step === s.id
                      ? 'bg-brand-pink text-white'
                      : ['shipping', 'payment', 'confirm'].indexOf(step) >
                        ['shipping', 'payment', 'confirm'].indexOf(s.id)
                      ? 'bg-green-500 text-white'
                      : 'bg-muted'
                  }`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="font-medium hidden sm:block">{s.label}</span>
              </div>
              {idx < 2 && (
                <div
                  className={`w-12 sm:w-24 h-0.5 mx-2 ${
                    ['shipping', 'payment', 'confirm'].indexOf(step) > idx
                      ? 'bg-green-500'
                      : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {step === 'shipping' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Shipping Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData((p) => ({ ...p, firstName: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData((p) => ({ ...p, lastName: e.target.value }))
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData((p) => ({ ...p, email: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData((p) => ({ ...p, phone: e.target.value }))
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Delivery Address *</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, address: e.target.value }))
                          }
                          placeholder="Street address, area, ward number"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          We deliver within Kathmandu Valley only
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" value={formData.country} disabled />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div 
                        className="p-4 border-2 border-brand-pink rounded-lg bg-brand-pink/5 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full border-2 border-brand-pink flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-brand-pink" />
                          </div>
                          <div>
                            <p className="font-medium">Cash on Delivery</p>
                            <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className="p-4 border rounded-lg opacity-50 cursor-not-allowed"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                          <div>
                            <p className="font-medium">Online Payment</p>
                            <p className="text-sm text-muted-foreground">Coming soon (eSewa, Khalti)</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {step === 'confirm' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Check className="h-5 w-5" />
                        Confirm Order
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2">Shipping Address</h4>
                        <p className="text-muted-foreground text-sm">
                          {formData.firstName} {formData.lastName}
                          <br />
                          {formData.address}
                          <br />
                          Kathmandu Valley, {formData.country}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Contact</h4>
                        <p className="text-muted-foreground text-sm">
                          {formData.email}
                          <br />
                          {formData.phone}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Items ({items.length})</h4>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div
                              key={`${item.productId}-${item.size}-${item.color}`}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.name} x {item.quantity}
                                {item.size && ` (${item.size})`}
                              </span>
                              <span>
                                {formatPrice((item.salePrice || item.price) * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <div className="flex gap-4 mt-6">
                {step !== 'shipping' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setStep(step === 'payment' ? 'shipping' : 'payment')
                    }
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createOrderMutation.isPending}
                >
                  {step === 'confirm'
                    ? createOrderMutation.isPending
                      ? 'Placing Order...'
                      : 'Place Order'
                    : 'Continue'}
                </Button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex gap-3"
                  >
                    <div className="w-16 h-20 rounded-lg bg-muted overflow-hidden">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                        {item.size && ` • ${item.size}`}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        {formatPrice((item.salePrice || item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold">{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

