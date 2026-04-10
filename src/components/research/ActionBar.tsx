'use client';

// Action Bar Component
// Share, Copy Prompt, Follow actions for path pages

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getPromptsForRole } from '@/data/prompts';
import { cn } from '@/lib/utils';
import { PathRole } from '@/types/research';
import { AlertTriangle, ChevronDown, Copy, Share2 } from 'lucide-react';
import { FollowButton } from './FollowButton';

interface ActionBarProps {
  role: PathRole;
  shareId?: string;
  className?: string;
}

const llmNames = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  claude: 'Claude',
};

export function ActionBar({ role, shareId, className }: ActionBarProps) {
  const { toast } = useToast();
  const prompts = getPromptsForRole(role);

  const handleShare = async () => {
    const url = shareId ? `${window.location.origin}/share/${shareId}` : window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied',
        description: 'Share URL copied to clipboard',
      });
    } catch {
      toast({
        title: 'Could not copy',
        description: 'Please copy the URL manually',
        variant: 'destructive',
      });
    }
  };

  const handleCopyPrompt = async (template: string, llm: string) => {
    try {
      await navigator.clipboard.writeText(template);
      toast({
        title: 'Prompt copied',
        description: `${llmNames[llm as keyof typeof llmNames]} prompt copied to clipboard`,
      });
    } catch {
      toast({
        title: 'Could not copy',
        description: 'Please copy the prompt manually',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={cn('border-t border-b border-border py-6', className)}>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Action Bar
        </p>
        <div className="hidden h-0.5 w-8 bg-border sm:block" />

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share summary
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copy prompt
                <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {prompts.map((prompt) => (
                <DropdownMenuItem
                  key={prompt.id}
                  onClick={() => handleCopyPrompt(prompt.template, prompt.llm)}
                >
                  {llmNames[prompt.llm]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <FollowButton role={role} />
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-sm border border-border bg-secondary p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        <p className="text-xs text-muted-foreground">
          All prompts request sources; treat unsupported answers as unverified.
        </p>
      </div>
    </div>
  );
}
