'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

export function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-brand-pink" />
                  <h2 className="text-lg font-semibold">Your Cart</h2>
                  <span className="text-sm text-muted-foreground">
                    ({items.length} items)
                  </span>
                </div>
                <button
                  onClick={closeCart}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Discover our collection and add your favorites
                    </p>
                    <Button onClick={closeCart} asChild>
                      <Link href="/shop">Start Shopping</Link>
                    </Button>
                  </div>
                ) : (
                  items.map((item) => {
                    const price = item.salePrice || item.price;
                    return (
                      <motion.div
                        key={`${item.productId}-${item.size}-${item.color}`}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="flex gap-4 p-3 rounded-xl bg-muted/50"
                      >
                        {/* Image */}
                        <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={closeCart}
                            className="font-medium hover:text-brand-pink transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>

                          {(item.size || item.color) && (
                            <div className="flex gap-2 mt-1 text-sm text-muted-foreground">
                              {item.size && <span>Size: {item.size}</span>}
                              {item.color && (
                                <span className="flex items-center gap-1">
                                  Color:
                                  <span
                                    className="w-3 h-3 rounded-full border"
                                    style={{ backgroundColor: item.colorHex }}
                                  />
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity */}
                            <div className="flex items-center gap-1 bg-background rounded-lg border">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity - 1,
                                    item.size,
                                    item.color
                                  )
                                }
                                className="p-2 hover:text-brand-pink transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity + 1,
                                    item.size,
                                    item.color
                                  )
                                }
                                className="p-2 hover:text-brand-pink transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Price & Remove */}
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">
                                {formatPrice(price * item.quantity)}
                              </span>
                              <button
                                onClick={() =>
                                  removeItem(item.productId, item.size, item.color)
                                }
                                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="p-4 border-t border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-xl font-semibold">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Shipping and taxes calculated at checkout
                  </p>
                  <div className="space-y-2">
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/checkout" onClick={closeCart}>
                        Checkout
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={closeCart}
                      asChild
                    >
                      <Link href="/cart">View Cart</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


