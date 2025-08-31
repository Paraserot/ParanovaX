
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, Pie, PieChart, Cell } from "recharts"
import { subDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, eachDayOfInterval, eachMonthOfInterval } from "date-fns"
import type { DateRange } from "react-day-picker"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CustomLoader } from "@/components/ui/custom-loader"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { useExpenseStore } from "@/store/slices/useExpenseStore"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const chartColors = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))"
];

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
  travel: { label: "Travel", color: "hsl(var(--chart-1))" },
  'office-supplies': { label: "Office Supplies", color: "hsl(var(--chart-2))" },
  salaries: { label: "Salaries", color: "hsl(var(--chart-3))" },
  utilities: { label: "Utilities", color: "hsl(var(--chart-4))" },
  marketing: { label: "Marketing", color: "hsl(var(--chart-5))" },
  other: { label: "Other", color: "hsl(var(--muted))" },
}

function ExpenseChartComponent() {
  const { expenses, loading, fetchExpenses } = useExpenseStore();
  const [timeRange, setTimeRange] = React.useState<"month" | "day" | "week" | "quarter" | "custom">("month");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  React.useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);
  
  const { barChartData, pieChartData, totalAmount } = React.useMemo(() => {
    if (!expenses.length) return { barChartData: [], pieChartData: [], totalAmount: 0 };

    let filteredExpenses = expenses;
    if (dateRange?.from && dateRange?.to) {
        const toDateEnd = new Date(dateRange.to);
        toDateEnd.setHours(23, 59, 59, 999);
        filteredExpenses = expenses.filter(c => c.expenseDate && new Date(c.expenseDate) >= dateRange.from! && new Date(c.expenseDate) <= toDateEnd);
    } else if (dateRange?.from) {
        filteredExpenses = expenses.filter(c => c.expenseDate && new Date(c.expenseDate) >= dateRange.from!);
    }

    const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Pie Chart Data (Category breakdown)
    const expenseByCategory = filteredExpenses.reduce((acc, expense) => {
        const category = expense.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);
    const pieData = Object.entries(expenseByCategory).map(([name, value], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        fill: chartColors[index % chartColors.length]
    })).sort((a,b) => b.value - a.value);

    // Bar Chart Data (Time series)
    let dateFormat: string;
    let intervalGenerator: (interval: {start: Date, end: Date}) => Date[];

     switch (timeRange) {
        case "week":
            dateFormat = "EEE"; // Day of week
            intervalGenerator = eachDayOfInterval;
            break;
        case "quarter":
            dateFormat = "MMM"; // Month for quarter view
            intervalGenerator = eachMonthOfInterval;
            break;
        case "custom":
        case "month":
        default:
            dateFormat = "MMM d"; // Date
            intervalGenerator = eachDayOfInterval;
            break;
    }
    
    if (timeRange === "day") {
        const expenseByHour: Record<string, number> = {};
        filteredExpenses.forEach(exp => {
            const hourKey = format(new Date(exp.expenseDate), 'ha');
            expenseByHour[hourKey] = (expenseByHour[hourKey] || 0) + exp.amount;
        });
        const barData = Object.entries(expenseByHour).map(([x, amount]) => ({ x, amount }));
        return { barChartData: barData, pieChartData: pieData, totalAmount: total };
    }

    const expenseByDate = filteredExpenses.reduce((acc, expense) => {
        const dateKey = format(new Date(expense.expenseDate!), dateFormat);
        acc[dateKey] = (acc[dateKey] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    if (!dateRange?.from || !dateRange?.to) return { barChartData: [], pieChartData: pieData, totalAmount: total };

    const allDates = intervalGenerator({ start: dateRange.from, end: dateRange.to });
    const barData = allDates.map(date => {
        const dateKey = format(date, dateFormat);
        return {
            x: dateKey,
            amount: expenseByDate[dateKey] || 0,
        };
    });

    return { barChartData: barData, pieChartData: pieData, totalAmount: total };

  }, [expenses, timeRange, dateRange]);


  const handleTimeRangeChange = (value: string) => {
    const range = value as "day" | "week" | "month" | "quarter" | "custom";
    setTimeRange(range);
    
    const now = new Date();
    switch(range) {
        case 'day': setDateRange({ from: now, to: now }); break;
        case 'week': setDateRange({ from: startOfWeek(now), to: endOfWeek(now) }); break;
        case 'month': setDateRange({ from: startOfMonth(now), to: endOfMonth(now) }); break;
        case 'quarter': setDateRange({ from: startOfQuarter(now), to: endOfQuarter(now) }); break;
        case 'custom': if (!dateRange) { setDateRange({ from: subDays(new Date(), 29), to: new Date() }); }; break;
    }
  }


  const renderContent = () => {
    if (loading && !expenses.length) {
        return (
            <div className="flex justify-center items-center h-[350px]">
                <CustomLoader />
            </div>
        )
    }
    
    if (!barChartData.length && !pieChartData.length) {
      return (
        <div className="flex flex-col items-center justify-center h-[350px]">
          <p className="text-muted-foreground">No expense data for the selected period.</p>
        </div>
      )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[350px] items-start">
            <ChartContainer config={chartConfig} className="lg:col-span-2 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="x"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            interval="preserveStartEnd"
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent
                                formatter={(value) => `₹${(value as number).toLocaleString()}`}
                                indicator="dot"
                            />}
                        />
                        <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
            <div className="flex flex-col">
                <h4 className="font-semibold text-center mb-2">Expenses by Category</h4>
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[150px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent
                                    hideLabel
                                    formatter={(value, name) => (
                                        <div className="flex flex-col gap-0.5">
                                            <div className="font-medium">{name}</div>
                                            <div className="text-muted-foreground">
                                                ₹{Number(value).toLocaleString()} ({(Number(value) / totalAmount * 100).toFixed(1)}%)
                                            </div>
                                        </div>
                                    )}
                                />}
                            />
                            <Pie
                                data={pieChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                strokeWidth={2}
                                paddingAngle={2}
                            >
                                {pieChartData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.fill} name={entry.name} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                 <Table className="mt-4">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-2 h-8 w-[60%]">Category</TableHead>
                            <TableHead className="text-center px-2 h-8 w-[20%]">Amount</TableHead>
                            <TableHead className="text-right px-2 h-8 w-[20%]">%</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pieChartData.map((d) => (
                            <TableRow key={d.name} className="h-8">
                                <TableCell className="flex items-center gap-2 font-medium py-1 px-2">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: d.fill}} />
                                    <span className="truncate">{d.name}</span>
                                </TableCell>
                                <TableCell className="text-center py-1 px-2 text-xs">₹{d.value.toLocaleString()}</TableCell>
                                <TableCell className="text-right py-1 px-2 text-muted-foreground text-xs">
                                    {totalAmount > 0 ? ((d.value / totalAmount) * 100).toFixed(0) : 0}%
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
  }

  return (
    <Card className="interactive-card flex flex-col">
        <CardHeader>
            <CardTitle>Expense Analytics</CardTitle>
            <CardDescription>
                Total expenses for the selected period: <span className="font-bold text-primary">₹{totalAmount.toLocaleString()}</span>
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
            <Tabs value={timeRange} onValueChange={handleTimeRangeChange} className="space-y-4 flex-1 flex flex-col">
                 <div className="mt-0">
                    <div className="flex flex-wrap items-center gap-4">
                        <TabsList>
                            <TabsTrigger value="day">Day</TabsTrigger>
                            <TabsTrigger value="week">Week</TabsTrigger>
                            <TabsTrigger value="month">Month</TabsTrigger>
                            <TabsTrigger value="quarter">Quarter</TabsTrigger>
                            <TabsTrigger value="custom">Custom</TabsTrigger>
                        </TabsList>
                        {timeRange === 'custom' && (
                            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                        )}
                    </div>
                    <TabsContent value={timeRange} className="mt-4">
                        {renderContent()}
                    </TabsContent>
                </div>
            </Tabs>
        </CardContent>
    </Card>
  )
}

export default ExpenseChartComponent;
