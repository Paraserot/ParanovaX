
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ShieldCheck } from 'lucide-react';
import { AdminUser } from '@/services/users';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/store/slices/useUserStore';
import { useRoleStore } from '@/store/slices/useRoleStore';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { columns } from './columns';
import { useRouter } from 'next/navigation';
import { PageSkeleton } from '@/components/page-skeleton';
import { AddEditUserDialog } from './add-edit-user-dialog';
import { DataTable } from './data-table';


function UserList() {
    const { users, loading, fetchUsers } = useUserStore();
    const { rolesMap, fetchRoles } = useRoleStore();

    useEffect(() => {
        const unsubscribeUsers = fetchUsers();
        const unsubscribeRoles = fetchRoles();
        return () => {
            unsubscribeUsers();
            unsubscribeRoles();
        };
    }, [fetchUsers, fetchRoles]);
    
    const handleEdit = (user: AdminUser) => {
        (window as any).dispatchEvent(new CustomEvent('editUser', { detail: user }));
    };
    
    const memoizedColumns = React.useMemo(() => columns({ onEdit: handleEdit, refreshData: fetchUsers, rolesMap }), [rolesMap, fetchUsers]);

    if (loading && users.length === 0) {
        return <DataTableSkeleton columns={memoizedColumns} />;
    }

    return <DataTable columns={memoizedColumns} data={users} />;
}

export default function UserPageContent() {
    const { hasPermission } = useAuth();
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    const canCreate = hasPermission('users', 'create');

    useEffect(() => {
        const handleEditEvent = (event: CustomEvent) => {
            setSelectedUser(event.detail);
            setIsDialogOpen(true);
        };

        window.addEventListener('editUser' as any, handleEditEvent);
        return () => window.removeEventListener('editUser' as any, handleEditEvent);
    }, []);

    const handleAddNew = () => {
        setSelectedUser(null);
        setIsDialogOpen(true);
    };

    const handleSuccess = () => {
        setIsDialogOpen(false);
    };

    return (
        <>
            <Card className="interactive-card">
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle>Staff Management</CardTitle>
                        <CardDescription>Browse, search, and manage your list of staff members.</CardDescription>
                    </div>
                    <div className="flex w-full flex-col md:flex-row md:w-auto items-center gap-2">
                        <Button onClick={() => router.push('/admin/roles')} variant="outline" className="w-full md:w-auto">
                            <ShieldCheck className="mr-2 h-4 w-4" /> Manage Roles
                        </Button>
                        {canCreate && (
                            <Button onClick={handleAddNew} variant="border-gradient" className="w-full md:w-auto">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add New User
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<DataTableSkeleton columns={columns({onEdit: ()=>{}, refreshData: ()=>{}, rolesMap: new Map()})} />}>
                        <UserList />
                    </Suspense>
                </CardContent>
            </Card>

            {isDialogOpen && (
                    <AddEditUserDialog
                        isOpen={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        user={selectedUser}
                        onSuccess={handleSuccess}
                    />
            )}
        </>
    );
}
