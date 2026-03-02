import { StarterTemplate } from "@/data/starter-templates";
import { cn } from "@/lib/utils";
import { getTemplateThumbnail, getTemplateHero } from "@/lib/template-helpers";
import { Eye, Sparkles, BookOpen, Rss, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TemplateShowcaseCardProps {
  template: StarterTemplate;
  onPreview: (template: StarterTemplate) => void;
  onSelect: (template: StarterTemplate) => void;
  index: number;
}

export function TemplateShowcaseCard({ template, onPreview, onSelect, index }: TemplateShowcaseCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const thumbnail = getTemplateThumbnail(template);
  const heroData = getTemplateHero(template);
  const primaryColor = template.branding?.primaryColor || '#6366f1';

  // Feature indicators
  const hasKb = (template.kbCategories?.length || 0) > 0;
  const hasBlog = (template.blogPosts?.length || 0) > 0;
  const hasChat = template.chatSettings?.enabled !== false;

  // Get hero content for display
  const heroTitle = heroData?.title || template.name;
  const heroSubtitle = heroData?.subtitle || template.tagline;

  // Alternate layout for visual variety
  const isAlternate = index % 2 === 1;

  return (
    <div
      className={cn(
        "group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-out",
        "bg-card border border-border/50 shadow-sm hover:shadow-2xl hover:border-primary/30",
        isHovered ? "scale-[1.01]" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPreview(template)}
    >
      {/* Main visual section - 16:9 aspect ratio for desktop */}
      <div className="relative aspect-video md:aspect-[16/9] overflow-hidden">
        {/* Background - hero image or gradient */}
        <div
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
          style={thumbnail.type === 'image'
            ? {
                backgroundImage: `url(${thumbnail.value})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : { background: thumbnail.value }
          }
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 transition-opacity duration-300" />

        {/* Feature badges - top right */}
        <div className={cn(
          "absolute top-4 right-4 flex gap-2 transition-all duration-300",
          isHovered ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
        )}>
          {hasChat && (
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
              title="AI Chat"
            >
              <MessageSquare className="h-4 w-4 text-cyan-400" />
            </div>
          )}
          {hasKb && (
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
              title="Knowledge Base"
            >
              <BookOpen className="h-4 w-4 text-indigo-400" />
            </div>
          )}
          {hasBlog && (
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
              title="Blog"
            >
              <Rss className="h-4 w-4 text-orange-400" />
            </div>
          )}
        </div>

        {/* Hero content simulation */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="max-w-2xl space-y-3 translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
            <h3 className="text-white font-bold text-3xl md:text-4xl lg:text-5xl line-clamp-2 drop-shadow-2xl">
              {heroTitle}
            </h3>
            <p className="text-white/80 text-sm md:text-base lg:text-lg line-clamp-2 max-w-lg">
              {heroSubtitle}
            </p>
          </div>

          {/* CTA buttons */}
          {heroData?.primaryButton && (
            <div className="flex gap-3 mt-6 translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
              <div
                className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-xl backdrop-blur-sm border border-white/20"
                style={{ backgroundColor: `${primaryColor}e6` }}
              >
                {heroData.primaryButton.text}
              </div>
              {heroData.secondaryButton && (
                <div className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold">
                  {heroData.secondaryButton.text}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hover overlay with actions */}
        <div className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center gap-4 transition-all duration-300",
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <Button
            size="lg"
            variant="secondary"
            className="rounded-xl px-8 shadow-2xl backdrop-blur-md bg-white/10 border-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(template);
            }}
          >
            <Eye className="h-5 w-5 mr-2" />
            Preview
          </Button>
          <Button
            size="lg"
            className="rounded-xl px-8 shadow-2xl"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template);
            }}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Use Template
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Details section - below the fold */}
      <div className="p-6 md:p-8 bg-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {template.pages?.length || 0} pages
              </span>
            </div>

            <h4 className="font-bold text-xl mb-2 truncate">{template.name}</h4>
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {template.description}
            </p>
          </div>

          {/* Mini preview thumbnail */}
          <div className="hidden sm:flex flex-col items-end gap-2">
            <div
              className="h-16 w-24 rounded-lg overflow-hidden border border-border/50 shadow-sm transition-transform duration-300 group-hover:scale-110"
              style={thumbnail.type === 'image'
                ? {
                    backgroundImage: `url(${thumbnail.value})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : { background: thumbnail.value }
              }
            />
            <div className="flex gap-1.5">
              {hasChat && <div className="h-2 w-2 rounded-full bg-cyan-500" title="AI Chat" />}
              {hasKb && <div className="h-2 w-2 rounded-full bg-indigo-500" title="KB" />}
              {hasBlog && <div className="h-2 w-2 rounded-full bg-orange-500" title="Blog" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
