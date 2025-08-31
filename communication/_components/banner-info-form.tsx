"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUpload } from '@/components/ui/file-upload';
import { ScrollArea } from '@/components/ui/scroll-area';
import { uploadImage } from '@/services/storage';
import { addBanner } from '@/services/banners';
import { bannerTypes } from '@/lib/constants';
import { useClientTypeStore } from '@/store/slices/useClientTypeStore';

const formSchema = z.object({
  bannerTitle: z.string().min(1, 'Banner title is required.'),
  bannerDetails: z.string().min(1, 'Banner details are required.'),
  bannerType: z.string().min(1, 'Banner type is required.'),
  bannerAttachment: z.any().refine(file => file instanceof File, 'Banner attachment is required.'),
  customerTypes: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'You have to select at least one customer type.',
  }),
  language: z.string().min(1, 'Please select a language.'),
});

type BannerInfoFormProps = {
    onBannerAdded: () => void;
}

export function BannerInfoForm({ onBannerAdded }: BannerInfoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { clientTypes } = useClientTypeStore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bannerTitle: '',
      bannerDetails: '',
      bannerType: '',
      customerTypes: [],
      language: '',
    },
  });

  const handleFileChange = (file: File | null) => {
    if (file) {
        form.setValue('bannerAttachment', file, { shouldValidate: true });
    }
  };
  
  const handleSelectAll = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const allTypeNames = clientTypes.map(type => type.name);
    form.setValue('customerTypes', allTypeNames, { shouldValidate: true });
  }

  const handleDeselectAll = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    form.setValue('customerTypes', [], { shouldValidate: true });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
        const file = values.bannerAttachment as File;
        const uploadResult = await uploadImage(file, `banners/${Date.now()}_${file.name}`);
        
        if (uploadResult.error || !uploadResult.downloadURL) {
            throw new Error(uploadResult.error || "Failed to upload banner image.");
        }

        const bannerData = {
            title: values.bannerTitle,
            details: values.bannerDetails,
            type: values.bannerType,
            attachmentUrl: uploadResult.downloadURL,
            customerTypes: values.customerTypes,
            language: values.language,
        };

        await addBanner(bannerData);

        toast({
            title: 'Banner Saved!',
            description: 'Your banner information has been saved successfully.',
        });
        form.reset();
        onBannerAdded();
    } catch (error: any) {
        console.error("Failed to save banner:", error);
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to save banner.' });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="bannerTitle"
            render={({ field }) => (
                <FormItem>
                <FormLabel htmlFor="bannerTitle">Banner Title</FormLabel>
                <FormControl>
                    <Input id="bannerTitle" placeholder="Enter banner title" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel htmlFor="language">Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger id="language" name="language">
                            <SelectValue placeholder="Please select" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="bannerDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="bannerDetails">Banner Details</FormLabel>
              <FormControl>
                <Textarea id="bannerDetails" placeholder="Enter banner details..." {...field} rows={4}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={form.control}
                name="bannerType"
                render={({ field }) => (
                <FormItem>
                    <FormLabel htmlFor="bannerType">Banner Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                        <SelectTrigger id="bannerType" name="bannerType">
                        <SelectValue placeholder="Select a banner type" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {bannerTypes.map(type => (
                            <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
            control={form.control}
            name="bannerAttachment"
            render={() => (
                <FormItem>
                <FormLabel htmlFor="bannerAttachment">Banner Attachment</FormLabel>
                <FormControl>
                    <FileUpload onFileChange={handleFileChange} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="customerTypes"
          render={() => (
            <FormItem>
                <div className="mb-4">
                    <FormLabel className="text-base">Customer Type</FormLabel>
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>Select All</Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleDeselectAll}>Deselect All</Button>
                </div>
                 <ScrollArea className="h-40 w-full rounded-md border p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {clientTypes.map((item) => (
                        <FormField
                            key={item.id}
                            control={form.control}
                            name="customerTypes"
                            render={({ field }) => {
                            return (
                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            id={`type-${item.name}`}
                                            checked={field.value?.includes(item.name)}
                                            onCheckedChange={(checked) => {
                                                return checked
                                                ? field.onChange([...(field.value || []), item.name])
                                                : field.onChange(
                                                    field.value?.filter(
                                                    (value) => value !== item.name
                                                    )
                                                )
                                            }}
                                        />
                                    </FormControl>
                                    <FormLabel htmlFor={`type-${item.name}`} className="font-normal">
                                        {item.label}
                                    </FormLabel>
                                </FormItem>
                            )
                            }}
                        />
                        ))}
                    </div>
                </ScrollArea>
                <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} variant="border-gradient">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save and Publish
            </Button>
        </div>
      </form>
    </Form>
  );
}
