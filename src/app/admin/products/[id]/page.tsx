'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Box,
} from 'lucide-react';
import { productsApi, categoriesApi, uploadApi, ProductInput, ColorVariant } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fileToBase64 } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size'];

export default function ProductFormPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const isNew = params.id === 'new';
  const productId = isNew ? null : (params.id as string);

  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    description: '',
    price: 0,
    category: '',
    colorVariants: [],
    sizes: [],
    featured: false,
    isNewArrival: false,
    isBestSeller: false,
    isActive: true,
    tags: [],
  });

  const [uploading, setUploading] = useState(false);
  const [uploadingModel, setUploadingModel] = useState(false);

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getById(productId!),
    enabled: !!productId,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(true),
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        category: product.category._id,
        colorVariants: product.colorVariants,
        sizes: product.sizes,
        modelUrl: product.modelUrl,
        modelPublicId: product.modelPublicId,
        featured: product.featured,
        isNewArrival: product.isNewArrival,
        isBestSeller: product.isBestSeller,
        isActive: product.isActive,
        tags: product.tags,
      });
    }
  }, [product]);

  const createMutation = useMutation({
    mutationFn: (data: ProductInput) =>
      productsApi.create(data, token || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product created successfully');
      router.push('/admin/products');
    },
    onError: () => {
      toast.error('Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ProductInput>) =>
      productsApi.update(productId!, data, token || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      toast.success('Product updated successfully');
    },
    onError: () => {
      toast.error('Failed to update product');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  };

  const handleImageUpload = async (files: File[], variantIndex: number) => {
    setUploading(true);
    try {
      const base64Images = await Promise.all(files.map(fileToBase64));
      const results = await uploadApi.uploadProductImages(
        base64Images,
        token || ''
      );

      const newVariants = [...(formData.colorVariants || [])];
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        images: [...newVariants[variantIndex].images, ...results.map((r) => r.url)],
      };

      setFormData((prev) => ({ ...prev, colorVariants: newVariants }));
      toast.success('Images uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleModelUpload = async (file: File) => {
    setUploadingModel(true);
    try {
      const base64 = await fileToBase64(file);
      const result = await uploadApi.uploadModel(
        base64,
        token || ''
      );

      setFormData((prev) => ({
        ...prev,
        modelUrl: result.url,
        modelPublicId: result.publicId,
      }));
      toast.success('3D model uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload 3D model');
    } finally {
      setUploadingModel(false);
    }
  };

  const addColorVariant = () => {
    setFormData((prev) => ({
      ...prev,
      colorVariants: [
        ...(prev.colorVariants || []),
        { name: '', hex: '#000000', images: [], stock: 0 },
      ],
    }));
  };

  const removeColorVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants?.filter((_, i) => i !== index),
    }));
  };

  const updateColorVariant = (index: number, field: keyof ColorVariant, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants?.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const removeImage = (variantIndex: number, imageIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants?.map((v, i) =>
        i === variantIndex
          ? { ...v, images: v.images.filter((_, imgI) => imgI !== imageIndex) }
          : v
      ),
    }));
  };

  const toggleSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes?.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...(prev.sizes || []), size],
    }));
  };

  if (!isNew && loadingProduct) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isNew ? 'Add Product' : 'Edit Product'}
          </h1>
          <p className="text-muted-foreground">
            {isNew ? 'Create a new product' : `Editing: ${product?.name}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                required
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.salePrice || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      salePrice: parseFloat(e.target.value) || undefined,
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sizes */}
        <Card>
          <CardHeader>
            <CardTitle>Sizes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                    formData.sizes?.includes(size)
                      ? 'border-brand-pink bg-brand-pink/10 text-brand-pink'
                      : 'border-border hover:border-brand-pink'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Color Variants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Color Variants</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addColorVariant}>
              <Plus className="mr-2 h-4 w-4" />
              Add Color
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.colorVariants?.map((variant, variantIndex) => (
              <div
                key={variantIndex}
                className="p-4 border rounded-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: variant.hex }}
                    />
                    <span className="font-medium">
                      {variant.name || 'Unnamed Color'}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeColorVariant(variantIndex)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Color Name</Label>
                    <Input
                      value={variant.name}
                      onChange={(e) =>
                        updateColorVariant(variantIndex, 'name', e.target.value)
                      }
                      placeholder="e.g., Midnight Black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color Hex</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={variant.hex}
                        onChange={(e) =>
                          updateColorVariant(variantIndex, 'hex', e.target.value)
                        }
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={variant.hex}
                        onChange={(e) =>
                          updateColorVariant(variantIndex, 'hex', e.target.value)
                        }
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) =>
                        updateColorVariant(
                          variantIndex,
                          'stock',
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <Label>Images</Label>
                  <div className="flex flex-wrap gap-3">
                    {variant.images.map((image, imageIndex) => (
                      <div
                        key={imageIndex}
                        className="relative w-24 h-24 rounded-lg overflow-hidden group"
                      >
                        <img
                          src={image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(variantIndex, imageIndex)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <ImageDropzone
                      onDrop={(files) => handleImageUpload(files, variantIndex)}
                      uploading={uploading}
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.colorVariants?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No color variants added yet</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={addColorVariant}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Color
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3D Model */}
        <Card>
          <CardHeader>
            <CardTitle>3D Model</CardTitle>
          </CardHeader>
          <CardContent>
            {formData.modelUrl ? (
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Box className="h-10 w-10 text-brand-pink" />
                <div className="flex-1">
                  <p className="font-medium">3D Model Uploaded</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {formData.modelUrl}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      modelUrl: undefined,
                      modelPublicId: undefined,
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <ModelDropzone onDrop={handleModelUpload} uploading={uploadingModel} />
            )}
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Visibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Active</p>
                <p className="text-sm text-muted-foreground">
                  Product is visible on the store
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Featured</p>
                <p className="text-sm text-muted-foreground">
                  Show in featured section
                </p>
              </div>
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, featured: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Arrival</p>
                <p className="text-sm text-muted-foreground">
                  Show &quot;New&quot; badge
                </p>
              </div>
              <Switch
                checked={formData.isNewArrival}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isNewArrival: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Best Seller</p>
                <p className="text-sm text-muted-foreground">
                  Show in best sellers section
                </p>
              </div>
              <Switch
                checked={formData.isBestSeller}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isBestSeller: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : isNew
              ? 'Create Product'
              : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ImageDropzone({
  onDrop,
  uploading,
}: {
  onDrop: (files: File[]) => void;
  uploading: boolean;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-brand-pink bg-brand-pink/10'
          : 'border-border hover:border-brand-pink'
      } ${uploading ? 'opacity-50 cursor-wait' : ''}`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="w-6 h-6 border-2 border-brand-pink/20 border-t-brand-pink rounded-full animate-spin" />
      ) : (
        <Upload className="h-6 w-6 text-muted-foreground" />
      )}
    </div>
  );
}

function ModelDropzone({
  onDrop,
  uploading,
}: {
  onDrop: (file: File) => void;
  uploading: boolean;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && onDrop(files[0]),
    accept: { 'model/gltf-binary': ['.glb'], 'model/gltf+json': ['.gltf'] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`p-8 rounded-lg border-2 border-dashed text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-brand-pink bg-brand-pink/10'
          : 'border-border hover:border-brand-pink'
      } ${uploading ? 'opacity-50 cursor-wait' : ''}`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-brand-pink/20 border-t-brand-pink rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      ) : (
        <>
          <Box className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? 'Drop the 3D model here'
              : 'Drag & drop a 3D model (.glb, .gltf)'}
          </p>
        </>
      )}
    </div>
  );
}

