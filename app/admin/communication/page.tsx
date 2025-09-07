
"use client";

import { useState, Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PageSkeleton } from "@/components/page-skeleton";
import { PushNotificationForm } from "./_components/push-notification-form";
import { BannerInfoForm } from "./_components/banner-info-form";


export default function CommunicationPage() {
    const [formKey, setFormKey] = useState(Date.now());

    const handleSuccess = () => {
        setFormKey(Date.now());
    };

  return (
    <div className="space-y-6 animate-on-scroll">
        <Card className="interactive-card">
            <CardHeader>
                <CardTitle className="text-3xl">Client Communication Center</CardTitle>
                <CardDescription>
                Engage with your clients by sending targeted push notifications and managing promotional banners.
                </CardDescription>
            </CardHeader>
        </Card>
      <Tabs defaultValue="push" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="push">Push Notification</TabsTrigger>
          <TabsTrigger value="banner">Banner Information</TabsTrigger>
        </TabsList>
        <TabsContent value="push">
          <Card className="interactive-card">
            <CardHeader>
              <CardTitle>Create Push Notification</CardTitle>
              <CardDescription>
                Send a notification to a targeted group of your clients. Use AI to generate an engaging image.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<PageSkeleton />}>
                    <PushNotificationForm key={formKey} onNotificationSent={handleSuccess} />
                </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="banner">
          <Card className="interactive-card">
            <CardHeader>
              <CardTitle>Manage Banner Information</CardTitle>
              <CardDescription>
                Create and publish banners that will be displayed to your clients in their app.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<PageSkeleton />}>
                    <BannerInfoForm key={formKey} onBannerAdded={handleSuccess} />
                </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
