
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useToast } from '@/hooks/use-toast';
import { addUser, updateUser, AdminUser } from '@/services/users';
import { useRoleStore } from '@/store/slices/useRoleStore';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Invalid email address.'),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits.'),
  role: z.string().min(1, 'Role is required.'),
  status: z.enum(['active', 'inactive']),
  password: z.string().optional(),
});

const defaultFormValues: z.infer<typeof formSchema> = {
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    role: '',
    status: 'active',
    password: '',
};

type AddEditUserDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: AdminUser | null;
  onSuccess: () => void;
};

export function AddEditUserDialog({ isOpen, onOpenChange, user, onSuccess }: AddEditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { roles } = useRoleStore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: user ? { ...user, password: '' } : defaultFormValues,
  });
  
  useEffect(() => {
    if (isOpen) {
      if (user) {
        form.reset({ ...user, password: '' });
      } else {
        form.reset(defaultFormValues);
      }
    }
  }, [isOpen, user, form]);

  const handleDialogClose = () => {
    onOpenChange(false);
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (user) {
        await updateUser(user.id!, { ...values });
        toast({ title: 'User Updated', description: 'The user has been updated successfully.' });
      } else {
        await addUser({ ...values, password: values.password! });
        toast({ title: 'User Added', description: 'A new user has been added successfully.' });
      }
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save user:', error);
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: error.message || `Failed to ${user ? 'update' : 'add'} the user. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update the details of the existing user.' : 'Fill in the details to add a new staff member.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel htmlFor="firstName">First Name</FormLabel><FormControl><Input id="firstName" placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel htmlFor="lastName">Last Name</FormLabel><FormControl><Input id="lastName" placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>)}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel htmlFor="email">Email</FormLabel><FormControl><Input id="email" type="email" placeholder="john.doe@example.com" {...field} disabled={!!user} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="mobile" render={({ field }) => (<FormItem><FormLabel htmlFor="mobile">Mobile No.</FormLabel><FormControl><Input id="mobile" placeholder="10-digit number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel htmlFor="role">Role</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger id="role" name="role"><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl><SelectContent>{roles.map(role => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel htmlFor="status">Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger id="status" name="status"><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
            </div>
            <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel htmlFor="password">Set/Reset Password</FormLabel><FormControl><Input id="password" type="password" placeholder={user ? "Leave blank to keep unchanged" : "Set initial password"} {...field} /></FormControl><FormMessage /></FormItem>)}/>
            
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={handleDialogClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading} variant="border-gradient">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {user ? 'Save Changes' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    
