"use client";

"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatCards, StatCardData } from './stat-cards';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientTypeStore } from '@/store/slices/useClientTypeStore';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { PageSkeleton } from '@/components/page-skeleton';
import ClientListDialog from './client-list-dialog';
import { AIAssistantDialog } from './ai-assistant-dialog';
import RevenueChartComponent from './revenue-chart';
import ExpenseChartComponent from './expense-chart';
import ClientChartsCard from './client-charts-card';
import LoginAnalytics from './login-analytics';


export default function DashboardPageContent() {
    const [selectedClientTypeId, setSelectedClientTypeId] = useState<string | null>(null);
    const [dialogContent, setDialogContent] = useState<StatCardData['summary'] | null>(null);
    const [isClientListOpen, setIsClientListOpen] = useState(false);
    const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
    const { clientTypes, fetchClientTypes } = useClientTypeStore();

    useEffect(() => {
        fetchClientTypes(true);
    }, [fetchClientTypes]);
    
    const handleCardClick = (content: StatCardData['summary']) => {
        setDialogContent(content);
        setIsClientListOpen(true);
    };

    const selectedClientTypeLabel = clientTypes.find(ct => ct.name === selectedClientTypeId)?.label;
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold">
                    {selectedClientTypeId ? `Filtered by ${selectedClientTypeLabel}` : 'Overall Dashboard'}
                </h1>
                <div className="flex w-full sm:w-auto items-center gap-2">
                    <Select
                        value={selectedClientTypeId || "all"}
                        onValueChange={(value) => setSelectedClientTypeId(value === "all" ? null : value)}
                    >
                        <SelectTrigger className="w-full sm:w-[250px]">
                            <SelectValue placeholder="Filter by Client Type..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Client Types</SelectItem>
                            {clientTypes.map(ct => (
                                <SelectItem key={ct.id} value={ct.name}>{ct.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Button onClick={() => setIsAiAssistantOpen(true)} variant="outline" size="icon" className="shrink-0">
                        <Wand2 className="h-5 w-5 text-primary" />
                        <span className="sr-only">AI Assistant</span>
                    </Button>
                </div>
            </div>
            
            <Suspense fallback={<PageSkeleton />}>
                <StatCards onCardClick={handleCardClick} selectedClientTypeId={selectedClientTypeId} />
            </Suspense>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                    <RevenueChartComponent selectedClientId={null} />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                    <ExpenseChartComponent />
                </Suspense>
            </div>
            
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <ClientChartsCard selectedClientTypeId={selectedClientTypeId} />
            </Suspense>

             <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <LoginAnalytics />
            </Suspense>

            {dialogContent && (
                <ClientListDialog
                    isOpen={isClientListOpen}
                    onOpenChange={setIsClientListOpen}
                    title={dialogContent.title}
                    description={dialogContent.description}
                    clients={dialogContent.clients}
                />
            )}

            {isAiAssistantOpen && <AIAssistantDialog isOpen={isAiAssistantOpen} onOpenChange={setIsAiAssistantOpen} />}
        </div>
    );
}
