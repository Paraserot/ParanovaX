
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingPage() {
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Billing & Invoices</CardTitle>
                    <CardDescription>View your billing history and invoices here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Billing information will be displayed here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
