
"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

import { useToast } from '@/hooks/use-toast';
import { addTicket, updateTicket, Ticket } from '@/services/tickets';
import { useAuth } from '@/hooks/useAuth';
import { AdminUser } from '@/services/users';
import { TicketCategory, getTicketCategories } from '@/services/ticket-categories';
import { uploadImage } from '@/services/storage';
import { useClientStore } from '@/store/slices/useClientStore';
import { useClientTypeStore } from '@/store/slices/useClientTypeStore';
import { useUserStore } from '@/store/slices/useUserStore';
import { ticketSources } from '@/lib/constants';
import { PageSkeleton } from '@/components/page-skeleton';

const FileUpload = dynamic(() => import('@/components/ui/file-upload').then(m => m.FileUpload), { ssr: false, loading: () => <PageSkeleton /> });
const Combobox = dynamic(() => import('@/components/ui/combobox').then(m => m.Combobox), { ssr: false, loading: () => <PageSkeleton /> });

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  clientId: z.string().min(1, 'Please select a client.'),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['open', 'in_progress', 'closed']),
  category: z.string().min(1, 'Category is required'),
  assigneeId: z.string().optional(),
  dueDate: z.date().optional(),
  attachment: z.any().optional(),
  ticketSource: z.string().optional(),
});

const defaultFormValues: z.infer<typeof formSchema> = {
    title: '',
    description: '',
    clientId: '',
    priority: 'medium',
    status: 'open',
    category: '',
    assigneeId: '',
    dueDate: undefined,
    attachment: undefined,
    ticketSource: ticketSources[0]
};

type AddEditTicketDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  ticket: Ticket | null;
  onSuccess: () => void;
};

