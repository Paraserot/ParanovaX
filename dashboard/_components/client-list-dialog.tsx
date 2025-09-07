
"use client";

import { useState } from 'react';
import { Client } from '@/services/clients';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ClientDetailDialog } from './client-detail-dialog';

type ClientListDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description: string;
  clients: Client[];
};

const getInitials = (firstName: string = '', lastName: string = '') => {
    return `${''}${firstName.charAt(0)}${lastName.charAt(0)}${''.toUpperCase()}`;
};

export default function ClientListDialog({ isOpen, onOpenChange, title, description, clients }: ClientListDialogProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsDetailOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] -mx-6 px-6">
            <div className="space-y-4 py-4">
              {clients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                            {getInitials(client.firstName, client.lastName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="font-semibold">{`${client.firstName} ${client.lastName}`}</p>
                      <p className="text-sm text-muted-foreground">{client.firmName}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleViewClient(client)}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {selectedClient && (
        <ClientDetailDialog
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          client={selectedClient}
        />
      )}
    </>
  );
}

    
