
"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useExpenseStore } from '@/store/slices/useExpenseStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Expense } from '@/services/expenses';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import type { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { columns } from '../../expenses/_components/columns';
import ReportNavigation from '../_components/report-navigation';
import { PageSkeleton } from '@/components/page-skeleton';

const AddEditExpenseDialog = dynamic(() => import('../../expenses/_components/add-edit-expense-dialog'), { ssr: false, loading: () => <PageSkeleton /> });
const DataTable = dynamic(() => import('../../expenses/_components/data-table'), { ssr: false, loading: () => <DataTableSkeleton columns={columns({ onEdit: () => {}, refreshData: () => {} })} /> });

function ExpenseList() {
    const { expenses, loading, fetchExpenses } = useExpenseStore();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleEdit = (expense: Expense) => {
        (window as any).dispatchEvent(new CustomEvent('editExpense', { detail: expense }));
    };

    const filteredExpenses = useMemo(() => {
        if (!dateRange?.from) return expenses;
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.expenseDate);
            const toDate = dateRange.to || dateRange.from;
            const toDateEnd = new Date(toDate);
toDateEnd.setHours(23, 59, 59, 999);
            return expenseDate >= dateRange.from! && expenseDate <= toDateEnd;
        });
    }, [expenses, dateRange]);
    
     const totalAmount = useMemo(() => {
        return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    }, [filteredExpenses]);
    
    const memoizedColumns = React.useMemo(() => columns({ onEdit: handleEdit, refreshData: () => fetchExpenses() }), [fetchExpenses]);

    if (loading && expenses.length === 0) {
      return <DataTableSkeleton columns={memoizedColumns} />
    }

    return (
        <Card className="interactive-card">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div className="space-y-1">
                        <CardTitle>Expense Records</CardTitle>
                        <CardDescription>
                            Showing expenses for the selected date range. Total: <span className="font-bold text-primary">₹{totalAmount.toLocaleString()}</span>
                        </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                        <DateRangePicker date={dateRange} onDateChange={setDateRange} className="w-full sm:w-auto" />
                    </div>
            </CardHeader>
            <CardContent>
                 <DataTable 
                    columns={memoizedColumns} 
                    data={filteredExpenses} 
                />
            </CardContent>
        </Card>
    );
}

export default function AdminExpensesReportPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    useEffect(() => {
        const handleAdd = () => {
            setSelectedExpense(null);
            setIsDialogOpen(true);
        };
        const handleEdit = (event: CustomEvent) => {
            setSelectedExpense(event.detail);
            setIsDialogOpen(true);
        };

        window.addEventListener('addExpense' as any, handleAdd);
        window.addEventListener('editExpense' as any, handleEdit);
        return () => {
            window.removeEventListener('addExpense' as any, handleAdd);
            window.removeEventListener('editExpense' as any, handleEdit);
        };
    }, []);
    
    const handleSuccess = () => {
        useExpenseStore.getState().forceRefresh();
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-6">
             <Card className="interactive-card">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl">Admin Expenses Report</CardTitle>
                        <CardDescription>A detailed breakdown of your internal operational expenses.</CardDescription>
                    </div>
                    <ReportNavigation />
                </CardHeader>
            </Card>
            
            <Suspense fallback={<DataTableSkeleton columns={columns({ onEdit: () => {}, refreshData: () => {} })} />}>
                <ExpenseList />
            </Suspense>

            {isDialogOpen && (
                <Suspense fallback={<PageSkeleton />}>
                    <AddEditExpenseDialog
                        isOpen={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        expense={selectedExpense}
                        onSuccess={handleSuccess}
                    />
                </Suspense>
            )}
        </div>
    );
}
