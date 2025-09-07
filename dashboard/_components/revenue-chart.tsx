
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { subDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval } from "date-fns"
import type { DateRange } from "react-day-picker"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { CustomLoader } from "@/components/ui/custom-loader"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { useClientStore } from "@/store/slices/useClientStore"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
}

export default function RevenueChartComponent({ selectedClientId }: { selectedClientId: string | null }) {
  const { clients, loading, fetchClients } = useClientStore();
  const [timeRange, setTimeRange] = React.useState<"month" | "day" | "week" | "year" | "custom">("month");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const chartData = React.useMemo(() => {
    const dataToProcess = selectedClientId ? clients.filter(c => c.id === selectedClientId) : clients;
    if (!dataToProcess.length) return [];

    let filteredClients = dataToProcess;
    if (dateRange?.from && dateRange?.to) {
        const toDateEnd = new Date(dateRange.to);
        toDateEnd.setHours(23, 59, 59, 999);
        filteredClients = dataToProcess.filter(c => c.createdAt && new Date(c.createdAt) >= dateRange.from! && new Date(c.createdAt) <= toDateEnd);
    } else if (dateRange?.from) {
        filteredClients = dataToProcess.filter(c => c.createdAt && new Date(c.createdAt) >= dateRange.from!);
    }

    if (timeRange === "day") {
        if (!dateRange?.from) return [];
        const dayStart = dateRange.from;
        const revenueByHour: Record<string, number> = Array.from({ length: 24 }, (_, i) => i).reduce((acc, hour) => {
            const hourLabel = format(new Date(2000, 0, 1, hour), 'ha');
            acc[hourLabel] = 0;
            return acc;
        }, {} as Record<string, number>);

        filteredClients.forEach(client => {
            const clientDate = new Date(client.createdAt!);
            if (format(clientDate, 'yyyy-MM-dd') === format(dayStart, 'yyyy-MM-dd')) {
                const hourKey = format(clientDate, 'ha');
                revenueByHour[hourKey] = (revenueByHour[hourKey] || 0) + (client.revenue || 0);
            }
        });
        return Object.entries(revenueByHour).map(([x, revenue]) => ({ x, revenue }));
    }
    
    let dateFormat: string;
    let intervalGenerator: (interval: {start: Date, end: Date}) => Date[];

    switch (timeRange) {
        case "week":
            dateFormat = "EEE"; // Day of week, e.g., "Mon"
            intervalGenerator = eachDayOfInterval;
            break;
        case "year":
            dateFormat = "MMM"; // Month, e.g., "Jan"
            intervalGenerator = eachMonthOfInterval;
            break;
        case "custom":
        case "month":
        default:
            dateFormat = "MMM d"; // Date, e.g., "Jan 1"
            intervalGenerator = eachDayOfInterval;
            break;
    }

    const revenueByDate = filteredClients.reduce((acc, client) => {
        const dateKey = format(new Date(client.createdAt!), dateFormat);
        acc[dateKey] = (acc[dateKey] || 0) + (client.revenue || 0);
        return acc;
    }, {} as Record<string, number>);

    if (!dateRange?.from || !dateRange?.to) return [];

    const allDates = intervalGenerator({ start: dateRange.from, end: dateRange.to });
    return allDates.map(date => {
        const dateKey = format(date, dateFormat);
        return {
            x: dateKey,
            revenue: revenueByDate[dateKey] || 0,
        };
    });

  }, [clients, timeRange, dateRange, selectedClientId]);


  const handleTimeRangeChange = (value: string) => {
    const range = value as "month" | "day" | "week" | "year" | "custom";
    setTimeRange(range);
    
    const now = new Date();
    switch(range) {
        case 'day': setDateRange({ from: now, to: now }); break;
        case 'week': setDateRange({ from: startOfWeek(now), to: endOfWeek(now) }); break;
        case 'month': setDateRange({ from: startOfMonth(now), to: endOfMonth(now) }); break;
        case 'year': setDateRange({ from: startOfYear(now), to: endOfYear(now) }); break;
        case 'custom': if (!dateRange) { setDateRange({ from: subDays(new Date(), 29), to: new Date() }); }; break;
    }
  }


  const renderContent = () => {
    if (loading && clients.length === 0) {
        return (
            <div className="flex justify-center items-center h-[300px]">
                <CustomLoader />
            </div>
        )
    }

    if (!chartData.length) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No revenue data for the selected period.</p>
        </div>
      )
    }

    return (
        <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="x"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="preserveStartEnd"
            />
            <Tooltip
                cursor={false}
                content={<ChartTooltipContent 
                    formatter={(value) => `₹${(value as number).toLocaleString()}`}
                    indicator="dot"
                />}
            />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
        </BarChart>
    )
  }

  return (
    <Card className="interactive-card">
        <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Client revenue over time.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <Tabs value={timeRange} onValueChange={handleTimeRangeChange} className="p-6">
                 <div className="mt-0">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <TabsList>
                            <TabsTrigger value="day">Day</TabsTrigger>
                            <TabsTrigger value="week">Week</TabsTrigger>
                            <TabsTrigger value="month">Month</TabsTrigger>
                            <TabsTrigger value="year">Year</TabsTrigger>
                            <TabsTrigger value="custom">Custom</TabsTrigger>
                        </TabsList>
                        {timeRange === 'custom' && (
                            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                        )}
                    </div>
                    <TabsContent value={timeRange} className="mt-4">
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <ResponsiveContainer>
                                {renderContent()}
                            </ResponsiveContainer>
                        </ChartContainer>
                    </TabsContent>
                </div>
            </Tabs>
        </CardContent>
    </Card>
  )
}
