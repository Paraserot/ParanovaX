
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getAppConfig, setAppConfig } from '@/services/app-config';
import type { AppConfig } from '@/services/app-config';
import { FileUpload } from '@/components/ui/file-upload';
import { uploadImage } from '@/services/storage';

const formSchema = z.object({
  companyName: z.string().min(1, 'Company name is required.'),
  companyLogo: z.any(),
  favicon: z.any(),
});

export function CompanyProfileSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { companyName: '' },
  });

  useEffect(() => {
    async function fetchConfig() {
      setIsFetching(true);
      try {
        const config = await getAppConfig();
        form.reset({
          companyName: config.companyName || 'ParanovaX',
        });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch company settings.' });
      } finally {
        setIsFetching(false);
      }
    }
    fetchConfig();
  }, [form, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      let logoUrl: string | undefined = undefined;
      let faviconUrl: string | undefined = undefined;

      if (values.companyLogo instanceof File) {
        const result = await uploadImage(values.companyLogo, 'config/logo');
        if (result.error) throw new Error(`Logo upload failed: ${result.error}`);
        logoUrl = result.downloadURL!;
      }
      
      if (values.favicon instanceof File) {
        const result = await uploadImage(values.favicon, 'config/favicon');
        if (result.error) throw new Error(`Favicon upload failed: ${result.error}`);
        faviconUrl = result.downloadURL!;
      }

      const updates: Partial<AppConfig> = { companyName: values.companyName };
      if (logoUrl) updates.logoUrl = logoUrl;
      if (faviconUrl) updates.faviconUrl = faviconUrl;

      await setAppConfig(updates);

      toast({
        title: 'Settings Saved',
        description: 'Your company profile has been updated.',
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to save settings.' });
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="companyName">Company Name</FormLabel>
              <FormControl>
                <Input id="companyName" placeholder="Enter your company name" {...field} />
              </FormControl>
              <FormDescription>This name will appear throughout the application.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyLogo"
          render={({ field }) => (
            <FormItem>
                <FormLabel htmlFor="companyLogo">Company Logo</FormLabel>
                <FormControl><FileUpload onFileChange={field.onChange} /></FormControl>
                <FormDescription>Upload a new logo (e.g., a PNG file). Leave blank to keep the current one.</FormDescription>
                <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="favicon"
          render={({ field }) => (
            <FormItem>
                <FormLabel htmlFor="favicon">Favicon</FormLabel>
                <FormControl><FileUpload onFileChange={field.onChange} /></FormControl>
                 <FormDescription>Upload a new favicon (e.g., a .ico or .png file). Leave blank to keep the current one.</FormDescription>
                <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} variant="border-gradient">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
            </Button>
        </div>
      </form>
    </Form>
  );
}
