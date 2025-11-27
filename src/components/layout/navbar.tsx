'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, User, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/collections', label: 'Collections' },
  { href: '/about', label: 'About' },
];

export function Navbar() {
  const { user, isAdmin, signIn, signOut } = useAuth();
  const { mode, toggleMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggleCart, getItemCount } = useCartStore();
  const itemCount = getItemCount();

  const isDark = mode === 'dark';

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b transition-colors duration-300",
      isDark 
        ? "bg-brand-black/95 border-white/10" 
        : "bg-white/95 border-brand-pink/20"
    )}>
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold tracking-tight">
            <span className="text-brand-pink">AMI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors relative group",
                isDark 
                  ? "text-white/80 hover:text-white" 
                  : "text-gray-600 hover:text-brand-pink"
              )}
            >
              {link.label}
              <span className={cn(
                "absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full",
                isDark ? "bg-white" : "bg-brand-pink"
              )} />
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleMode}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDark 
                ? "hover:bg-brand-pink/10 text-brand-pink" 
                : "hover:bg-brand-pink/10 text-brand-pink"
            )}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Cart */}
          <button
            onClick={toggleCart}
            className={cn(
              "relative p-2 rounded-lg transition-colors",
              isDark 
                ? "hover:bg-brand-pink/10 text-brand-pink" 
                : "hover:bg-brand-pink/10 text-brand-pink"
            )}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-5 w-5 bg-brand-pink text-white text-xs font-medium rounded-full flex items-center justify-center"
              >
                {itemCount}
              </motion.span>
            )}
          </button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex items-center gap-2 p-1.5 pr-3 rounded-full transition-all",
                  isDark 
                    ? "hover:bg-white/10" 
                    : "hover:bg-brand-pink/10 border border-brand-pink/20"
                )}>
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || 'User'}
                      className="h-8 w-8 rounded-full ring-2 ring-brand-pink/50 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold",
                      isDark 
                        ? "bg-brand-pink/20 text-brand-pink" 
                        : "bg-brand-pink text-white"
                    )}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className={cn(
                    "text-sm font-medium hidden sm:block max-w-[100px] truncate",
                    isDark ? "text-brand-pink" : "text-gray-700"
                  )}>
                    {user.name?.split(' ')[0] || 'User'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-3 px-3 py-3">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || 'User'}
                      className="h-10 w-10 rounded-full ring-2 ring-brand-pink/30 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-brand-pink/20 flex items-center justify-center text-brand-pink font-semibold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={signOut}
                  className="flex items-center gap-2 text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              onClick={signIn}
              className="bg-brand-pink hover:bg-brand-pink/90 text-white"
            >
              Sign In
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              "p-2 rounded-lg transition-colors md:hidden",
              isDark 
                ? "hover:bg-white/10 text-white" 
                : "hover:bg-brand-pink/10 text-brand-pink"
            )}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "md:hidden border-b",
              isDark 
                ? "bg-brand-black border-white/10" 
                : "bg-white border-brand-pink/20"
            )}
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block py-2 text-sm font-medium transition-colors",
                    isDark 
                      ? "text-white/80 hover:text-white" 
                      : "text-gray-600 hover:text-brand-pink"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
