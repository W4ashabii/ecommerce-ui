'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import {
  Plus,
  Image as ImageIcon,
  Trash2,
  Edit,
  LayoutTemplate,
  Megaphone,
  Upload,
  X,
  GripVertical,
} from 'lucide-react';
import { settingsApi, uploadApi, HeroSlide, Banner } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fileToBase64 } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminContentPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('hero');
  const [heroDialogOpen, setHeroDialogOpen] = useState(false);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [editHeroSlide, setEditHeroSlide] = useState<HeroSlide | null>(null);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [heroForm, setHeroForm] = useState<Partial<HeroSlide>>({
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    isActive: true,
    order: 0,
  });
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    position: 'middle',
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  const addHeroMutation = useMutation({
    mutationFn: async (slide: HeroSlide) => {
      if (imageFile) {
        setUploading(true);
        try {
          const result = await uploadApi.uploadHeroImage(
            imageFile,
            token || ''
          );
          slide.image = result.url;
          slide.imagePublicId = result.publicId;
        } finally {
          setUploading(false);
        }
      }
      return settingsApi.addHeroSlide(slide, token || '');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Hero slide added');
      resetHeroForm();
    },
    onError: () => toast.error('Failed to add hero slide'),
  });

  const updateHeroMutation = useMutation({
    mutationFn: async ({ id, slide }: { id: string; slide: Partial<HeroSlide> }) => {
      if (imageFile) {
        setUploading(true);
        try {
          const result = await uploadApi.uploadHeroImage(
            imageFile,
            token || ''
          );
          slide.image = result.url;
          slide.imagePublicId = result.publicId;
        } finally {
          setUploading(false);
        }
      }
      return settingsApi.updateHeroSlide(id, slide, token || '');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Hero slide updated');
      resetHeroForm();
    },
    onError: () => toast.error('Failed to update hero slide'),
  });

  const removeHeroMutation = useMutation({
    mutationFn: (id: string) =>
      settingsApi.removeHeroSlide(id, token || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Hero slide removed');
    },
    onError: () => toast.error('Failed to remove hero slide'),
  });

  const addBannerMutation = useMutation({
    mutationFn: async (banner: Banner) => {
      if (imageFile) {
        setUploading(true);
        try {
          const result = await uploadApi.uploadBannerImage(
            imageFile,
            token || ''
          );
          banner.image = result.url;
          banner.imagePublicId = result.publicId;
        } finally {
          setUploading(false);
        }
      }
      return settingsApi.addBanner(banner, token || '');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Banner added');
      resetBannerForm();
    },
    onError: () => toast.error('Failed to add banner'),
  });

  const updateBannerMutation = useMutation({
    mutationFn: async ({ id, banner }: { id: string; banner: Partial<Banner> }) => {
      if (imageFile) {
        setUploading(true);
        try {
          const result = await uploadApi.uploadBannerImage(
            imageFile,
            token || ''
          );
          banner.image = result.url;
          banner.imagePublicId = result.publicId;
        } finally {
          setUploading(false);
        }
      }
      return settingsApi.updateBanner(id, banner, token || '');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Banner updated');
      resetBannerForm();
    },
    onError: () => toast.error('Failed to update banner'),
  });

  const removeBannerMutation = useMutation({
    mutationFn: (id: string) =>
      settingsApi.removeBanner(id, token || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Banner removed');
    },
    onError: () => toast.error('Failed to remove banner'),
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: (announcement: { text: string; link?: string; isActive: boolean }) =>
      settingsApi.updateAnnouncement(announcement, token || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Announcement updated');
    },
    onError: () => toast.error('Failed to update announcement'),
  });

  const resetHeroForm = () => {
    setHeroForm({
      title: '',
      subtitle: '',
      buttonText: '',
      buttonLink: '',
      isActive: true,
      order: 0,
    });
    setImageFile(null);
    setEditHeroSlide(null);
    setHeroDialogOpen(false);
  };

  const resetBannerForm = () => {
    setBannerForm({
      title: '',
      subtitle: '',
      buttonText: '',
      buttonLink: '',
      position: 'middle',
      isActive: true,
    });
    setImageFile(null);
    setEditBanner(null);
    setBannerDialogOpen(false);
  };

  const handleEditHero = (slide: HeroSlide) => {
    setEditHeroSlide(slide);
    setHeroForm(slide);
    setHeroDialogOpen(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditBanner(banner);
    setBannerForm(banner);
    setBannerDialogOpen(true);
  };

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editHeroSlide?._id) {
      updateHeroMutation.mutate({ id: editHeroSlide._id, slide: heroForm });
    } else {
      addHeroMutation.mutate(heroForm as HeroSlide);
    }
  };

  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editBanner?._id) {
      updateBannerMutation.mutate({ id: editBanner._id, banner: bannerForm });
    } else {
      addBannerMutation.mutate(bannerForm as Banner);
    }
  };

  const heroDropzone = useDropzone({
    onDrop: async (files) => {
      if (files[0]) {
        const base64 = await fileToBase64(files[0]);
        setImageFile(base64);
      }
    },
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
  });

  const bannerDropzone = useDropzone({
    onDrop: async (files) => {
      if (files[0]) {
        const base64 = await fileToBase64(files[0]);
        setImageFile(base64);
      }
    },
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">
          Manage hero slides, banners, and announcements
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="hero">Hero Slides</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="announcement">Announcement</TabsTrigger>
        </TabsList>

        {/* Hero Slides */}
        <TabsContent value="hero" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Hero Slides</h2>
            <Button onClick={() => setHeroDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Slide
            </Button>
          </div>

          <div className="grid gap-4">
            {settings?.heroSlides?.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hero slides yet</p>
                </CardContent>
              </Card>
            ) : (
              settings?.heroSlides?.map((slide) => (
                <motion.div
                  key={slide._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 p-4 bg-card rounded-xl border"
                >
                  <div className="w-40 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                    {slide.image && (
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{slide.title}</h3>
                      {!slide.isActive && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    {slide.subtitle && (
                      <p className="text-sm text-muted-foreground">
                        {slide.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditHero(slide)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => slide._id && removeHeroMutation.mutate(slide._id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Banners */}
        <TabsContent value="banners" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Promotional Banners</h2>
            <Button onClick={() => setBannerDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Banner
            </Button>
          </div>

          <div className="grid gap-4">
            {settings?.banners?.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <LayoutTemplate className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No banners yet</p>
                </CardContent>
              </Card>
            ) : (
              settings?.banners?.map((banner) => (
                <motion.div
                  key={banner._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 p-4 bg-card rounded-xl border"
                >
                  <div className="w-32 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    {banner.image && (
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{banner.title}</h3>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded capitalize">
                        {banner.position}
                      </span>
                      {!banner.isActive && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    {banner.subtitle && (
                      <p className="text-sm text-muted-foreground">
                        {banner.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditBanner(banner)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        banner._id && removeBannerMutation.mutate(banner._id)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Announcement */}
        <TabsContent value="announcement" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Announcement Bar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={settings?.announcementBar?.isActive || false}
                  onCheckedChange={(checked) =>
                    updateAnnouncementMutation.mutate({
                      text: settings?.announcementBar?.text || '',
                      link: settings?.announcementBar?.link,
                      isActive: checked,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Input
                  defaultValue={settings?.announcementBar?.text || ''}
                  onBlur={(e) =>
                    updateAnnouncementMutation.mutate({
                      text: e.target.value,
                      link: settings?.announcementBar?.link,
                      isActive: settings?.announcementBar?.isActive || false,
                    })
                  }
                  placeholder="e.g., Free shipping on orders over NPR 10,000!"
                />
              </div>
              <div className="space-y-2">
                <Label>Link (optional)</Label>
                <Input
                  defaultValue={settings?.announcementBar?.link || ''}
                  onBlur={(e) =>
                    updateAnnouncementMutation.mutate({
                      text: settings?.announcementBar?.text || '',
                      link: e.target.value || undefined,
                      isActive: settings?.announcementBar?.isActive || false,
                    })
                  }
                  placeholder="/shop"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hero Slide Dialog */}
      <Dialog open={heroDialogOpen} onOpenChange={(open) => !open && resetHeroForm()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editHeroSlide ? 'Edit Hero Slide' : 'Add Hero Slide'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleHeroSubmit} className="space-y-4">
            <div
              {...heroDropzone.getRootProps()}
              className={`relative h-40 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${
                heroDropzone.isDragActive
                  ? 'border-brand-pink bg-brand-pink/10'
                  : 'border-border hover:border-brand-pink'
              }`}
            >
              <input {...heroDropzone.getInputProps()} />
              {imageFile || heroForm.image ? (
                <>
                  <img
                    src={imageFile || heroForm.image}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFile(null);
                      setHeroForm((p) => ({ ...p, image: undefined }));
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Upload hero image (1920x1080 recommended)
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={heroForm.title || ''}
                onChange={(e) =>
                  setHeroForm((p) => ({ ...p, title: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={heroForm.subtitle || ''}
                onChange={(e) =>
                  setHeroForm((p) => ({ ...p, subtitle: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input
                  value={heroForm.buttonText || ''}
                  onChange={(e) =>
                    setHeroForm((p) => ({ ...p, buttonText: e.target.value }))
                  }
                  placeholder="Shop Now"
                />
              </div>
              <div className="space-y-2">
                <Label>Button Link</Label>
                <Input
                  value={heroForm.buttonLink || ''}
                  onChange={(e) =>
                    setHeroForm((p) => ({ ...p, buttonLink: e.target.value }))
                  }
                  placeholder="/shop"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={heroForm.isActive}
                onCheckedChange={(checked) =>
                  setHeroForm((p) => ({ ...p, isActive: checked }))
                }
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetHeroForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  addHeroMutation.isPending ||
                  updateHeroMutation.isPending ||
                  uploading
                }
              >
                {uploading ? 'Uploading...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Banner Dialog */}
      <Dialog open={bannerDialogOpen} onOpenChange={(open) => !open && resetBannerForm()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editBanner ? 'Edit Banner' : 'Add Banner'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleBannerSubmit} className="space-y-4">
            <div
              {...bannerDropzone.getRootProps()}
              className={`relative h-32 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${
                bannerDropzone.isDragActive
                  ? 'border-brand-pink bg-brand-pink/10'
                  : 'border-border hover:border-brand-pink'
              }`}
            >
              <input {...bannerDropzone.getInputProps()} />
              {imageFile || bannerForm.image ? (
                <>
                  <img
                    src={imageFile || bannerForm.image}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFile(null);
                      setBannerForm((p) => ({ ...p, image: undefined }));
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload banner image</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={bannerForm.title || ''}
                onChange={(e) =>
                  setBannerForm((p) => ({ ...p, title: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={bannerForm.subtitle || ''}
                onChange={(e) =>
                  setBannerForm((p) => ({ ...p, subtitle: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={bannerForm.position || 'middle'}
                onValueChange={(value) =>
                  setBannerForm((p) => ({
                    ...p,
                    position: value as 'top' | 'middle' | 'bottom',
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="middle">Middle</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input
                  value={bannerForm.buttonText || ''}
                  onChange={(e) =>
                    setBannerForm((p) => ({ ...p, buttonText: e.target.value }))
                  }
                  placeholder="Shop Now"
                />
              </div>
              <div className="space-y-2">
                <Label>Button Link</Label>
                <Input
                  value={bannerForm.buttonLink || ''}
                  onChange={(e) =>
                    setBannerForm((p) => ({ ...p, buttonLink: e.target.value }))
                  }
                  placeholder="/shop"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={bannerForm.isActive}
                onCheckedChange={(checked) =>
                  setBannerForm((p) => ({ ...p, isActive: checked }))
                }
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetBannerForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  addBannerMutation.isPending ||
                  updateBannerMutation.isPending ||
                  uploading
                }
              >
                {uploading ? 'Uploading...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

