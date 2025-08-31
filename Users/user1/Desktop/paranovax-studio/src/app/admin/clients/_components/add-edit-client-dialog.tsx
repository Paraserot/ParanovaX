
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Wand2, Eye, EyeOff } from 'lucide-react';

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
  FormDescription as FormDescriptionNative,
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
import { addClient, updateClient, Client } from '@/services/clients';
import { useAuth } from '@/hooks/useAuth';
import { indianStates } from '@/lib/locations';
import { autofillClientDetails } from '@/ai/flows/autofill-client-details';
import { Switch } from '@/components/ui/switch';
import { leadSources } from '@/lib/constants';
import { useClientTypeStore } from '@/store/slices/useClientTypeStore';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  firmName: z.string().min(1, 'Firm/Business name is required.'),
  email: z.string().email('Invalid email address.'),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits.'),
  state: z.string().min(1, 'State is required.'),
  district: z.string().min(1, 'District is required.'),
  clientType: z.string().min(1, 'Client type is required.'),
  status: z.enum(['active', 'inactive', 'pending']),
  portalAccess: z.boolean().default(true),
  password: z.string().optional(),
  remarks: z.string().optional(),
  revenue: z.coerce.number().optional(),
  source: z.string().optional(),
});

const defaultFormValues = {
    firstName: '',
    lastName: '',
    firmName: '',
    email: '',
    mobile: '',
    state: '',
    district: '',
    clientType: '',
    status: 'pending' as const,
    portalAccess: true,
    password: '',
    remarks: '',
    revenue: 0,
    source: '',
};

type AddEditClientDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  client: Client | null;
  onSuccess: () => void;
};

