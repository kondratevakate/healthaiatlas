// Action Bar Component
// Share, Copy Prompt, Follow actions for path pages

import { PathRole } from '@/types/research';
import { getPromptsForRole } from '@/data/prompts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy, ChevronDown, AlertTriangle } from 'lucide-react';
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
  claude: 'Claude'
};

export function ActionBar({ role, shareId, className }: ActionBarProps) {
  const { toast } = useToast();
  const prompts = getPromptsForRole(role);

  const handleShare = async () => {
    const url = shareId 
      ? `${window.location.origin}/share/${shareId}`
      : window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied',
        description: 'Share URL copied to clipboard'
      });
    } catch {
      toast({
        title: 'Could not copy',
        description: 'Please copy the URL manually',
        variant: 'destructive'
      });
    }
  };

  const handleCopyPrompt = async (template: string, llm: string) => {
    try {
      await navigator.clipboard.writeText(template);
      toast({
        title: 'Prompt copied',
        description: `${llmNames[llm as keyof typeof llmNames]} prompt copied to clipboard`
      });
    } catch {
      toast({
        title: 'Could not copy',
        description: 'Please copy the prompt manually',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className={cn('border-t border-b border-border py-6', className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Action Bar
        </p>
        <div className="h-0.5 w-8 bg-border hidden sm:block" />
        
        <div className="flex flex-wrap gap-2">
          {/* Share */}
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share summary
          </Button>

          {/* Copy Prompt */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy prompt
                <ChevronDown className="h-3 w-3 ml-2" />
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

          {/* Follow */}
          <FollowButton role={role} />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 mt-4 p-3 bg-secondary border border-border rounded-sm">
        <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          All prompts request sources; treat unsupported answers as unverified.
        </p>
      </div>
    </div>
  );
}
