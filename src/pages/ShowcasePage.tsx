import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { STARTER_TEMPLATES, StarterTemplate } from "@/data/starter-templates";
import { TemplateShowcaseHero } from "@/components/showcase/TemplateShowcaseHero";
import { TemplateShowcaseCard } from "@/components/showcase/TemplateShowcaseCard";
import { TemplatePreview } from "@/components/admin/templates/TemplatePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Search,
  LayoutTemplate,
  Zap,
  BookOpen,
  MessageSquare
} from "lucide-react";

// Category definitions
type Category = 'all' | 'startup' | 'enterprise' | 'compliance' | 'platform' | 'helpcenter';

const CATEGORIES: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Templates', icon: <LayoutTemplate className="h-4 w-4" /> },
  { id: 'startup', label: 'Startup', icon: <Zap className="h-4 w-4" /> },
  { id: 'enterprise', label: 'Enterprise', icon: <LayoutTemplate className="h-4 w-4" /> },
  { id: 'compliance', label: 'Compliance', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'platform', label: 'Platform', icon: <Zap className="h-4 w-4" /> },
  { id: 'helpcenter', label: 'Help Center', icon: <BookOpen className="h-4 w-4" /> },
];

// Features filter
type FeatureFilter = 'all' | 'ai-chat' | 'knowledge-base' | 'blog';

export default function ShowcasePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedFeature, setSelectedFeature] = useState<FeatureFilter>('all');
  const [previewTemplate, setPreviewTemplate] = useState<StarterTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return STARTER_TEMPLATES.filter((template) => {
      // Category filter
      if (selectedCategory !== 'all' && template.category !== selectedCategory) {
        return false;
      }

      // Feature filter
      if (selectedFeature !== 'all') {
        const hasChat = template.chatSettings?.enabled !== false;
        const hasKb = (template.kbCategories?.length || 0) > 0;
        const hasBlog = (template.blogPosts?.length || 0) > 0;

        if (selectedFeature === 'ai-chat' && !hasChat) return false;
        if (selectedFeature === 'knowledge-base' && !hasKb) return false;
        if (selectedFeature === 'blog' && !hasBlog) return false;
      }

      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        return (
          template.name.toLowerCase().includes(search) ||
          template.description.toLowerCase().includes(search) ||
          template.tagline.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [selectedCategory, selectedFeature, searchQuery]);

  // Featured template (first one that matches filters, or first overall)
  const featuredTemplate = filteredTemplates[0] || STARTER_TEMPLATES[0];

  const handlePreview = (template: StarterTemplate) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const handleSelect = (template: StarterTemplate) => {
    navigate('/admin/new-site', { state: { selectedTemplate: template } });
  };

  const toggleExpand = (templateId: string) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Full Width */}
      <section className="relative py-12 md:py-16 lg:py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Choose Your Perfect <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                Website Template
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse our collection of professionally designed templates.
              Preview live demos and customize to fit your brand.
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="max-w-5xl mx-auto space-y-4 mb-12">
            {/* Main Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base rounded-xl"
              />
            </div>

            {/* Category & Feature Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Categories - Horizontal scroll on mobile */}
              <div className="flex-1 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <div className="flex gap-2 min-w-max">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "rounded-full px-4 h-9 transition-all",
                        selectedCategory === cat.id && "shadow-md"
                      )}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <span className="mr-2">{cat.icon}</span>
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Feature Filters */}
              <div className="flex gap-2">
                {(['all', 'ai-chat', 'knowledge-base', 'blog'] as FeatureFilter[]).map((feat) => {
                  const icons: Record<FeatureFilter, React.ReactNode> = {
                    all: <LayoutTemplate className="h-4 w-4" />,
                    'ai-chat': <MessageSquare className="h-4 w-4" />,
                    'knowledge-base': <BookOpen className="h-4 w-4" />,
                    blog: <Zap className="h-4 w-4" />,
                  };
                  return (
                    <Button
                      key={feat}
                      variant={selectedFeature === feat ? "default" : "outline"}
                      size="sm"
                      className="rounded-full px-3 h-9"
                      onClick={() => setSelectedFeature(feat)}
                    >
                      {icons[feat]}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Featured Template - Large Hero Style */}
          {filteredTemplates.length > 0 && (
            <div className="mb-16 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold">Featured</h2>
                <span className="text-sm text-muted-foreground">
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 && 's'} found
                </span>
              </div>
              <TemplateShowcaseHero
                featuredTemplate={featuredTemplate}
                onPreview={handlePreview}
                onSelect={handleSelect}
              />
            </div>
          )}

          {/* Template Grid */}
          {filteredTemplates.length > 1 && (
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold">All Templates</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {filteredTemplates
                  .filter((t) => t.id !== featuredTemplate.id)
                  .map((template, index) => (
                    <TemplateShowcaseCard
                      key={template.id}
                      template={template}
                      onPreview={handlePreview}
                      onSelect={handleSelect}
                      index={index}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory('all');
                  setSelectedFeature('all');
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Can't find what you're looking for?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Let our AI Copilot build a custom template tailored to your needs.
          </p>
          <Button
            size="lg"
            className="rounded-xl px-8 text-lg"
            onClick={() => navigate('/admin/copilot')}
          >
            <span className="mr-2">✨</span>
            Let Copilot Build It
          </Button>
        </div>
      </section>

      {/* Preview Modal */}
      <TemplatePreview
        template={previewTemplate}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onSelect={handleSelect}
      />
    </div>
  );
}

