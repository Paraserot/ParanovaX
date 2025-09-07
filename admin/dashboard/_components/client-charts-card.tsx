
"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CustomLoader } from "@/components/ui/custom-loader"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useClientStore } from "@/store/slices/useClientStore"
import { useClientTypeStore } from "@/store/slices/useClientTypeStore"

export type ChartDataItem = {
    name: string;
    value: number;
    fill: string;
};

const chartConfig = { value: { label: "Count" } };

const chartColors = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))"
];

const PieChartDisplay = ({ title, data, totalValue, totalLabel }: { title: string, data: ChartDataItem[], totalValue: number, totalLabel: string }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[250px]">
        <h4 className="font-semibold mb-2 text-center">{title}</h4>
        <p className="text-center text-muted-foreground">No data to display.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="font-semibold text-center mb-2">{title}</h4>
       <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px] w-full">
        <PieChart>
             <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
             <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-foreground text-3xl font-bold">{totalValue.toLocaleString()}</text>
             <text x="50%" y="50%" dy={20} textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground text-sm">{totalLabel}</text>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} strokeWidth={2} stroke="hsl(var(--card))">
                {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
            </Pie>
        </PieChart>
      </ChartContainer>
      <div className="w-full mt-4">
        <Table>
            <TableHeader><TableRow><TableHead className="px-2 h-8 w-[60%]">Type</TableHead><TableHead className="text-center px-2 h-8 w-[20%]">Count</TableHead><TableHead className="text-right px-2 h-8 w-[20%]">%</TableHead></TableRow></TableHeader>
            <TableBody>
                {data.map((d, index) => (
                    <TableRow key={index} className="h-8">
                        <TableCell className="flex items-center gap-2 font-medium py-1 px-2"><div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: d.fill}} /><span className="truncate">{d.name}</span></TableCell>
                        <TableCell className="text-center py-1 px-2">{d.value}</TableCell>
                        <TableCell className="text-right py-1 px-2 text-muted-foreground">{totalValue > 0 ? ((d.value / totalValue) * 100).toFixed(0) : 0}%</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default function ClientChartsCard({ selectedClientTypeId }: { selectedClientTypeId: string | null }) {
    const { clients, loading: clientsLoading, fetchClients } = useClientStore();
    const { clientTypes, loading: typesLoading, fetchClientTypes } = useClientTypeStore();

    React.useEffect(() => {
        fetchClients();
        fetchClientTypes();
    }, [fetchClients, fetchClientTypes]);

    const { statusData, typeData, totalStatus, totalTypes } = React.useMemo(() => {
        const filteredClients = selectedClientTypeId ? clients.filter(c => c.clientType === selectedClientTypeId) : clients;
        if (filteredClients.length === 0) return { statusData: [], typeData: [], totalStatus: 0, totalTypes: 0 };

        const statusCounts = filteredClients.reduce((acc, client) => {
            acc[client.status] = (acc[client.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const newStatusData: ChartDataItem[] = Object.entries(statusCounts).map(([name, value], index) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, fill: chartColors[index % chartColors.length] }));

        const activeClients = filteredClients.filter(c => c.status === 'active');
        const typeCounts = activeClients.reduce((acc, client) => {
            const typeName = client.clientType || 'Uncategorized';
            acc[typeName] = (acc[typeName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const typeMap = new Map(clientTypes.map(t => [t.name, t.label]));
        const newTypeData: ChartDataItem[] = Object.entries(typeCounts).map(([name, value], index) => ({ name: typeMap.get(name) || name, value, fill: chartColors[index % chartColors.length] }));

        return {
            statusData: newStatusData,
            typeData: newTypeData,
            totalStatus: filteredClients.length,
            totalTypes: activeClients.length
        };

    }, [clients, clientTypes, selectedClientTypeId]);

    const loading = clientsLoading || typesLoading;

    return (
        <Card className="interactive-card flex flex-col h-full">
            <CardHeader className="pb-4"><CardTitle>Client Overview</CardTitle><CardDescription>A summary of client status and types.</CardDescription></CardHeader>
            <CardContent className="flex-1 flex items-start justify-center">
                {loading ? (
                    <div className="h-full w-full flex items-center justify-center min-h-[300px]"><CustomLoader /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
                        <PieChartDisplay title="Clients by Status" data={statusData} totalValue={totalStatus} totalLabel="Total Clients" />
                        <div className="relative"><Separator orientation="vertical" className="absolute left-[-1.5rem] top-0 h-full hidden md:block" /><PieChartDisplay title="Active Clients by Type" data={typeData} totalValue={totalTypes} totalLabel="Active Clients" /></div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
