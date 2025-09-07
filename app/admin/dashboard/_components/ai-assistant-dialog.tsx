
"use client";

import { useState } from 'react';
import { CornerDownLeft, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { adminAIAssistant } from '@/ai/flows/admin-ai-assistant';
import { BrandLogo } from '@/components/brand-logo';

type AddEditLeadDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function AIAssistantDialog({ isOpen, onOpenChange }: AddEditLeadDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const { toast } = useToast();
  
  const handleAsk = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResponse('');
    try {
      const result = await adminAIAssistant({ query });
      setResponse(result.response);
    } catch (error) {
      console.error("AI Assistant failed:", error);
      toast({ variant: 'destructive', title: 'Oh no!', description: 'Failed to get a response from the assistant.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAsk();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
            <div className="flex items-center gap-2">
                <Wand2 className="h-6 w-6 text-primary" />
                <div>
                     <DialogTitle>ParanovaX AI Assistant</DialogTitle>
                    <DialogDescription>
                        Ask me anything about the platform's features or how to get things done.
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="relative">
                <Textarea
                    placeholder="e.g., How do I add a new client?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pr-16"
                    rows={2}
                />
                 <Button type="submit" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2" onClick={handleAsk} disabled={isLoading || !query.trim()}>
                    <CornerDownLeft className="h-4 w-4" />
                </Button>
            </div>
            {isLoading && (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
            {response && (
                <div className="p-4 bg-muted/50 rounded-lg border space-y-2">
                     <BrandLogo />
                     <p className="text-sm whitespace-pre-wrap">{response}</p>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
