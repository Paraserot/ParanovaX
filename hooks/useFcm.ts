
"use client";

import { useEffect } from 'react';
import { onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export const useFcm = () => {
    const { toast } = useToast();
    const { adminUser } = useAuth();

    useEffect(() => {
        if (typeof window === 'undefined' || !messaging || !adminUser) return;
        
        // This hook now only listens for incoming messages.
        // Permission is requested manually from the settings page.
        
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Message received. ', payload);
            toast({
                title: payload.notification?.title || "New Notification",
                description: payload.notification?.body,
            });
        });

        return () => {
            unsubscribe();
        };
    }, [adminUser, toast]);

    return null; 
};
