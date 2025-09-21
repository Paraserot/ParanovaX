
"use client";

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { sub, format, isWithinInterval, startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ChartContainer } from "@/components/ui/chart";
import { CustomLoader } from "@/components/ui/custom-loader";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

export type LoginRecord = {
    email: string;
    userType: 'admin' | 'client';
    timestamp: string;
}
export type LoginDataEntry = { date: string; clients: number; users: number; };

const chartConfig = {
    clients: { label: "Clients", color: "hsl(var(--chart-2))" },
    users: { label: "Users (Staff)", color: "hsl(var(--chart-1))" },
};

type UserType = "all" | "clients" | "users";
type TimeRange = "today" | "week" | "month" | "year" | "custom";


export default function LoginAnalyticsComponent() {
    const [loginRecords, setLoginRecords] = React.useState<LoginRecord[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [userType, setUserType] = React.useState<UserType>("all");
    const [timeRange, setTimeRange] = React.useState<TimeRange>("month");
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({ from: sub(new Date(), { days: 29 }), to: new Date() });

    React.useEffect(() => {
        const fetchLogins = async () => {
            setLoading(true);
            const loginActivityRef = collection(db, 'login_activity');
            const q = query(loginActivityRef, orderBy('timestamp', 'desc'));
            const snapshot = await getDocs(q);
            const records = snapshot.docs.map(doc => ({ ...doc.data(), timestamp: doc.data().timestamp.toDate().toISOString() })) as LoginRecord[];
            setLoginRecords(records);
            setLoading(false);
        }
        fetchLogins();
    }, []);

    const chartData = React.useMemo(() => {
        if (!loginRecords.length) return [];
        
        let filteredRecords = loginRecords;
        if(dateRange?.from) {
            const toDate = dateRange.to || dateRange.from;
            filteredRecords = loginRecords.filter(log => isWithinInterval(new Date(log.timestamp), {start: dateRange.from!, end: toDate}));
        }

        const result: { [key: string]: { clients: number, users: number } } = {};
        let dateFormat = "MMM d";

        if (timeRange === 'today') dateFormat = 'ha';
        if (timeRange === 'week') dateFormat = 'EEE';

        filteredRecords.forEach(log => {
            const formattedDate = format(new Date(log.timestamp), dateFormat);
            if (!result[formattedDate]) result[formattedDate] = { clients: 0, users: 0 };
            if (log.userType === 'client') result[formattedDate].clients++;
            else result[formattedDate].users++;
        });

        return Object.entries(result).map(([date, counts]) => ({ date, ...counts })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [loginRecords, dateRange, timeRange]);

    const handleTimeRangeChange = (value: string) => {
        const range = value as TimeRange;
        setTimeRange(range);
        const now = new Date();
        switch(range) {
            case 'today': setDateRange({ from: startOfDay(now), to: now }); break;
            case 'week': setDateRange({ from: startOfWeek(now), to: now }); break;
            case 'month': setDateRange({ from: startOfMonth(now), to: now }); break;
            case 'year': setDateRange({ from: startOfYear(now), to: now }); break;
            case 'custom': if (!dateRange) setDateRange({ from: sub(now, { days: 29 }), to: now }); break;
        }
    }

    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center h-[300px]"><CustomLoader /></div>;
        return (
            <ChartContainer config={chartConfig} className="w-full h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} /><YAxis tickLine={false} axisLine={false} tickMargin={8} /><Tooltip cursor={false} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', }} /><Legend />
                        {(userType === 'all' || userType === 'clients') && <Bar dataKey="clients" name="Clients" fill="var(--color-clients)" radius={4} />}
                        {(userType === 'all' || userType === 'users') && <Bar dataKey="users" name="Users (Staff)" fill="var(--color-users)" radius={4} />}
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        )
    }

    return (
        <Card className="interactive-card">
            <CardHeader><CardTitle>Login Activity</CardTitle><CardDescription>Track user and client logins over time.</CardDescription></CardHeader>
            <CardContent className="p-0">
                 <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <Tabs defaultValue={userType} onValueChange={(value) => setUserType(value as UserType)} className="w-full md:w-auto"><TabsList className="grid w-full grid-cols-3"><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="clients">Clients</TabsTrigger><TabsTrigger value="users">Users</TabsTrigger></TabsList></Tabs>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Tabs value={timeRange} onValueChange={handleTimeRangeChange} className="w-full sm:w-auto"><TabsList className="grid w-full grid-cols-3 sm:grid-cols-5"><TabsTrigger value="today">Today</TabsTrigger><TabsTrigger value="week">Week</TabsTrigger><TabsTrigger value="month">Month</TabsTrigger><TabsTrigger value="year">Year</TabsTrigger><TabsTrigger value="custom">Custom</TabsTrigger></TabsList></Tabs>
                            {timeRange === 'custom' && (<DateRangePicker date={dateRange} onDateChange={setDateRange} />)}
                        </div>
                    </div>
                    <div className="mt-6">{renderContent()}</div>
                </div>
            </CardContent>
        </Card>
    )
}
