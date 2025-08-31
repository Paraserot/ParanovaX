
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Paperclip, Send, User, Clock, Calendar, Hash, Shield, Tag, UserCheck, Phone, Mail, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Ticket, addTicketRemark, updateTicket } from '@/services/tickets';
import { FileUpload } from '@/components/ui/file-upload';
import { uploadImage } from '@/services/storage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserStore } from '@/store/slices/useUserStore';

const remarkSchema = z.object({
  comment: z.string().min(1, 'Remark cannot be empty.'),
  attachment: z.any().optional(),
});

const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/40";
      case "in_progress": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/40";
      case "closed": return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/40";
      default: return "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/40";
    }
};

const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/40";
      case "medium": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/40";
      case "low": return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/40";
      default: return "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/40";
    }
};

const InfoRow = ({ icon: Icon, label, children }: { icon: React.ElementType, label: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-4 text-sm">
        <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="flex flex-col">
            <span className="text-muted-foreground">{label}</span>
            <div className="font-medium text-foreground">{children}</div>
        </div>
    </div>
)

export default function TicketDetails({ ticket, onRemarkAdded }: { ticket: Ticket; onRemarkAdded: () => void }) {
  const router = useRouter();
  const { adminUser } = useAuth();
  const { users } = useUserStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(remarkSchema)
  });

  const onSubmitRemark = async (data: any) => {
    if (!adminUser || !('role' in adminUser)) return;
    setIsSubmitting(true);
    try {
      let attachmentUrl: string | undefined = undefined;
      if (data.attachment instanceof File) {
        const result = await uploadImage(data.attachment, `tickets/${ticket.id}/remarks/${Date.now()}_${data.attachment.name}`);
        if(result.error) throw new Error(result.error);
        attachmentUrl = result.downloadURL!;
      }

      await addTicketRemark(ticket.id!, {
        author: `${adminUser.firstName} ${adminUser.lastName}`,
        comment: data.comment,
        attachmentUrl
      });
      
      toast({ title: "Remark Added", description: "Your comment has been added to the ticket." });
      reset({ comment: '', attachment: null });
      onRemarkAdded(); // Callback to refresh parent data
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await updateTicket(ticket.id!, { status: status as Ticket['status'] });
      toast({ title: "Status Updated", description: `Ticket status changed to ${status}.` });
      onRemarkAdded(); // Refresh data
    } catch(e) {
      toast({ variant: 'destructive', title: "Error", description: "Failed to update status." });
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
     const selectedUser = users.find(u => u.id === assigneeId);
     if (!selectedUser) return;
     try {
        await updateTicket(ticket.id!, { assignee: { id: selectedUser.id!, name: `${selectedUser.firstName} ${selectedUser.lastName}` } });
        toast({ title: "Assignee Updated", description: `Ticket assigned to ${selectedUser.firstName} ${selectedUser.lastName}.` });
        onRemarkAdded();
     } catch (e) {
        toast({ variant: 'destructive', title: "Error", description: "Failed to update assignee." });
     }
  }

  const formattedStatus = ticket.status.replace('_', ' ');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
             <div className="flex items-center gap-2 mb-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                 <Badge className={cn("capitalize", getStatusBadge(ticket.status))}>{formattedStatus}</Badge>
                 <Badge variant="outline" className={cn("capitalize", getPriorityBadge(ticket.priority))}>{ticket.priority}</Badge>
            </div>
            <CardTitle className="text-2xl md:text-3xl">{ticket.title}</CardTitle>
            <CardDescription>
                Ticket #{ticket.ticketNumber} opened on {format(new Date(ticket.createdAt), 'PPP')}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
              <Controller
                name="status"
                control={control}
                defaultValue={ticket.status}
                render={({ field }) => (
                    <Select onValueChange={handleStatusChange} value={ticket.status}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                )}
               />
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>Conversation</CardTitle></CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-6">
                        {ticket.remarks?.map((remark, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold shrink-0">{remark.author.charAt(0)}</div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold">{remark.author}</p>
                                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(remark.createdAt), { addSuffix: true })}</p>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg mt-1">
                                        <p className="whitespace-pre-wrap">{remark.comment}</p>
                                        {remark.attachmentUrl && (
                                            <a href={remark.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-sm mt-2 flex items-center gap-2 hover:underline">
                                                <Paperclip className="h-4 w-4" /> View Attachment
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Add Your Remark</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmitRemark)} className="space-y-4">
                        <Textarea {...register("comment")} placeholder="Type your comment here..." rows={5} />
                        {errors.comment && <p className="text-sm text-destructive">{errors.comment.message}</p>}
                        
                        <Controller
                            control={control}
                            name="attachment"
                            render={({ field: { onChange } }) => (
                                <FileUpload onFileChange={(file) => onChange(file)} />
                            )}
                        />
                        
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                <Send className="mr-2 h-4 w-4" />
                                {isSubmitting ? "Submitting..." : "Submit Remark"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
        
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Ticket Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <InfoRow icon={Hash} label="Ticket Number">{ticket.ticketNumber}</InfoRow>
                    <InfoRow icon={Clock} label="Status">
                         <Badge className={cn("capitalize", getStatusBadge(ticket.status))}>{formattedStatus}</Badge>
                    </InfoRow>
                    <InfoRow icon={Shield} label="Priority">
                        <Badge className={cn("capitalize", getPriorityBadge(ticket.priority))}>{ticket.priority}</Badge>
                    </InfoRow>
                    <InfoRow icon={Tag} label="Category">{ticket.category}</InfoRow>
                    <InfoRow icon={UserCheck} label="Assigned To">
                         <Select onValueChange={handleAssigneeChange} defaultValue={ticket.assignee.id}>
                            <SelectTrigger>
                                <SelectValue placeholder="Assign ticket..." />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map(user => <SelectItem key={user.id} value={user.id!}>{user.firstName} {user.lastName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </InfoRow>
                    <InfoRow icon={Calendar} label="Due Date">
                        {ticket.dueDate ? format(new Date(ticket.dueDate), 'PPP') : 'Not set'}
                    </InfoRow>
                </CardContent>
            </Card>

             <Card>
                <CardHeader><CardTitle>Client Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <InfoRow icon={Building} label="Firm Name">{ticket.client.firmName}</InfoRow>
                    <InfoRow icon={User} label="Contact Person">{`${ticket.client.firstName} ${ticket.client.lastName}`}</InfoRow>
                    <InfoRow icon={Mail} label="Email">{ticket.client.email}</InfoRow>
                    <InfoRow icon={Phone} label="Mobile">{ticket.client.mobile}</InfoRow>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
