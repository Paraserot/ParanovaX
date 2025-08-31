
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
import { addLead, updateLead, Lead } from '@/services/leads';
import { useUserStore } from '@/store/slices/useUserStore';
import { leadSources } from '@/lib/constants';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits.'),
  company: z.string().optional(),
  source: z.string().min(1, 'Lead source is required.'),
  status: z.enum(['new', 'contacted', 'qualified', 'lost', 'won']),
  assignedTo: z.string().min(1, 'Please assign this lead to a user.'),
  notes: z.string().optional(),
});

const defaultFormValues: z.infer<typeof formSchema> = {
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    company: '',
    source: '',
    status: 'new',
    assignedTo: '',
    notes: '',
};

type AddEditLeadDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  lead: Lead | null;
  onSuccess: () => void;
};

export function AddEditLeadDialog({ isOpen, onOpenChange, lead, onSuccess }: AddEditLeadDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { users } = useUserStore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: lead ? { ...lead } : defaultFormValues,
  });
  
  useEffect(() => {
    if (isOpen) {
      if (lead) {
        form.reset({ ...lead, email: lead.email || '' });
      } else {
        form.reset(defaultFormValues);
      }
    }
  }, [isOpen, lead, form]);

  const handleDialogClose = () => {
    onOpenChange(false);
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (lead) {
        await updateLead(lead.id!, { ...values });
        toast({ title: 'Lead Updated', description: 'The lead has been updated successfully.' });
      } else {
        await addLead({ ...values });
        toast({ title: 'Lead Added', description: 'A new lead has been added successfully.' });
      }
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save lead:', error);
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: `Failed to ${lead ? 'update' : 'add'} the lead. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{lead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          <DialogDescription>
            {lead ? 'Update the details of the existing lead.' : 'Fill in the details for a new lead.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel htmlFor="firstName">First Name</FormLabel><FormControl><Input id="firstName" placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel htmlFor="lastName">Last Name</FormLabel><FormControl><Input id="lastName" placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>)}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel htmlFor="email">Email (Optional)</FormLabel><FormControl><Input id="email" type="email" placeholder="john.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>)}/>
               <FormField control={form.control} name="mobile" render={({ field }) => (<FormItem><FormLabel htmlFor="mobile">Mobile No.</FormLabel><FormControl><Input id="mobile" placeholder="10-digit number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
            </div>
            <FormField control={form.control} name="company" render={({ field }) => (<FormItem><FormLabel htmlFor="company">Company (Optional)</FormLabel><FormControl><Input id="company" placeholder="e.g., Acme Inc." {...field} /></FormControl><FormMessage /></FormItem>)}/>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="source" render={({ field }) => (<FormItem><FormLabel htmlFor="source">Lead Source</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger id="source" name="source"><SelectValue placeholder="Select a source" /></SelectTrigger></FormControl><SelectContent>{leadSources.map(source => <SelectItem key={source} value={source}>{source}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel htmlFor="status">Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger id="status" name="status"><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="qualified">Qualified</SelectItem><SelectItem value="lost">Lost</SelectItem><SelectItem value="won">Won</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
            </div>
            <FormField control={form.control} name="assignedTo" render={({ field }) => (
                <FormItem>
                    <FormLabel htmlFor="assignedTo">Assign To</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger id="assignedTo" name="assignedTo"><SelectValue placeholder="Select a team member" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {users.map(user => <SelectItem key={user.id} value={user.id!}>{`${user.firstName} ${user.lastName}`}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel htmlFor="notes">Notes</FormLabel><FormControl><Textarea id="notes" placeholder="Any additional notes or comments..." {...field} /></FormControl><FormMessage /></FormItem>)}/>
            
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={handleDialogClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading} variant="border-gradient">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {lead ? 'Save Changes' : 'Create Lead'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
