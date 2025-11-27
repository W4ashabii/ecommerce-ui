'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon,
  FileText,
  Users,
  Sparkles,
  Heart,
  Star
} from 'lucide-react';
import { settingsApi, categoriesApi, uploadApi, Settings, TeamMember } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { fileToBase64 } from '@/lib/utils';

export default function AdminPagesPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('about');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const [aboutForm, setAboutForm] = useState({
    title: '',
    subtitle: '',
    heroImage: '',
    storyTitle: '',
    storyContent: '',
    missionTitle: '',
    missionContent: '',
    valuesTitle: '',
    valuesItems: [''],
    teamTitle: '',
    teamSubtitle: '',
    teamMembers: [] as TeamMember[],
  });

  const [collectionsForm, setCollectionsForm] = useState({
    title: '',
    subtitle: '',
    heroImage: '',
    featuredCollectionIds: [] as string[],
  });

  // Initialize forms when settings load
  useState(() => {
    if (settings?.aboutPage) {
      const ap = settings.aboutPage;
      setAboutForm({
        title: ap.title || 'About Us',
        subtitle: ap.subtitle || 'Our Story',
        heroImage: ap.heroImage || '',
        storyTitle: ap.story?.title || 'Our Story',
        storyContent: ap.story?.content || '',
        missionTitle: ap.mission?.title || 'Our Mission',
        missionContent: ap.mission?.content || '',
        valuesTitle: ap.values?.title || 'Our Values',
        valuesItems: ap.values?.items?.length ? ap.values.items : [''],
        teamTitle: ap.team?.title || 'Meet Our Team',
        teamSubtitle: ap.team?.subtitle || '',
        teamMembers: ap.team?.members || [],
      });
    }
    if (settings?.collectionsPage) {
      const cp = settings.collectionsPage;
      setCollectionsForm({
        title: cp.title || 'Collections',
        subtitle: cp.subtitle || '',
        heroImage: cp.heroImage || '',
        featuredCollectionIds: cp.featuredCollectionIds || [],
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Settings>) => settingsApi.update(data, token || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Page content updated successfully');
    },
    onError: () => {
      toast.error('Failed to update page content');
    },
  });

  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      const result = await uploadApi.uploadHeroImage(base64, token || '');
      setAboutForm(prev => ({ ...prev, heroImage: result.url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    }
  };

  const handleCollectionsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      const result = await uploadApi.uploadHeroImage(base64, token || '');
      setCollectionsForm(prev => ({ ...prev, heroImage: result.url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    }
  };

  const handleTeamMemberImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      const result = await uploadApi.uploadHeroImage(base64, token || '');
      const newMembers = [...aboutForm.teamMembers];
      newMembers[index] = { ...newMembers[index], image: result.url };
      setAboutForm(prev => ({ ...prev, teamMembers: newMembers }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    }
  };

  const saveAboutPage = () => {
    updateMutation.mutate({
      aboutPage: {
        title: aboutForm.title,
        subtitle: aboutForm.subtitle,
        heroImage: aboutForm.heroImage,
        story: {
          title: aboutForm.storyTitle,
          content: aboutForm.storyContent,
        },
        mission: {
          title: aboutForm.missionTitle,
          content: aboutForm.missionContent,
        },
        values: {
          title: aboutForm.valuesTitle,
          items: aboutForm.valuesItems.filter(v => v.trim()),
        },
        team: {
          title: aboutForm.teamTitle,
          subtitle: aboutForm.teamSubtitle,
          members: aboutForm.teamMembers,
        },
      },
    });
  };

  const saveCollectionsPage = () => {
    updateMutation.mutate({
      collectionsPage: {
        title: collectionsForm.title,
        subtitle: collectionsForm.subtitle,
        heroImage: collectionsForm.heroImage,
        featuredCollectionIds: collectionsForm.featuredCollectionIds,
      },
    });
  };

  const addValueItem = () => {
    setAboutForm(prev => ({ ...prev, valuesItems: [...prev.valuesItems, ''] }));
  };

  const removeValueItem = (index: number) => {
    setAboutForm(prev => ({
      ...prev,
      valuesItems: prev.valuesItems.filter((_, i) => i !== index),
    }));
  };

  const updateValueItem = (index: number, value: string) => {
    const newItems = [...aboutForm.valuesItems];
    newItems[index] = value;
    setAboutForm(prev => ({ ...prev, valuesItems: newItems }));
  };

  const addTeamMember = () => {
    setAboutForm(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { name: '', role: '' }],
    }));
  };

  const removeTeamMember = (index: number) => {
    setAboutForm(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...aboutForm.teamMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setAboutForm(prev => ({ ...prev, teamMembers: newMembers }));
  };

  const toggleFeaturedCollection = (id: string) => {
    setCollectionsForm(prev => ({
      ...prev,
      featuredCollectionIds: prev.featuredCollectionIds.includes(id)
        ? prev.featuredCollectionIds.filter(cid => cid !== id)
        : [...prev.featuredCollectionIds, id],
    }));
  };

  // Update forms when settings change
  if (settings && !aboutForm.title && settings.aboutPage?.title) {
    const ap = settings.aboutPage;
    setAboutForm({
      title: ap.title || 'About Us',
      subtitle: ap.subtitle || 'Our Story',
      heroImage: ap.heroImage || '',
      storyTitle: ap.story?.title || 'Our Story',
      storyContent: ap.story?.content || '',
      missionTitle: ap.mission?.title || 'Our Mission',
      missionContent: ap.mission?.content || '',
      valuesTitle: ap.values?.title || 'Our Values',
      valuesItems: ap.values?.items?.length ? ap.values.items : [''],
      teamTitle: ap.team?.title || 'Meet Our Team',
      teamSubtitle: ap.team?.subtitle || '',
      teamMembers: ap.team?.members || [],
    });
  }

  if (settings && !collectionsForm.title && settings.collectionsPage?.title) {
    const cp = settings.collectionsPage;
    setCollectionsForm({
      title: cp.title || 'Collections',
      subtitle: cp.subtitle || '',
      heroImage: cp.heroImage || '',
      featuredCollectionIds: cp.featuredCollectionIds || [],
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Page Content</h1>
        <p className="text-muted-foreground">
          Manage content for About and Collections pages
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            About Page
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Collections Page
          </TabsTrigger>
        </TabsList>

        {/* About Page Tab */}
        <TabsContent value="about" className="space-y-6">
          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Hero Section
              </CardTitle>
              <CardDescription>
                Configure the hero banner for the About page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={aboutForm.title}
                    onChange={(e) => setAboutForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="About Us"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={aboutForm.subtitle}
                    onChange={(e) => setAboutForm(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Our Story"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Hero Image</Label>
                <div className="flex items-center gap-4">
                  {aboutForm.heroImage && (
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-muted">
                      <img src={aboutForm.heroImage} alt="Hero" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAboutImageUpload}
                    />
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Story Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Story Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={aboutForm.storyTitle}
                  onChange={(e) => setAboutForm(prev => ({ ...prev, storyTitle: e.target.value }))}
                  placeholder="Our Story"
                />
              </div>
              <div className="space-y-2">
                <Label>Story Content</Label>
                <Textarea
                  value={aboutForm.storyContent}
                  onChange={(e) => setAboutForm(prev => ({ ...prev, storyContent: e.target.value }))}
                  placeholder="Tell your brand story..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Mission Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Mission Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={aboutForm.missionTitle}
                  onChange={(e) => setAboutForm(prev => ({ ...prev, missionTitle: e.target.value }))}
                  placeholder="Our Mission"
                />
              </div>
              <div className="space-y-2">
                <Label>Mission Statement</Label>
                <Textarea
                  value={aboutForm.missionContent}
                  onChange={(e) => setAboutForm(prev => ({ ...prev, missionContent: e.target.value }))}
                  placeholder="Describe your mission..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Values Section */}
          <Card>
            <CardHeader>
              <CardTitle>Values</CardTitle>
              <CardDescription>Add your brand values</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={aboutForm.valuesTitle}
                  onChange={(e) => setAboutForm(prev => ({ ...prev, valuesTitle: e.target.value }))}
                  placeholder="Our Values"
                />
              </div>
              
              <div className="space-y-3">
                <Label>Values List</Label>
                {aboutForm.valuesItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateValueItem(index, e.target.value)}
                      placeholder="Enter a value..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeValueItem(index)}
                      disabled={aboutForm.valuesItems.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addValueItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Value
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Section
              </CardTitle>
              <CardDescription>Add team members to display on the About page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={aboutForm.teamTitle}
                    onChange={(e) => setAboutForm(prev => ({ ...prev, teamTitle: e.target.value }))}
                    placeholder="Meet Our Team"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Section Subtitle</Label>
                  <Input
                    value={aboutForm.teamSubtitle}
                    onChange={(e) => setAboutForm(prev => ({ ...prev, teamSubtitle: e.target.value }))}
                    placeholder="The people behind the brand"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Team Members</Label>
                {aboutForm.teamMembers.map((member, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Member {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTeamMember(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={member.name}
                          onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Input
                          value={member.role}
                          onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                          placeholder="Founder & CEO"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Photo</Label>
                      <div className="flex items-center gap-4">
                        {member.image && (
                          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted">
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleTeamMemberImageUpload(e, index)}
                          />
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addTeamMember}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team Member
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveAboutPage} disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? 'Saving...' : 'Save About Page'}
            </Button>
          </div>
        </TabsContent>

        {/* Collections Page Tab */}
        <TabsContent value="collections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Hero Section
              </CardTitle>
              <CardDescription>
                Configure the hero banner for the Collections page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={collectionsForm.title}
                    onChange={(e) => setCollectionsForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Collections"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={collectionsForm.subtitle}
                    onChange={(e) => setCollectionsForm(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Explore our curated collections"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Hero Image</Label>
                <div className="flex items-center gap-4">
                  {collectionsForm.heroImage && (
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-muted">
                      <img src={collectionsForm.heroImage} alt="Hero" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCollectionsImageUpload}
                    />
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured Collections</CardTitle>
              <CardDescription>
                Select which collections to feature (they will appear first)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories?.map((category) => (
                  <div
                    key={category._id}
                    onClick={() => toggleFeaturedCollection(category._id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      collectionsForm.featuredCollectionIds.includes(category._id)
                        ? 'border-brand-pink bg-brand-pink/10'
                        : 'hover:border-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {category.image ? (
                          <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Sparkles className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {collectionsForm.featuredCollectionIds.includes(category._id) && (
                          <span className="text-xs text-brand-pink">Featured</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveCollectionsPage} disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? 'Saving...' : 'Save Collections Page'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


