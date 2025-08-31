
"use client";

import React, { useEffect, Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AdminUser } from '@/services/users';
import { useUserStore } from '@/store/slices/useUserStore';
import { useRoleStore } from '@/store/slices/useRoleStore';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { columns } from '../../users/_components/columns';
import ReportNavigation from '../_components/report-navigation';

const DataTable = dynamic(() => import('../../users/_components/data-table'), { ssr: false, loading: () => <DataTableSkeleton columns={columns({onEdit: () => {}, refreshData: () => {}, rolesMap: new Map()})} /> });

function UserList() {
    const { users, loading, fetchUsers } = useUserStore();
    const { rolesMap, fetchRoles } = useRoleStore();

    useEffect(() => {
        const unsubUsers = fetchUsers();
        const unsubRoles = fetchRoles();
        return () => {
            unsubUsers();
            unsubRoles();
        };
    }, [fetchUsers, fetchRoles]);

    const handleEdit = (user: AdminUser) => {
        console.log("Viewing user from report:", user.id);
    };

    const memoizedColumns = React.useMemo(() => columns({ onEdit: handleEdit, refreshData: () => fetchUsers(), rolesMap }), [fetchUsers, rolesMap]);

    if (loading && users.length === 0) {
        return <DataTableSkeleton columns={memoizedColumns} />;
    }
    
    return <DataTable columns={memoizedColumns} data={users} showExportButtons={true} />;
}

export default function UserManagementReportPage() {
    const { fetchRoles } = useRoleStore();
    
    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);
    
    return (
        <div className="space-y-6">
             <Card className="interactive-card">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl">User Management Report</CardTitle>
                        <CardDescription>Overview of all admin users, their roles, and statuses.</CardDescription>
                    </div>
                    <ReportNavigation />
                </CardHeader>
            </Card>

            <Card className="interactive-card">
                <CardContent className="pt-6">
                   <Suspense fallback={<DataTableSkeleton columns={columns({onEdit: () => {}, refreshData: () => {}, rolesMap: new Map()})} />}>
                        <UserList />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