export default function AddEditClientDialog({ isOpen, onOpenChange, client, onSuccess }: AddEditClientDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { adminUser } = useAuth();
  const { clientTypes } = useClientTypeStore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema, {
    }),
    defaultValues: client ? { ...client, password: '' } : defaultFormValues,
  });
  
  useEffect(() => {
    if (isOpen) {
        if (client) {
            form.reset({ ...client, password: '', remarks: client.remarks || '' });
        } else {
            form.reset(defaultFormValues);
        }
    }
  }, [isOpen, client, form]);

  const selectedState = form.watch('state');
  const portalAccess = form.watch('portalAccess');
  const districts = useMemo(() => {
    if (!selectedState) return [];
    return indianStates.find(s => s.name === selectedState)?.districts || [];
  }, [selectedState]);

  const handleDialogClose = () => {
    onOpenChange(false);
  };

  const handleAutofill = async () => {
    const { firstName, lastName, firmName } = form.getValues();
    if (!firstName || !lastName || !firmName) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide First Name, Last Name, and Firm Name to use AI Autofill.',
      });
      return;
    }
    setIsAiLoading(true);
    try {
      const result = await autofillClientDetails({ firstName, lastName, firmName });
      form.setValue('email', result.email, { shouldValidate: true });
      form.setValue('mobile', result.mobile, { shouldValidate: true });
      form.setValue('state', result.state, { shouldValidate: true });
      
      // Wait a moment for districts to update
      setTimeout(() => {
        form.setValue('district', result.district, { shouldValidate: true });
      }, 100);

      toast({
        title: 'Details Autofilled!',
        description: 'AI has suggested some details for this client.',
      });
    } catch (error) {
      console.error("AI Autofill failed:", error);
      toast({ variant: 'destructive', title: 'Oh no!', description: 'Failed to autofill details. Please try again.' });
    } finally {
      setIsAiLoading(false);
    }
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!adminUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to perform this action.' });
        return;
    }
    setIsLoading(true);
    
    const clientUpdates: { [key: string]: any } = { ...values };
    
    // Do not submit password if it's empty
    if (!values.password) {
        delete clientUpdates.password;
    }
    
    try {
      if (client) {
        await updateClient(client.id!, clientUpdates);
        toast({ title: 'Client Updated', description: 'The client has been updated successfully.' });
      } else {
        await addClient(clientUpdates as any); // The type assertion is safe here due to logic
        toast({ title: 'Client Added', description: 'A new client has been added successfully.' });
      }
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save client:', error);
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: error.message || `Failed to ${client ? 'update' : 'add'} the client. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{client ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>
            {client ? 'Update the details of the existing client.' : 'Fill in the details to add a new client to your list.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
             <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={handleAutofill} disabled={isAiLoading}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    {isAiLoading ? 'Generating...' : 'Autofill with AI'}
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel htmlFor="firstName">First Name</FormLabel><FormControl><Input id="firstName" placeholder="Fletcher" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel htmlFor="lastName">Last Name</FormLabel><FormControl><Input id="lastName" placeholder="Boyle" {...field} /></FormControl><FormMessage /></FormItem>)}/>
            </div>
            <FormField control={form.control} name="firmName" render={({ field }) => (<FormItem><FormLabel htmlFor="firmName">Firm/Business Name</FormLabel><FormControl><Input id="firmName" placeholder="e.g., Boyle & Associates" {...field} /></FormControl><FormMessage /></FormItem>)}/>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel htmlFor="email">Email</FormLabel><FormControl><Input id="email" type="email" placeholder="f.boyle@example.com" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="mobile" render={({ field }) => (<FormItem><FormLabel htmlFor="mobile">Mobile No.</FormLabel><FormControl><Input id="mobile" placeholder="10-digit number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel htmlFor="state">State</FormLabel><Select onValueChange={(value) => { field.onChange(value); form.setValue('district', ''); }} value={field.value}><FormControl><SelectTrigger id="state" name="state"><SelectValue placeholder="Select State" /></SelectTrigger></FormControl><SelectContent>{indianStates.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="district" render={({ field }) => (<FormItem><FormLabel htmlFor="district">District</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedState}><FormControl><SelectTrigger id="district" name="district"><SelectValue placeholder={selectedState ? "Select District" : "Select State First"} /></SelectTrigger></FormControl><SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="clientType" render={({ field }) => (<FormItem><FormLabel htmlFor="clientType">Client Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger id="clientType" name="clientType"><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl><SelectContent>{clientTypes.map(ct => <SelectItem key={ct.id} value={ct.name}>{ct.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel htmlFor="status">Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger id="status" name="status"><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="pending">Pending</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
            </div>
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="source">Source</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger id="source" name="source">
                        <SelectValue placeholder="Select the source of this client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leadSources.map(source => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel htmlFor="password">Set/Reset Password</FormLabel>
                        <div className="relative">
                            <FormControl>
                                <Input 
                                    id="password"
                                    type={showPassword ? "text" : "password"} 
                                    placeholder={client ? "Leave blank to keep unchanged" : "Set initial password"} 
                                    {...field}
                                    className="pr-10"
                                />
                            </FormControl>
                             <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        <FormDescriptionNative>
                           {client ? "Leave blank to keep current password." : "Password must be at least 6 characters."}
                        </FormDescriptionNative>
                        <FormMessage />
                    </FormItem>
                )}
            />
            
            <FormField
              control={form.control}
              name="portalAccess"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel htmlFor="portalAccess">Portal Access</FormLabel>
                    <FormDescriptionNative>
                       Allow this client to log in to the portal.
                    </FormDescriptionNative>
                  </div>
                  <FormControl>
                    <Switch
                      id="portalAccess"
                      name="portalAccess"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {!portalAccess && (
                 <FormField 
                    control={form.control} 
                    name="remarks" 
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="remarks">Reason for Disabling Access</FormLabel>
                            <FormControl>
                                <Textarea 
                                    id="remarks"
                                    placeholder="Provide a reason that will be shown to the client upon login attempt..." 
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={handleDialogClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading} variant="border-gradient">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {client ? 'Save Changes' : 'Create Client'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    