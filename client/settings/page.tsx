
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Manage your profile and settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Client settings will be displayed here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
