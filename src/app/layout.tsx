import type { Metadata } from 'next';
import { Outfit, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'sonner';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AMI | Elegant Fashion',
  description: 'Discover the finest collection of elegant fashion pieces. Premium quality, modern designs.',
  keywords: ['fashion', 'clothing', 'elegant', 'luxury', 'women', 'boutique'],
};

// Fetch theme server-side to prevent flash
async function getWebsiteTheme(): Promise<string> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${API_URL}/settings`, {
      next: { revalidate: 30 }, // Revalidate every 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const settings = await response.json();
      return settings?.websiteTheme || 'floral';
    }
  } catch (error: any) {
    // Silently handle connection errors during build time
    // These are expected when the API server isn't running during build
    const isConnectionError = 
      error?.code === 'ECONNREFUSED' || 
      error?.cause?.code === 'ECONNREFUSED' ||
      error?.message?.includes('ECONNREFUSED') ||
      error?.message?.includes('fetch failed');
    
    if (!isConnectionError) {
      console.error('Failed to fetch theme server-side:', error);
    }
  }
  
  return 'floral'; // Default fallback
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch theme server-side to apply immediately
  const websiteTheme = await getWebsiteTheme();
  
  return (
    <html lang="en" suppressHydrationWarning className={websiteTheme}>
      <body className={`${outfit.variable} ${playfair.variable} font-sans antialiased`}>
        <Providers initialTheme={websiteTheme}>
          {children}
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

