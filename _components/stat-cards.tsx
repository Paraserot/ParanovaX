
"use client";

import React, { useEffect, useMemo } from 'react';
import { sub, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, CreditCard, IndianRupee, Briefcase, UserCheck, UserX, Clock, Minus } from "lucide-react";
import { cn } from '@/lib/utils';
import { Client } from '@/services/clients';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientStore } from '@/store/slices/useClientStore';
import { usePaymentStore } from '@/store/slices/usePaymentStore';

export type StatCardData = {
    title: string;
    icon: string;
    value: string;
    change: string;
    summary: {
      title: string;
      description: string;
      clients: Client[];
    };
};

type StatCardsProps = {
    onCardClick: (content: StatCardData['summary']) => void;
    selectedClientTypeId: string | null;
};

const iconMap: { [key: string]: React.ElementType } = {
    IndianRupee, Briefcase, UserCheck, UserX, Clock, CreditCard, Minus
};

const StatIcon = ({ name, className }: { name: string; className?: string }) => {
    const IconComponent = iconMap[name];
    if (!IconComponent) return <Minus className={className} />;
    return <IconComponent className={className} />;
};

const getChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 0.1) return '0%';
    return `${change > 0 ? '+' : ''}${change.toFixed(0)}%`;
};

export function StatCards({ onCardClick, selectedClientTypeId }: StatCardsProps) {
    const { clients, loading: clientsLoading, fetchClients } = useClientStore();
    const { payments, loading: paymentsLoading, fetchPayments } = usePaymentStore();

    useEffect(() => {
        fetchClients();
        fetchPayments(true); // force fetch to get latest
    }, [fetchClients, fetchPayments]);

    const statCardData = useMemo(() => {
        const filteredClients = selectedClientTypeId
            ? clients.filter(c => c.clientType === selectedClientTypeId)
            : clients;

        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);
        const startOfPreviousMonth = startOfMonth(sub(now, { months: 1 }));
        const endOfPreviousMonth = endOfMonth(sub(now, { months: 1 }));

        const totalRevenue = filteredClients.reduce((sum, client) => sum + (client.revenue || 0), 0);
        const activeClients = filteredClients.filter(c => c.status === 'active');
        const inactiveClients = filteredClients.filter(c => c.status === 'inactive');
        const pendingClients = filteredClients.filter(c => c.status === 'pending');
        
        const clientsAddedThisMonth = filteredClients.filter(c => c.createdAt && new Date(c.createdAt) >= startOfCurrentMonth).length;
        const clientsAddedLastMonth = filteredClients.filter(c => c.createdAt && isWithinInterval(new Date(c.createdAt), { start: startOfPreviousMonth, end: endOfPreviousMonth })).length;
        
        const revenueThisMonth = filteredClients.filter(c => c.createdAt && new Date(c.createdAt) >= startOfCurrentMonth).reduce((sum, c) => sum + (c.revenue || 0), 0);
        const revenueLastMonth = filteredClients.filter(c => c.createdAt && isWithinInterval(new Date(c.createdAt), { start: startOfPreviousMonth, end: endOfPreviousMonth })).reduce((sum, c) => sum + (c.revenue || 0), 0);

        const completedPayments = payments.filter(p => p.status === 'Completed');
        const totalPayments = completedPayments.reduce((sum, p) => sum + p.amount, 0);

        return [
            { title: 'Total Revenue', icon: 'IndianRupee', value: `₹${totalRevenue.toLocaleString()}`, change: getChange(revenueThisMonth, revenueLastMonth), summary: { title: 'All Clients by Revenue', description: 'List of all clients contributing to the total revenue.', clients: filteredClients } },
            { title: 'Total Clients', icon: 'Briefcase', value: filteredClients.length.toString(), change: getChange(clientsAddedThisMonth, clientsAddedLastMonth), summary: { title: 'All Clients', description: 'List of all clients in the system.', clients: filteredClients } },
            { title: 'Active Clients', icon: 'UserCheck', value: activeClients.length.toString(), change: '+0%', summary: { title: 'Active Clients', description: 'List of all active clients.', clients: activeClients } },
            { title: 'Inactive Clients', icon: 'UserX', value: inactiveClients.length.toString(), change: '+0%', summary: { title: 'Inactive Clients', description: 'List of all inactive clients.', clients: inactiveClients } },
            { title: 'Pending Clients', icon: 'Clock', value: pendingClients.length.toString(), change: '+0%', summary: { title: 'Pending Clients', description: 'List of all pending clients.', clients: pendingClients } },
            { title: 'Total Payments', icon: 'CreditCard', value: `₹${totalPayments.toLocaleString()}`, change: '+0%', summary: { title: 'All Completed Payments', description: 'List of all completed payments.', clients: [] } }
        ];
    }, [clients, payments, selectedClientTypeId]);
    
    if (clientsLoading || paymentsLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <Card key={index} className="interactive-card flex flex-col h-full justify-between min-h-[118px]">
                       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                        </CardHeader>
                         <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                            <Skeleton className="h-7 w-1/2 mb-2" />
                            <Skeleton className="h-3 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCardData.map((card, index) => {
                const isPositive = card.change.startsWith('+');
                const isNegative = card.change.startsWith('-');
                
                return (
                    <Card 
                        key={index}
                        onClick={() => onCardClick(card.summary)}
                        className="interactive-card flex flex-col h-full min-h-[118px] cursor-pointer"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </CardTitle>
                        <StatIcon name={card.icon} className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold">{card.value}</div>
                        <p className={cn(
                            "text-xs text-muted-foreground flex items-center gap-1",
                            isPositive && "text-green-600",
                            isNegative && "text-red-600"
                        )}>
                            {isPositive && <ArrowUpRight className="h-4 w-4" />}
                            {isNegative && <ArrowDownRight className="h-4 w-4" />}
                            {!isPositive && !isNegative && <Minus className="h-4 w-4" />}
                            <span>{card.change} from last month</span>
                        </p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    );
};
