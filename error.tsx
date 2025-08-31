
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TriangleAlert, Clipboard } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
    const { toast } = useToast();
    const fullErrorLog = `Error: ${error.message}\nDigest: ${error.digest || 'N/A'}\nStack: ${error.stack}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullErrorLog);
        toast({
            title: "Copied to Clipboard",
            description: "The full error log has been copied.",
        })
    }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="items-center text-center">
            <div className="rounded-full bg-destructive/10 p-4">
                <TriangleAlert className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl pt-4">Oops! Something Went Wrong</CardTitle>
            <CardDescription>
                We've encountered an unexpected issue.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <div className="rounded-md bg-destructive/5 p-4 text-sm text-destructive text-left">
                    <p className="font-semibold">{error?.message || 'An unknown error occurred.'}</p>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Show Details</AccordionTrigger>
                        <AccordionContent>
                            <div className="relative rounded-md bg-muted/70 p-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-7 w-7"
                                    onClick={handleCopy}
                                >
                                    <Clipboard className="h-4 w-4" />
                                    <span className="sr-only">Copy Log</span>
                                </Button>
                                <div className="max-h-60 overflow-y-auto pr-8">
                                <pre className="text-xs whitespace-pre-wrap font-mono break-words">
                                    {fullErrorLog}
                                </pre>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button onClick={() => reset()} variant="border-gradient">Try again</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
