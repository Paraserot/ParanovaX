
"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Task } from '@/services/tasks';
import { useAuth } from '@/hooks/useAuth';
import { useTaskStore } from '@/store/slices/useTaskStore';
import { useUserStore } from '@/store/slices/useUserStore';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { columns } from './columns';

const AddEditTaskDialog = dynamic(() => import('./add-edit-task-dialog'), { ssr: false });
const DataTable = dynamic(() => import('./data-table'), { ssr: false, loading: () => <DataTableSkeleton columns={[]} /> });

function TaskList() {
    const { tasks, loading, fetchTasks } = useTaskStore();
    const { usersMap } = useUserStore();

    useEffect(() => {
        const unsubscribe = fetchTasks(true);
        return () => unsubscribe();
    },[fetchTasks])

    const handleEdit = (task: Task) => {
        (window as any).dispatchEvent(new CustomEvent('editTask', { detail: task }));
    };
    
    const memoizedColumns = React.useMemo(() => columns({ onEdit: handleEdit, refreshData: () => fetchTasks(true), usersMap }), [usersMap, fetchTasks]);

    if (loading && tasks.length === 0) {
        return <DataTableSkeleton columns={memoizedColumns} />;
    }

    return <DataTable columns={memoizedColumns} data={tasks} />;
}


export default function TaskPageContent() {
    const { hasPermission } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const canCreate = hasPermission('tasks', 'create');

    useEffect(() => {
        const handleEditEvent = (event: CustomEvent) => {
            setSelectedTask(event.detail);
            setIsDialogOpen(true);
        };

        window.addEventListener('editTask' as any, handleEditEvent);
        return () => window.removeEventListener('editTask' as any, handleEditEvent);
    }, []);

    const handleAddNew = () => {
        setSelectedTask(null);
        setIsDialogOpen(true);
    };

    const handleSuccess = () => {
        useTaskStore.getState().fetchTasks(true);
        setIsDialogOpen(false);
    };

    return (
        <>
            <Card className="interactive-card">
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle>Task List</CardTitle>
                        <CardDescription>Browse, search, and manage your list of tasks.</CardDescription>
                    </div>
                    {canCreate && (
                        <Button onClick={handleAddNew} variant="border-gradient" className="w-full md:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Task
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<DataTableSkeleton columns={[]} />}>
                        <TaskList />
                    </Suspense>
                </CardContent>
            </Card>

            {isDialogOpen && (
                    <AddEditTaskDialog
                        isOpen={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        task={selectedTask}
                        onSuccess={handleSuccess}
                    />
            )}
        </>
    );
}
