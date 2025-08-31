
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useTicketStore } from '@/store/slices/useTicketStore';
import { Skeleton } from '@/components/ui/skeleton';
import { getTicketById, Ticket } from '@/services/tickets';
import TicketDetails from './_components/ticket-details';

function TicketDetailsSkeleton() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
}


function TicketDetailsPage({ ticketId }: { ticketId: string }) {
    const { forceRefresh } = useTicketStore(); // Keep for remark updates
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const findTicket = async () => {
            setLoading(true);
            try {
                const fetchedTicket = await getTicketById(ticketId);
                setTicket(fetchedTicket);
            } catch (error) {
                console.error("Failed to fetch ticket details:", error);
                setTicket(null);
            } finally {
                setLoading(false);
            }
        };
        
        findTicket();
    }, [ticketId]);

    const handleRemarkAdded = async () => {
        setLoading(true);
        const updatedTicket = await getTicketById(ticketId);
        setTicket(updatedTicket);
        forceRefresh(); // Also refresh the main list in the background
        setLoading(false);
    }

    if (loading) {
        return <TicketDetailsSkeleton />;
    }

    if (!ticket) {
        return <div className="text-center p-8">Ticket not found.</div>;
    }

    return <TicketDetails ticket={ticket} onRemarkAdded={handleRemarkAdded} />;
}

export default function Page({ params }: { params: { ticketId: string } }) {
    return (
        <Suspense fallback={<TicketDetailsSkeleton />}>
            <TicketDetailsPage ticketId={params.ticketId} />
        </Suspense>
    );
}
