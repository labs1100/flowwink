import { StarterTemplate } from "@/data/starter-templates";
import { cn } from "@/lib/utils";
import { getTemplateThumbnail, getTemplateHero } from "@/lib/template-helpers";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TemplateShowcaseHeroProps {
  featuredTemplate: StarterTemplate;
  onPreview: (template: StarterTemplate) => void;
  onSelect: (template: StarterTemplate) => void;
}

export function TemplateShowcaseHero({ featuredTemplate, onPreview, onSelect }: TemplateShowcaseHeroProps) {
  const thumbnail = getTemplateThumbnail(featuredTemplate);
  const heroData = getTemplateHero(featuredTemplate);
  const primaryColor = featuredTemplate.branding?.primaryColor || '#6366f1';

  const hasKb = (featuredTemplate.kbCategories?.length || 0) > 0;
  const hasBlog = (featuredTemplate.blogPosts?.length || 0) > 0;
  const hasChat = featuredTemplate.chatSettings?.enabled !== false;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-card border border-border/50 shadow-2xl">
      {/* Background with gradient */}
      <div
        className="absolute inset-0 transition-transform duration-1000 hover:scale-105"
        style={thumbnail.type === 'image'
          ? {
              backgroundImage: `url(${thumbnail.value})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : { background: thumbnail.value }
        }
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16 p-8 md:p-16 lg:p-20">
        {/* Left side - Text content */}
        <div className="flex-1 max-w-2xl space-y-6 text-center md:text-left animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm text-white/90">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Featured Template</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
            {featuredTemplate.name}
          </h1>

          <p className="text-lg md:text-xl text-white/80 leading-relaxed">
            {featuredTemplate.description}
          </p>

          {/* Features list */}
          <div className="flex flex-wrap gap-3">
            {hasChat && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>AI Chat</span>
              </div>
            )}
            {hasKb && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Knowledge Base</span>
              </div>
            )}
            {hasBlog && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Blog</span>
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            <Button
              size="lg"
              className="rounded-xl px-8 text-lg shadow-xl shadow-amber-500/20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 border-none"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(featuredTemplate);
              }}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Use This Template
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl px-8 text-lg border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(featuredTemplate);
              }}
            >
              <span className="mr-2">Preview Demo</span>
            </Button>
          </div>
        </div>

        {/* Right side - Visual preview */}
        <div className="flex-1 w-full max-w-xl">
          <div className="relative aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
            {/* Simulated browser chrome */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-black/30 backdrop-blur-md border-b border-white/10 flex items-center px-4 gap-2 z-20">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
              </div>
              <div className="flex-1 mx-4 h-5 bg-black/40 rounded-md border border-white/5 flex items-center justify-center">
                <span className="text-[10px] text-white/50 font-mono">
                  demo.{featuredTemplate.name.toLowerCase().replace(/\s/g, '')}.com
                </span>
              </div>
            </div>

            {/* Hero preview content */}
            <div className="absolute inset-0 top-10">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Hero simulation */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="max-w-lg space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                    {heroData?.title || featuredTemplate.name}
                  </h2>
                  <p className="text-white/90 text-lg drop-shadow-md">
                    {heroData?.subtitle || featuredTemplate.tagline}
                  </p>

                  {heroData?.primaryButton && (
                    <div className="flex gap-3 justify-center pt-4">
                      <div
                        className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg backdrop-blur-sm"
                        style={{ backgroundColor: `${primaryColor}e6` }}
                      >
                        {heroData.primaryButton.text}
                      </div>
                      {heroData.secondaryButton && (
                        <div className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-md text-white font-semibold">
                          {heroData.secondaryButton.text}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
