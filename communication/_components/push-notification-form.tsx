"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, CalendarIcon, Wand2, Save } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useAuth } from "@/hooks/useAuth"
import { FileUpload } from "@/components/ui/file-upload"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generatePushNotificationBanner } from "@/ai/flows/generate-push-notification-banner"
import { addPushNotification } from "@/services/pushNotifications"
import { uploadImage } from "@/services/storage"
import { useClientTypeStore } from "@/store/slices/useClientTypeStore"


const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  
  // AI Image Generation fields
  aiImageText: z.string().optional(),
  aiAccentColor: z.string().optional(),

  // Manual image upload
  image: z.any().optional(),

  // Targeting
  customerStatus: z.enum(["all", "active", "inactive", "pending"]),
  customerTypes: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'You have to select at least one customer type.',
  }),
  
  // Scheduling
  sendTime: z.enum(["instant", "later"]),
  scheduledDateTime: z.date().optional(),
  
  // Expiry
  expiry: z.enum(["today", "week", "month", "never"]),
  
  // Backlink
  backlink: z.string().optional(),
}).refine(data => {
    if (data.sendTime === 'later' && !data.scheduledDateTime) {
        return false;
    }
    return true;
}, {
    message: "Please select a date and time for scheduled notifications.",
    path: ["scheduledDateTime"],
});

type PushNotificationFormProps = {
    onNotificationSent: () => void;
}

