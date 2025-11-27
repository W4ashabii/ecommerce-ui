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
  Megaphone,
  Upload,
  X,
  Heart,
  Star,
  Sparkles,
} from 'lucide-react';
import { settingsApi, uploadApi, HeroSlide, FloatingElement } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  const [editHeroSlide, setEditHeroSlide] = useState<HeroSlide | null>(null);
  const [heroForm, setHeroForm] = useState<Partial<HeroSlide>>({
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    isActive: true,
    order: 0,
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

  const updateAnnouncementMutation = useMutation({
    mutationFn: (announcement: { text: string; link?: string; isActive: boolean }) =>
      settingsApi.updateAnnouncement(announcement, token || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Announcement updated');
    },
    onError: () => toast.error('Failed to update announcement'),
  });

  const updateFloatingElementMutation = useMutation({
    mutationFn: async ({ id, element, newImage }: { id: string; element: Partial<FloatingElement>; newImage?: string }) => {
      if (newImage) {
        setUploading(true);
        try {
          const result = await uploadApi.uploadProductImage(newImage, token || '');
          element.image = result.url;
          element.imagePublicId = result.publicId;
        } finally {
          setUploading(false);
        }
      }
      return settingsApi.updateFloatingElement(id, element, token || '');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Floating element updated');
      setFloatingImageFile(null);
      setEditingFloatingElement(null);
    },
    onError: () => toast.error('Failed to update floating element'),
  });

  const [floatingImageFile, setFloatingImageFile] = useState<string | null>(null);
  const [editingFloatingElement, setEditingFloatingElement] = useState<string | null>(null);

  const floatingDropzone = useDropzone({
    onDrop: async (files) => {
      if (files[0]) {
        const base64 = await fileToBase64(files[0]);
        setFloatingImageFile(base64);
      }
    },
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
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

  const handleEditHero = (slide: HeroSlide) => {
    setEditHeroSlide(slide);
    setHeroForm(slide);
    setHeroDialogOpen(true);
  };

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editHeroSlide?._id) {
      updateHeroMutation.mutate({ id: editHeroSlide._id, slide: heroForm });
    } else {
      addHeroMutation.mutate(heroForm as HeroSlide);
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
          <TabsTrigger value="floating">Floating Elements</TabsTrigger>
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

        {/* Floating Elements */}
        <TabsContent value="floating" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Floating Elements
              </CardTitle>
              <CardDescription>
                Customize the floating decorative elements on the hero section. 
                You can use icons or upload transparent PNG images of products.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(settings?.floatingElements || [
                { _id: 'default-1', type: 'icon', icon: 'heart', position: 'top-right', isActive: true },
                { _id: 'default-2', type: 'icon', icon: 'star', position: 'bottom-right', isActive: true },
                { _id: 'default-3', type: 'icon', icon: 'sparkles', position: 'middle-left', isActive: true },
              ]).map((element) => (
                <div key={element._id} className="p-4 border rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {element.type === 'icon' ? (
                        <div className="w-12 h-12 rounded-full bg-brand-pink/20 flex items-center justify-center">
                          {element.icon === 'heart' && <Heart className="w-6 h-6 text-brand-pink" />}
                          {element.icon === 'star' && <Star className="w-6 h-6 text-brand-pink" />}
                          {element.icon === 'sparkles' && <Sparkles className="w-6 h-6 text-brand-pink" />}
                        </div>
                      ) : element.image ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          <img src={element.image} alt="" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium capitalize">
                          {element.position.replace('-', ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {element.type === 'icon' ? `Icon: ${element.icon}` : 'Custom Image'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Active</Label>
                        <Switch
                          checked={element.isActive}
                          onCheckedChange={(checked) => 
                            element._id && updateFloatingElementMutation.mutate({
                              id: element._id,
                              element: { isActive: checked }
                            })
                          }
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingFloatingElement(
                          editingFloatingElement === element._id ? null : element._id || null
                        )}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  {editingFloatingElement === element._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 border-t space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={element.type}
                            onValueChange={(value: 'icon' | 'image') => 
                              element._id && updateFloatingElementMutation.mutate({
                                id: element._id,
                                element: { 
                                  type: value,
                                  ...(value === 'icon' ? { icon: 'heart', image: undefined, imagePublicId: undefined } : {})
                                }
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="icon">Icon</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {element.type === 'icon' && (
                          <div className="space-y-2">
                            <Label>Icon</Label>
                            <Select
                              value={element.icon}
                              onValueChange={(value: 'heart' | 'star' | 'sparkles') => 
                                element._id && updateFloatingElementMutation.mutate({
                                  id: element._id,
                                  element: { icon: value }
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="heart">
                                  <span className="flex items-center gap-2">
                                    <Heart className="w-4 h-4" /> Heart
                                  </span>
                                </SelectItem>
                                <SelectItem value="star">
                                  <span className="flex items-center gap-2">
                                    <Star className="w-4 h-4" /> Star
                                  </span>
                                </SelectItem>
                                <SelectItem value="sparkles">
                                  <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Sparkles
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      {element.type === 'image' && (
                        <div className="space-y-2">
                          <Label>Image (PNG with transparent background recommended)</Label>
                          <div
                            {...floatingDropzone.getRootProps()}
                            className={`relative h-32 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${
                              floatingDropzone.isDragActive
                                ? 'border-brand-pink bg-brand-pink/10'
                                : 'border-border hover:border-brand-pink'
                            }`}
                          >
                            <input {...floatingDropzone.getInputProps()} />
                            {floatingImageFile || element.image ? (
                              <>
                                <img
                                  src={floatingImageFile || element.image}
                                  alt=""
                                  className="h-full object-contain"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (floatingImageFile) {
                                      // Just clear the local preview
                                      setFloatingImageFile(null);
                                    } else if (element.image && element._id) {
                                      // Delete from database - switch back to icon
                                      updateFloatingElementMutation.mutate({
                                        id: element._id,
                                        element: { 
                                          type: 'icon', 
                                          icon: 'heart',
                                          image: undefined,
                                          imagePublicId: undefined
                                        }
                                      });
                                    }
                                  }}
                                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                  title="Remove image"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <div className="text-center">
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Upload transparent PNG image
                                </p>
                              </div>
                            )}
                          </div>
                          {floatingImageFile && (
                            <Button
                              onClick={() => element._id && updateFloatingElementMutation.mutate({
                                id: element._id,
                                element: {},
                                newImage: floatingImageFile
                              })}
                              disabled={updateFloatingElementMutation.isPending || uploading}
                              className="w-full"
                            >
                              {uploading ? 'Uploading...' : 'Save Image'}
                            </Button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
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
    </div>
  );
}

