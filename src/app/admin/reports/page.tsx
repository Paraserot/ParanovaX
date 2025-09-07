
"use client";

import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { allReportPages } from "./report-pages";

const ReportCard = ({ title, description, icon: Icon, href }: { title: string, description: string, icon: React.ElementType, href: string }) => (
  <Link href={href} className="flex">
    <Card className="interactive-card w-full flex flex-col justify-between transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
            </div>
        </div>
        <div className="flex-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-1 line-clamp-2">{description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  </Link>
)

export default function ReportsPage() {
  const masterReports = allReportPages.filter(p => ['client-master', 'customer-master', 'employee-master', 'user-management'].some(s => p.href.includes(s)));
  const financialReports = allReportPages.filter(p => ['invoice-management', 'payment-records', 'outstanding-payments', 'admin-expenses'].some(s => p.href.includes(s)));
  const activityReports = allReportPages.filter(p => ['lead-management', 'login-activity'].some(s => p.href.includes(s)));
  const communicationReports = allReportPages.filter(p => ['support-tickets', 'notification-history'].some(s => p.href.includes(s)));

  return (
    <div className="space-y-6">
       <Card className="interactive-card">
            <CardHeader>
                <CardTitle className="text-3xl">Comprehensive Reports</CardTitle>
                <CardDescription>
                Dive deep into your business data with detailed reports across all modules.
                </CardDescription>
            </CardHeader>
        </Card>
      <Card>
        <CardContent className="p-4 md:p-6">
            <Tabs defaultValue="master" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="master">Master Reports</TabsTrigger>
                <TabsTrigger value="financial">Financial Reports</TabsTrigger>
                <TabsTrigger value="activity">Activity Reports</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
              </TabsList>

              <TabsContent value="master">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 animate-on-scroll">
                  {masterReports.map((report) => (
                    <ReportCard key={report.href} {...report} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="financial">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 animate-on-scroll">
                  {financialReports.map((report) => (
                    <ReportCard key={report.href} {...report} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 animate-on-scroll">
                  {activityReports.map((report) => (
                    <ReportCard key={report.href} {...report} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="communication">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 animate-on-scroll">
                  {communicationReports.map((report) => (
                    <ReportCard key={report.href} {...report} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
