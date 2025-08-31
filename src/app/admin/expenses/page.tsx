
"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useExpenseStore } from '@/store/slices/useExpenseStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Expense } from '@/services/expenses';
import type { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { columns } from './_components/columns';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { PageSkeleton } from '@/components/page-skeleton';
import { AddEditExpenseDialog } from './_components/add-edit-expense-dialog';
import { DataTable } from './_components/data-table';

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
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0,0,0,0);
        
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.expenseDate);
            const toDate = dateRange.to || dateRange.from;
            const toDateEnd = new Date(toDate || new Date());
            toDateEnd.setHours(23, 59, 59, 999);
            return expenseDate >= fromDate && expenseDate <= toDateEnd;
        });
    }, [expenses, dateRange]);
    
     const totalAmount = useMemo(() => {
        return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    }, [filteredExpenses]);


    const memoizedColumns = React.useMemo(() => columns({ onEdit: handleEdit, refreshData: () => fetchExpenses(true) }), [fetchExpenses]);

    if (loading && expenses.length === 0) {
        return <DataTableSkeleton columns={memoizedColumns} />;
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
                        <Button onClick={() => (window as any).dispatchEvent(new CustomEvent('addExpense'))} className="w-full sm:w-auto" variant="border-gradient">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Expense
                        </Button>
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

export default function AdminExpensesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const { fetchExpenses } = useExpenseStore();

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
        fetchExpenses(true);
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-6">
             <Card className="interactive-card">
                <CardHeader>
                    <CardTitle className="text-3xl">Admin Expenses</CardTitle>
                    <CardDescription>
                    Track and manage all your operational expenses in one place.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Suspense fallback={<DataTableSkeleton columns={columns({onEdit: ()=>{}, refreshData: ()=>{}})} />}>
                <ExpenseList />
            </Suspense>

            {isDialogOpen && (
                    <AddEditExpenseDialog
                        isOpen={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        expense={selectedExpense}
                        onSuccess={handleSuccess}
                    />
            )}
        </div>
    );
}
