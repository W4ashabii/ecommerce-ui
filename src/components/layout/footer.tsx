import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const footerLinks = {
  shop: [
    { href: '/shop', label: 'All Products' },
    { href: '/shop?filter=new', label: 'New Arrivals' },
    { href: '/shop?filter=bestsellers', label: 'Best Sellers' },
    { href: '/collections', label: 'Collections' },
  ],
  support: [
    { href: '/track-order', label: 'Track Order' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/faq', label: 'FAQ' },
    { href: '/shipping', label: 'Shipping Info' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/careers', label: 'Careers' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-brand-black text-white mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="font-display text-3xl font-bold text-brand-pink">
                AMI
              </span>
            </Link>
            <p className="mt-4 text-gray-400 max-w-sm">
              Discover the finest collection of elegant fashion pieces. 
              Premium quality meets modern design for the sophisticated woman.
            </p>
            <div className="flex gap-4 mt-6">
              <a 
                href="#" 
                className="p-2 rounded-lg bg-white/10 hover:bg-brand-pink transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg bg-white/10 hover:bg-brand-pink transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg bg-white/10 hover:bg-brand-pink transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-brand-pink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-brand-pink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-brand-pink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} AMI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <img src="/visa.svg" alt="Visa" className="h-6 opacity-50" />
            <img src="/mastercard.svg" alt="Mastercard" className="h-6 opacity-50" />
            <img src="/amex.svg" alt="Amex" className="h-6 opacity-50" />
          </div>
        </div>
      </div>
    </footer>
  );
}

