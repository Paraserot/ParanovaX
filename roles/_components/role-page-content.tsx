
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Role } from '@/services/roles';
import { useAuth } from '@/hooks/useAuth';
import { useRoleStore } from '@/store/slices/useRoleStore';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { columns } from './columns';
import { PageSkeleton } from '@/components/page-skeleton';
import { AddEditRoleDialog } from './add-edit-role-dialog';
import { DataTable } from './data-table';


function RoleList() {
    const { roles, loading, fetchRoles } = useRoleStore();

    useEffect(() => {
        const unsubscribe = fetchRoles();
        return () => unsubscribe();
    }, [fetchRoles]);
    
    const handleEdit = (role: Role) => {
        (window as any).dispatchEvent(new CustomEvent('editRole', { detail: role }));
    };
    
    const memoizedColumns = React.useMemo(() => columns({ onEdit: handleEdit, refreshData: fetchRoles }), [fetchRoles]);

    if (loading && roles.length === 0) {
        return <DataTableSkeleton columns={memoizedColumns} />;
    }

    return <DataTable columns={memoizedColumns} data={roles} />;
}

export default function RolePageContent() {
    const { hasPermission } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    
    const canCreate = hasPermission('roles', 'create');

    useEffect(() => {
        const handleEditEvent = (event: CustomEvent) => {
            setSelectedRole(event.detail);
            setIsDialogOpen(true);
        };

        window.addEventListener('editRole' as any, handleEditEvent);
        return () => window.removeEventListener('editRole' as any, handleEditEvent);
    }, []);

    const handleAddNew = () => {
        setSelectedRole(null);
        setIsDialogOpen(true);
    };

    const handleSuccess = () => {
        // The onSnapshot listener in the store will auto-update the data.
        setIsDialogOpen(false);
    };

    return (
        <>
            <Card className="interactive-card">
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle>User Roles</CardTitle>
                        <CardDescription>Define roles and their respective access levels.</CardDescription>
                    </div>
                    {canCreate && (
                        <Button onClick={handleAddNew} variant="border-gradient" className="w-full md:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Role
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<DataTableSkeleton columns={columns({onEdit: ()=>{}, refreshData: ()=>{}})} />}>
                        <RoleList />
                    </Suspense>
                </CardContent>
            </Card>

            {isDialogOpen && (
                    <AddEditRoleDialog
                        isOpen={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        role={selectedRole}
                        onSuccess={handleSuccess}
                    />
            )}
        </>
    );
}
