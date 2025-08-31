
"use client";

import { Client } from '@/services/clients';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Calendar, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type ClientDetailDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  client: Client;
};

const getInitials = (firstName: string = '', lastName: string = '') => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/40";
      case "inactive":
        return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/40";
      case "pending":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/40";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/40";
    }
};

const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | undefined }) => (
    <div className="flex items-start gap-4 text-foreground">
        <Icon className="h-5 w-5 text-muted-foreground mt-1" />
        <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value || 'N/A'}</p>
        </div>
    </div>
);

export function ClientDetailDialog({ isOpen, onOpenChange, client }: ClientDetailDialogProps) {
  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-8">
        <DialogHeader>
            <DialogTitle className="sr-only">Client Details for {client.firstName} {client.lastName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-20 w-20 text-3xl">
                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {getInitials(client.firstName, client.lastName)}
                </AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-2xl font-bold text-foreground">{`${client.firstName} ${client.lastName}`}</h2>
                <Badge className={cn("capitalize mt-2", getStatusBadge(client.status))}>{client.status}</Badge>
            </div>
        </div>

        <div className="space-y-6 pt-8">
            <DetailRow icon={Mail} label="Email" value={client.email} />
            <DetailRow icon={Phone} label="Phone" value={client.mobile} />
            <DetailRow icon={MapPin} label="Location" value={`${client.district}, ${client.state}`} />
            <DetailRow icon={Calendar} label="Client Since" value={client.createdAt ? format(new Date(client.createdAt), 'dd/MM/yyyy') : 'N/A'} />
            <DetailRow icon={Hash} label="Client ID" value={client.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
