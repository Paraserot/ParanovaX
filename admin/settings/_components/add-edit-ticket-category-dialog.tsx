
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addTicketCategory, updateTicketCategory, TicketCategory } from '@/services/ticket-categories';
import { useUserStore } from '@/store/slices/useUserStore';

const formSchema = z.object({
  label: z.string().min(3, 'Label is required and must be at least 3 characters.'),
  assigneeId: z.string().optional(),
});

type AddEditTicketCategoryDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  category: TicketCategory | null;
  onSuccess: () => void;
};

export function AddEditTicketCategoryDialog({ isOpen, onOpenChange, category, onSuccess }: AddEditTicketCategoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { users } = useUserStore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { label: '', assigneeId: '' },
  });
  
  useEffect(() => {
    if (category) {
      form.reset({ label: category.label, assigneeId: category.assignedTo?.id || '' });
    } else {
      form.reset({ label: '', assigneeId: '' });
    }
  }, [category, form, isOpen]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const categoryName = values.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const selectedUser = users.find(u => u.id === values.assigneeId);
      
      const data = { 
        label: values.label, 
        name: categoryName,
        assignedTo: selectedUser ? { id: selectedUser.id!, name: `${selectedUser.firstName} ${selectedUser.lastName}`, mobile: selectedUser.mobile } : null
      };

      if (category) {
        await updateTicketCategory(category.id!, data);
        toast({ title: 'Success', description: 'Category updated successfully.' });
      } else {
        await addTicketCategory(data);
        toast({ title: 'Success', description: 'New category added.' });
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
          <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {category ? 'Update the details for this category.' : 'Create a new category for support tickets.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Label</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Technical Support" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auto-Assign To (Optional)</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Manual Assignment" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="">None (Manual Assignment)</SelectItem>
                            {users.map(user => <SelectItem key={user.id} value={user.id!}>{`${user.firstName} ${user.lastName}`}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {category ? 'Save Changes' : 'Add Category'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
