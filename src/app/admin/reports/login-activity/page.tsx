
"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReportNavigation from "../_components/report-navigation";
import { PageSkeleton } from "@/components/page-skeleton";

const LoginAnalytics = dynamic(() => import("../../dashboard/_components/login-analytics"), {
    ssr: false,
    loading: () => <PageSkeleton />
});

export default function LoginActivityReportPage() {

    return (
        <div className="space-y-6">
            <Card className="interactive-card">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl">Login Activity Report</CardTitle>
                        <CardDescription>Monitor login trends for both clients and internal users.</CardDescription>
                    </div>
                    <ReportNavigation />
                </CardHeader>
            </Card>

            <Suspense fallback={<PageSkeleton />}>
                <LoginAnalytics />
            </Suspense>
        </div>
    )
}