export function AddEditTicketDialog({ isOpen, onOpenChange, ticket, onSuccess }: AddEditTicketDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { clients, fetchClients } = useClientStore();
  const { users: adminUsers, fetchUsers } = useUserStore();
  const { clientTypes, fetchClientTypes } = useClientTypeStore();
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
  const [clientTypeFilter, setClientTypeFilter] = useState('all');
  const { toast } = useToast();
  const { adminUser } = useAuth();

  useEffect(() => {
    async function fetchInitialData() {
        try {
            fetchClients();
            fetchUsers();
            fetchClientTypes();
            const categoryData = await getTicketCategories();
            setTicketCategories(categoryData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load initial form data.' });
        }
    }
    if (isOpen) {
        fetchInitialData();
    }
  }, [isOpen, toast, fetchClients, fetchUsers, fetchClientTypes]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues
  });
  
  useEffect(() => {
    if(isOpen) {
        if (ticket) {
            form.reset({ 
                ...ticket, 
                clientId: ticket.client.id,
                assigneeId: ticket.assignee?.id || '',
                dueDate: ticket.dueDate ? new Date(ticket.dueDate) : undefined
            });
        } else {
            form.reset({
                ...defaultFormValues,
                dueDate: undefined,
            });
        }
    }
  }, [isOpen, ticket, form]);

  const selectedCategoryName = form.watch('category');
  
  const isAssigneeRequired = useMemo(() => {
    if (!selectedCategoryName) return true;
    const selectedCategory = ticketCategories.find(c => c.name === selectedCategoryName);
    return !selectedCategory?.assignedTo?.id;
  }, [selectedCategoryName, ticketCategories]);

  const filteredClients = useMemo(() => {
    if (clientTypeFilter === 'all') {
      return clients;
    }
    return clients.filter(client => client.clientType === clientTypeFilter);
  }, [clients, clientTypeFilter]);

  const clientOptions = useMemo(() => {
    return filteredClients.map(client => ({
      value: client.id!,
      label: `${client.firmName} (${client.firstName} ${client.lastName}, ${client.mobile})`,
      keywords: [client.firmName, client.firstName, client.lastName, client.mobile],
    }));
  }, [filteredClients]);

  const handleDialogClose = () => {
    onOpenChange(false);
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!adminUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to perform this action.' });
        return;
    }
    setIsLoading(true);

    const selectedClient = clients.find(c => c.id === values.clientId);
    if (!selectedClient) {
        toast({ variant: 'destructive', title: 'Error', description: 'Invalid client selected.' });
        setIsLoading(false);
        return;
    }

    try {
      let attachmentUrl = ticket?.attachmentUrl || undefined;
      if (values.attachment instanceof File) {
          const file = values.attachment;
          const uploadResult = await uploadImage(file, `tickets/${Date.now()}_${file.name}`);
          if(uploadResult.downloadURL) {
            attachmentUrl = uploadResult.downloadURL;
          }
      }

      const ticketData = {
        title: values.title,
        description: values.description,
        client: {
            id: selectedClient.id!,
            firmName: selectedClient.firmName,
            firstName: selectedClient.firstName,
            lastName: selectedClient.lastName,
            email: selectedClient.email,
            mobile: selectedClient.mobile,
            state: selectedClient.state,
            clientType: selectedClient.clientType,
        },
        priority: values.priority,
        status: values.status,
        category: values.category,
        dueDate: values.dueDate,
        attachmentUrl,
        ticketSource: values.ticketSource,
      };
      
      const finalTicketData: Partial<Ticket> = ticket ? ticketData : { 
        ...ticketData, 
        remarks: [{
            author: `${adminUser.firstName} ${adminUser.lastName}`,
            comment: values.description,
            attachmentUrl: attachmentUrl
        } as any],
      };

      if (ticket) {
        await updateTicket(ticket.id!, finalTicketData);
        toast({ title: 'Ticket Updated', description: 'The ticket has been updated successfully.' });
      } else {
        await addTicket({ 
            ...finalTicketData,
            assigneeId: values.assigneeId, 
        }, adminUsers);
        toast({ title: 'Ticket Created', description: 'A new ticket has been created.' });
      }
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save ticket:', error);
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: error.message || `Failed to ${ticket ? 'update' : 'create'} the ticket. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{ticket ? 'Edit Ticket' : 'Create New Ticket'}</DialogTitle>
          <DialogDescription>
            {ticket ? 'Update the details of the support ticket.' : 'Fill in the details to create a new support ticket.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <Suspense fallback={<Loader2 className="animate-spin" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                    <FormLabel>Filter by Client Type</FormLabel>
                    <Select value={clientTypeFilter} onValueChange={(value) => {
                        setClientTypeFilter(value);
                        form.setValue('clientId', '');
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by client type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Client Types</SelectItem>
                            {clientTypes.map(type => (
                                <SelectItem key={type.id} value={type.name}>{type.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormItem>
                <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Client</FormLabel>
                        <Combobox
                        options={clientOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Search by Firm, Name, Mobile..."
                        notFoundText="No client found."
                        />
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Title / Subject</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Payment gateway not working" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {ticketCategories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                    )}/>
                </div>

                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Provide a detailed description of the issue..." {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(new Date(field.value), "PPP"): <span>Pick a date</span>}
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="assigneeId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Assign To {isAssigneeRequired && <span className="text-destructive">*</span>}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!isAssigneeRequired}>
                                <FormControl><SelectTrigger><SelectValue placeholder={!isAssigneeRequired ? "Auto-assigned by category" : "Select a team member"} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {adminUsers.map(user => <SelectItem key={user.id} value={user.id!}>{user.firstName} {user.lastName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                    )}/>
                    <FormField
                        control={form.control}
                        name="ticketSource"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Ticket Source</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a source" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {ticketSources.map(source => <SelectItem key={source} value={source}>{source}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                    )}/>
                </div>
                <FormField
                    control={form.control}
                    name="attachment"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Attachment</FormLabel>
                            <FormControl>
                                <FileUpload onFileChange={(file) => field.onChange(file)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </Suspense>
            <DialogFooter className="pt-6">
              <Button type="button" variant="secondary" onClick={handleDialogClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading} variant="border-gradient">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {ticket ? 'Save Changes' : 'Create Ticket'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
