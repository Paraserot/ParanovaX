
"use client";

import { create } from 'zustand';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PushNotification } from '@/services/pushNotifications';

interface PushNotificationStore {
  pushNotifications: PushNotification[];
  loading: boolean;
  fetched: boolean;
  fetchPushNotifications: (force?: boolean) => Promise<void>;
}

const toSerializablePushNotification = (docSnap: any): PushNotification => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
        scheduledDateTime: (data.scheduledDateTime as Timestamp)?.toDate().toISOString(),
    } as PushNotification;
}

export const usePushNotificationStore = create<PushNotificationStore>((set, get) => ({
  pushNotifications: [],
  loading: false,
  fetched: false,
  fetchPushNotifications: async (force = false) => {
    if (!force && get().fetched) return;

    set({ loading: true });
    try {
      const q = query(collection(db, "pushNotifications"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const newNotifications = snapshot.docs.map(toSerializablePushNotification);
      
      set({ pushNotifications: newNotifications, fetched: true });
    } catch (error) {
      console.error("Failed to fetch push notifications:", error);
    } finally {
      set({ loading: false });
    }
  },
}));

    
