'use client';

import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Palette,
  Sun,
  Snowflake,
  CloudRain,
  Flower2,
  Check,
  Crown,
  Circle,
} from 'lucide-react';
import { settingsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type WebsiteTheme = 'floral' | 'summer' | 'winter' | 'monsoon' | 'classy' | 'monochrome';

const themes: {
  id: WebsiteTheme;
  name: string;
  description: string;
  icon: React.ReactNode;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  preview: {
    light: string;
    dark: string;
  };
}[] = [
  {
    id: 'floral',
    name: 'Floral',
    description: 'Elegant pink tones with a romantic, feminine feel',
    icon: <Flower2 className="w-6 h-6" />,
    colors: {
      primary: '#D5006D',
      secondary: '#FF69B4',
      accent: '#FFC0CB',
    },
    preview: {
      light: 'from-pink-100 via-rose-50 to-pink-100',
      dark: 'from-pink-950 via-rose-900 to-pink-950',
    },
  },
  {
    id: 'summer',
    name: 'Summer',
    description: 'Warm orange and golden tones, sunny vibes',
    icon: <Sun className="w-6 h-6" />,
    colors: {
      primary: '#F97316',
      secondary: '#FBBF24',
      accent: '#FED7AA',
    },
    preview: {
      light: 'from-orange-100 via-amber-50 to-yellow-100',
      dark: 'from-orange-950 via-amber-900 to-yellow-950',
    },
  },
  {
    id: 'winter',
    name: 'Winter',
    description: 'Cool blue and icy tones, snowy atmosphere',
    icon: <Snowflake className="w-6 h-6" />,
    colors: {
      primary: '#0EA5E9',
      secondary: '#38BDF8',
      accent: '#E0F2FE',
    },
    preview: {
      light: 'from-sky-100 via-blue-50 to-cyan-100',
      dark: 'from-sky-950 via-blue-900 to-cyan-950',
    },
  },
  {
    id: 'monsoon',
    name: 'Monsoon',
    description: 'Moody grays and teals, with rain effects',
    icon: <CloudRain className="w-6 h-6" />,
    colors: {
      primary: '#14B8A6',
      secondary: '#5EEAD4',
      accent: '#99F6E4',
    },
    preview: {
      light: 'from-slate-200 via-teal-50 to-gray-200',
      dark: 'from-slate-900 via-teal-950 to-gray-900',
    },
  },
  {
    id: 'classy',
    name: 'Classy',
    description: 'Old money elegance with brown and beige tones',
    icon: <Crown className="w-6 h-6" />,
    colors: {
      primary: '#8B6F5C',
      secondary: '#A0826D',
      accent: '#D4C4B0',
    },
    preview: {
      light: 'from-amber-50 via-stone-100 to-orange-50',
      dark: 'from-stone-900 via-amber-950 to-stone-950',
    },
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Timeless black and white minimalist aesthetic',
    icon: <Circle className="w-6 h-6" />,
    colors: {
      primary: '#1A1A1A',
      secondary: '#4A4A4A',
      accent: '#E5E5E5',
    },
    preview: {
      light: 'from-gray-100 via-white to-gray-100',
      dark: 'from-gray-950 via-black to-gray-950',
    },
  },
];

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  const updateThemeMutation = useMutation({
    mutationFn: (theme: WebsiteTheme) => settingsApi.updateWebsiteTheme(theme),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Website theme updated! All users will see the new theme.');
    },
    onError: () => toast.error('Failed to update theme'),
  });

  const currentTheme = settings?.websiteTheme || 'floral';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="w-6 h-6" />
          Website Settings
        </h1>
        <p className="text-muted-foreground">
          Configure global settings that affect all users
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Website Theme</CardTitle>
          <CardDescription>
            Choose a seasonal theme for your entire website. This will change the color scheme for all visitors.
            Each theme has both light and dark mode variants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {themes.map((theme) => {
              const isSelected = currentTheme === theme.id;
              
              return (
                <motion.div
                  key={theme.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => updateThemeMutation.mutate(theme.id)}
                    disabled={updateThemeMutation.isPending}
                    className={cn(
                      "w-full text-left rounded-xl border-2 overflow-hidden transition-all",
                      isSelected 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {/* Preview */}
                    <div className="relative h-32 overflow-hidden">
                      {/* Light mode preview */}
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br",
                        theme.preview.light
                      )}>
                        <div className="absolute top-4 left-4 flex gap-2">
                          {Object.values(theme.colors).map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full shadow-md"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="absolute bottom-4 left-4 text-xs font-medium text-gray-600">
                          Light Mode
                        </div>
                      </div>
                      
                      {/* Dark mode preview (right half) */}
                      <div className={cn(
                        "absolute inset-y-0 right-0 w-1/2 bg-gradient-to-br",
                        theme.preview.dark
                      )}>
                        <div className="absolute bottom-4 right-4 text-xs font-medium text-gray-300">
                          Dark Mode
                        </div>
                      </div>

                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                      
                      {/* Theme icon */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center shadow-lg"
                        style={{ color: theme.colors.primary }}
                      >
                        {theme.icon}
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="p-4 bg-card">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-lg">{theme.name}</h3>
                        {isSelected && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {theme.description}
                      </p>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Theme Effects Info */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Effects</CardTitle>
          <CardDescription>
            Special effects included with each theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800">
              <Flower2 className="w-8 h-8 text-pink-500 mb-2" />
              <h4 className="font-medium">Floral</h4>
              <p className="text-sm text-muted-foreground">Elegant gradients and soft glows</p>
            </div>
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
              <Sun className="w-8 h-8 text-orange-500 mb-2" />
              <h4 className="font-medium">Summer</h4>
              <p className="text-sm text-muted-foreground">Warm sunshine effects and golden accents</p>
            </div>
            <div className="p-4 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800">
              <Snowflake className="w-8 h-8 text-sky-500 mb-2" />
              <h4 className="font-medium">Winter</h4>
              <p className="text-sm text-muted-foreground">Frosted effects and cool tones</p>
            </div>
            <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800">
              <CloudRain className="w-8 h-8 text-teal-500 mb-2" />
              <h4 className="font-medium">Monsoon</h4>
              <p className="text-sm text-muted-foreground">Rain animation and moody atmosphere</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <Crown className="w-8 h-8 text-amber-700 mb-2" />
              <h4 className="font-medium">Classy</h4>
              <p className="text-sm text-muted-foreground">Old money sophistication with warm earth tones</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700">
              <Circle className="w-8 h-8 text-gray-700 dark:text-gray-300 mb-2" />
              <h4 className="font-medium">Monochrome</h4>
              <p className="text-sm text-muted-foreground">Pure black and white minimalist design</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

