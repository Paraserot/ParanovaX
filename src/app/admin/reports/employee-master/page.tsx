
"use client";

import { useMemo, Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import { useEntityStore } from "@/store/slices/useEntityStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { columns } from "../../entities/_components/columns";
import { DataTableSkeleton } from "@/components/data-table-skeleton";
import ReportNavigation from '../_components/report-navigation';

const EntityDataTable = dynamic(() => import('../../entities/_components/entity-data-table'), { ssr: false, loading: () => <DataTableSkeleton columns={columns} /> });

function EmployeeList() {
    const { entities, loading, fetchEntities } = useEntityStore();
    const employeeData = useMemo(() => entities.filter(e => e.entityType === 'employee'), [entities]);
    
    useEffect(() => {
       fetchEntities();
    }, [fetchEntities]);

    if (loading && entities.length === 0) {
        return <DataTableSkeleton columns={columns} />;
    }
    
    return <EntityDataTable columns={columns} data={employeeData} entityType="Employee" showExportButtons={true} />;
}

export default function EmployeeMasterReportPage() {
    return (
        <div className="space-y-6 animate-on-scroll">
            <Card className="interactive-card">
                 <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl">Employee Master Report</CardTitle>
                        <CardDescription>A complete database of all employees associated with your clients.</CardDescription>
                    </div>
                    <ReportNavigation />
                </CardHeader>
            </Card>

            <Card className="interactive-card">
                <CardContent className="pt-6">
                    <Suspense fallback={<DataTableSkeleton columns={columns} />}>
                        <EmployeeList />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
