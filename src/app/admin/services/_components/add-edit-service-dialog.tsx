
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useToast } from '@/hooks/use-toast';
import { addService, updateService, Service } from '@/services/services';
import { serviceCategories } from '@/lib/constants';

const formSchema = z.object({
  name: z.string().min(1, 'Service name is required.'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  category: z.string().min(1, 'Category is required.'),
});

const defaultFormValues: z.infer<typeof formSchema> = {
    name: '',
    description: '',
    price: 0,
    category: '',
};

type AddEditServiceDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  service: Service | null;
  onSuccess: () => void;
};

export function AddEditServiceDialog({ isOpen, onOpenChange, service, onSuccess }: AddEditServiceDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: service ? service : defaultFormValues,
  });
  
  useEffect(() => {
    if (isOpen) {
      if (service) {
        form.reset(service);
      } else {
        form.reset(defaultFormValues);
      }
    }
  }, [isOpen, service, form]);

  const handleDialogClose = () => {
    onOpenChange(false);
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (service) {
        await updateService(service.id!, values);
        toast({ title: 'Service Updated', description: 'The service has been updated successfully.' });
      } else {
        await addService(values);
        toast({ title: 'Service Added', description: 'A new service has been added successfully.' });
      }
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save service:', error);
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: `Failed to ${service ? 'update' : 'add'} the service. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{service ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          <DialogDescription>
            {service ? 'Update the details of the service.' : 'Fill in the details to add a new service.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel htmlFor="name">Service Name</FormLabel><FormControl><Input id="name" placeholder="e.g., Website Development" {...field} /></FormControl><FormMessage /></FormItem>)}/>
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel htmlFor="price">Price (₹)</FormLabel><FormControl><Input id="price" type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel htmlFor="category">Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger id="category" name="category"><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>{serviceCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel htmlFor="description">Description</FormLabel><FormControl><Textarea id="description" name="description" placeholder="Describe the service..." {...field} /></FormControl><FormMessage /></FormItem>)}/>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleDialogClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading} variant="border-gradient">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {service ? 'Save Changes' : 'Create Service'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    
