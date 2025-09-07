
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addClientType, updateClientType, ClientType } from '@/services/client-types';

const formSchema = z.object({
  label: z.string().min(3, 'Label is required and must be at least 3 characters.'),
});

type AddEditClientTypeDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  clientType: ClientType | null;
  onSuccess: () => void;
};

export function AddEditClientTypeDialog({ isOpen, onOpenChange, clientType, onSuccess }: AddEditClientTypeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { label: '' },
  });
  
  useEffect(() => {
    if (clientType) {
      form.reset({ label: clientType.label });
    } else {
      form.reset({ label: '' });
    }
  }, [clientType, form, isOpen]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const typeName = values.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const data = { label: values.label, name: typeName };

      if (clientType) {
        await updateClientType(clientType.id!, data);
        toast({ title: 'Success', description: 'Client type updated successfully.' });
      } else {
        await addClientType(data);
        toast({ title: 'Success', description: 'New client type added.' });
      }
      onSuccess();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{clientType ? 'Edit Client Type' : 'Add New Client Type'}</DialogTitle>
          <DialogDescription>
            {clientType ? 'Update the label for this client type.' : 'Create a new category for your clients.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="label">Type Label</FormLabel>
                  <FormControl>
                    <Input id="label" placeholder="e.g., Hotel Owner" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {clientType ? 'Save Changes' : 'Add Type'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