export function PushNotificationForm({ onNotificationSent }: PushNotificationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { clientTypes } = useClientTypeStore();
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('communication', 'create');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      aiImageText: "",
      aiAccentColor: "#800080",
      customerStatus: "all",
      customerTypes: [],
      sendTime: "instant",
      expiry: "week",
      backlink: "/dashboard"
    },
  });

  const sendTime = form.watch("sendTime");
  
  const handleFileChange = (file: File | null) => {
    form.setValue('image', file, { shouldValidate: true });
    if(file) setGeneratedImage(null);
  };
  
  const handleSelectAllTypes = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    form.setValue('customerTypes', clientTypes.map(t => t.name), { shouldValidate: true });
  };

  const handleDeselectAllTypes = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    form.setValue('customerTypes', [], { shouldValidate: true });
  };
  
  const handleGenerateImage = async () => {
    const { aiImageText, aiAccentColor } = form.getValues();
    if (!aiImageText || !aiAccentColor) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please fill in Image Text and Accent Color to generate an image.',
        });
        return;
    }

    setIsAiLoading(true);
    try {
        const result = await generatePushNotificationBanner({ 
            imageText: aiImageText, 
            accentColor: aiAccentColor 
        });
        setGeneratedImage(result.mediaUrl);
        form.setValue('image', null, { shouldValidate: true }); // Clear manual upload
        toast({ title: 'Image Generated!', description: 'The AI has created an image for your notification.' });
    } catch (error) {
        console.error('AI Image Generation failed:', error);
        toast({ variant: 'destructive', title: 'Oh no!', description: 'Failed to generate image. Please try again.' });
    } finally {
        setIsAiLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    let imageUrl: string | null = generatedImage;

    try {
        if (values.image instanceof File) {
            const file = values.image;
            const uploadResult = await uploadImage(file, `notifications/${Date.now()}_${file.name}`);
            if (uploadResult.error || !uploadResult.downloadURL) {
                throw new Error(uploadResult.error || "Failed to upload notification image.");
            }
            imageUrl = uploadResult.downloadURL;
        }

        const notificationData = {
            ...values,
            imageUrl: imageUrl,
        };
        
        await addPushNotification({
          ...notificationData,
          scheduledDateTime: notificationData.scheduledDateTime?.toISOString()
        });

        toast({
          title: "Notification Sent!",
          description: "Your push notification has been scheduled successfully.",
        });
        form.reset();
        setGeneratedImage(null);
        onNotificationSent();

    } catch (error: any) {
        console.error("Failed to send notification:", error);
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to send notification.' });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                    <FormLabel htmlFor="title">Title</FormLabel>
                    <FormControl>
                        <Input id="title" placeholder="E.g., Special Weekend Offer!" {...field} disabled={!canCreate || isSubmitting} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        
        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                    <FormLabel htmlFor="description">Description</FormLabel>
                    <FormControl>
                        <Textarea id="description" placeholder="Describe your notification here..." {...field} rows={4} disabled={!canCreate || isSubmitting}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        
        <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium">Generate Image with AI</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="aiAccentColor" render={({ field }) => (
                    <FormItem>
                        <FormLabel htmlFor="aiAccentColor">Accent Color</FormLabel>
                        <FormControl><Input id="aiAccentColor" type="color" {...field} disabled={isAiLoading || !canCreate} /></FormControl>
                    </FormItem>
                )}/>
                <FormField control={form.control} name="aiImageText" render={({ field }) => (
                    <FormItem>
                        <FormLabel htmlFor="aiImageText">Image Text</FormLabel>
                        <FormControl><Input id="aiImageText" placeholder="E.g., 'Flat 50% off'" {...field} disabled={isAiLoading || !canCreate}/></FormControl>
                    </FormItem>
                )}/>
            </div>
            <Button type="button" onClick={handleGenerateImage} disabled={isAiLoading || !canCreate || isSubmitting}>
                {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                Generate Image
            </Button>
        </div>
        
        {generatedImage && (
            <div className="mt-4">
                <FormLabel>Generated Image Preview</FormLabel>
                <div className="relative mt-2 w-full max-w-sm h-48 rounded-lg overflow-hidden border">
                    <Image src={generatedImage} alt="AI Generated Image" layout="fill" objectFit="cover" />
                </div>
            </div>
        )}

        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
        </div>
        
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="image">Upload Image Manually</FormLabel>
              <FormControl>
                <FileUpload onFileChange={handleFileChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-6 rounded-lg border p-4">
            <h3 className="text-lg font-medium">Targeting &amp; Scheduling</h3>
             <FormField
                control={form.control}
                name="customerStatus"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                    <FormLabel>Target Customer Status</FormLabel>
                    <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-x-6 gap-y-2" disabled={!canCreate || isSubmitting}>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="all" id="status-all" /></FormControl><FormLabel htmlFor="status-all" className="font-normal">All</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="active" id="status-active"/></FormControl><FormLabel htmlFor="status-active" className="font-normal">Active</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="inactive" id="status-inactive" /></FormControl><FormLabel htmlFor="status-inactive" className="font-normal">Inactive</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="pending" id="status-pending"/></FormControl><FormLabel htmlFor="status-pending" className="font-normal">Pending</FormLabel></FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            
            <FormField
            control={form.control}
            name="customerTypes"
            render={() => (
                <FormItem>
                    <FormLabel>Target Customer Types</FormLabel>
                    <div className="flex items-center gap-2 mb-2">
                        <Button type="button" size="sm" variant="outline" onClick={handleSelectAllTypes} disabled={!canCreate || isSubmitting}>Select all</Button>
                        <Button type="button" size="sm" variant="outline" onClick={handleDeselectAllTypes} disabled={!canCreate || isSubmitting}>Deselect all</Button>
                    </div>
                    <ScrollArea className="h-40 w-full rounded-md border p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {clientTypes.map((type) => (
                            <FormField
                            key={type.id}
                            control={form.control}
                            name="customerTypes"
                            render={({ field }) => (
                                <FormItem key={type.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        id={`type-${type.name}`}
                                        checked={field.value?.includes(type.name)}
                                        onCheckedChange={(checked) => field.onChange(
                                            checked 
                                            ? [...(field.value || []), type.name] 
                                            : (field.value || []).filter((value) => value !== type.name)
                                        )}
                                        disabled={!canCreate || isSubmitting}
                                    />
                                </FormControl>
                                <FormLabel htmlFor={`type-${type.name}`} className="font-normal">{type.label}</FormLabel>
                                </FormItem>
                            )}
                            />
                        ))}
                        </div>
                    </ScrollArea>
                    <FormMessage />
                </FormItem>
            )}
            />

            <FormField
                control={form.control}
                name="sendTime"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                    <FormLabel>Send Time</FormLabel>
                    <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-x-6 gap-y-2" disabled={!canCreate || isSubmitting}>
                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="instant" id="send-instant" /></FormControl><FormLabel htmlFor="send-instant" className="font-normal">Instant Send</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="later" id="send-later" /></FormControl><FormLabel htmlFor="send-later" className="font-normal">Schedule for Later</FormLabel></FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            {sendTime === "later" && (
                 <FormField
                    control={form.control}
                    name="scheduledDateTime"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel htmlFor="scheduledDateTime">Schedule Date &amp; Time</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} id="scheduledDateTime" className={cn("w-[240px] justify-start text-left font-normal", !field.value && "text-muted-foreground")} disabled={!canCreate || isSubmitting}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP p") : <span>Pick a date and time</span>}
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                <div className="p-3 border-t border-border">
                                    <Input
                                        type="time"
                                        value={field.value ? format(field.value, "HH:mm") : ""}
                                        onChange={(e) => {
                                            const time = e.target.value;
                                            const [hours, minutes] = time.split(':').map(Number);
                                            const newDate = field.value ? new Date(field.value) : new Date();
                                            newDate.setHours(hours, minutes);
                                            field.onChange(newDate);
                                        }}
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="expiry" render={({ field }) => (
                    <FormItem>
                        <FormLabel htmlFor="expiry">Notification Expiry</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!canCreate || isSubmitting}>
                            <FormControl><SelectTrigger id="expiry" name="expiry"><SelectValue placeholder="Select expiry"/></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="never">Never</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage/>
                    </FormItem>
                 )}/>
                 <FormField control={form.control} name="backlink" render={({ field }) => (
                     <FormItem>
                        <FormLabel htmlFor="backlink">Backlink App Page</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!canCreate || isSubmitting}>
                            <FormControl><SelectTrigger id="backlink" name="backlink"><SelectValue placeholder="Select a page"/></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="/dashboard">Home</SelectItem>
                                <SelectItem value="/clients">Clients</SelectItem>
                                <SelectItem value="/payments">Payments</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                     </FormItem>
                 )}/>
            </div>
        </div>

        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !canCreate} variant="border-gradient">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {sendTime === 'instant' ? 'Send Notification' : 'Schedule Notification'}
            </Button>
        </div>
      </form>
    </Form>
  )
}
