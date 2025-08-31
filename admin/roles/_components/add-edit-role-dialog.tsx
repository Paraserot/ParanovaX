
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
import { useToast } from '@/hooks/use-toast';
import { addRole, updateRole, Role } from '@/services/roles';

const formSchema = z.object({
  name: z.string().min(3, 'Role name must be at least 3 characters.'),
  level: z.coerce.number().min(1, 'Level must be at least 1.'),
});

const defaultFormValues = {
  name: '',
  level: 1,
};

type AddEditRoleDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  role: Role | null;
  onSuccess: () => void;
};

export function AddEditRoleDialog({ isOpen, onOpenChange, role, onSuccess }: AddEditRoleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: role ? role : defaultFormValues,
  });
  
  useEffect(() => {
    if (isOpen) {
      if (role) {
        form.reset({ name: role.name, level: role.level });
      } else {
        form.reset(defaultFormValues);
      }
    }
  }, [isOpen, role, form]);

  const handleDialogClose = () => {
    onOpenChange(false);
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (role) {
        await updateRole(role.id, values);
        toast({ title: 'Role Updated', description: 'The role has been updated successfully.' });
      } else {
        await addRole(values);
        toast({ title: 'Role Added', description: 'A new role has been added successfully.' });
      }
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save role:', error);
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: error.message || `Failed to ${role ? 'update' : 'add'} the role. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{role ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription>
            {role ? 'Update the details of the existing role.' : 'Define a new user role and its access level.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Role Name</FormLabel>
                  <FormControl>
                    <Input id="name" placeholder="e.g., Accountant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="level">Access Level</FormLabel>
                   <FormControl>
                    <Input id="level" type="number" placeholder="Lower number means higher access" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleDialogClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading} variant="border-gradient">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {role ? 'Save Changes' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
