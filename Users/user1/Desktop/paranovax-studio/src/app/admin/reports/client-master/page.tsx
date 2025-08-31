
"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Client } from '@/services/clients';
import { useClientStore } from '@/store/slices/useClientStore';
import { useClientTypeStore } from '@/store/slices/useClientTypeStore';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { columns } from '../../clients/_components/columns';
import ReportNavigation from '../_components/report-navigation';
import { printAsPdf, printAsXlsx } from '@/lib/utils';
import { format } from 'date-fns';

const DataTable = dynamic(() => import('../../clients/_components/data-table').then(m=>m.DataTable), { ssr: false, loading: () => <DataTableSkeleton columns={columns({ onEdit: () => {}, refreshData: () => {}, clientTypeMap: new Map() })} /> });

function ClientList() {
    const { clients, loading, fetchClients } = useClientStore();
    const { clientTypes, fetchClientTypes } = useClientTypeStore();

    React.useEffect(() => {
        fetchClients(true);
        fetchClientTypes(true);
    }, [fetchClients, fetchClientTypes]);
    
    const clientTypeMap = React.useMemo(() => {
        return new Map(clientTypes.map(ct => [ct.name, ct.label]));
    }, [clientTypes]);
    
    const handleEdit = (client: Client) => {
        console.log("Viewing client from report:", client.id);
    };
    
    const memoizedColumns = React.useMemo(() => columns({ onEdit: handleEdit, refreshData: () => fetchClients(true), clientTypeMap }), [clientTypeMap, fetchClients]);

    if (loading && clients.length === 0) {
        return <DataTableSkeleton columns={memoizedColumns} />;
    }

    const getExportData = () => {
        const header = ["#", "Firm Name", "Contact Person", "Email", "Mobile", "Client Type", "Status", "Joined On"];
        const body = clients.map((original: Client, i: number) => {
            return [
                i + 1,
                original.firmName,
                `${original.firstName} ${original.lastName}`,
                original.email,
                original.mobile,
                clientTypeMap.get(original.clientType) || original.clientType,
                original.status.charAt(0).toUpperCase() + original.status.slice(1),
                original.createdAt ? format(new Date(original.createdAt), "dd/MM/yyyy") : 'N/A',
            ]
        });
        return { header, body };
      }
    
      const handleExportPdf = () => {
        const { header, body } = getExportData();
        printAsPdf("Client_List", header, body);
      }
      
      const handleExportXlsx = () => {
        const { header, body } = getExportData();
        printAsXlsx("Client_List", header, body);
      }

    return <DataTable columns={memoizedColumns} data={clients} showExportButtons={true} onExportPdf={handleExportPdf} onExportXlsx={handleExportXlsx} />;
}

export default function ClientMasterReportPage() {
    return (
        <div className="space-y-6">
            <Card className="interactive-card">
                 <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl">Client Master Report</CardTitle>
                        <CardDescription>A complete list of all your active, inactive, and pending clients.</CardDescription>
                    </div>
                    <ReportNavigation />
                </CardHeader>
            </Card>

            <Card className="interactive-card">
                <CardContent className="pt-6">
                    <Suspense fallback={<DataTableSkeleton columns={columns({onEdit: () => {}, refreshData: () => {}, clientTypeMap: new Map()})} />}>
                        <ClientList />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
