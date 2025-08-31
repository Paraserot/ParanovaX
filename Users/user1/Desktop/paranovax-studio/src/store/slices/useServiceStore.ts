
"use client";

import { create } from 'zustand';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Service } from '@/services/services';

interface ServiceStore {
  services: Service[];
  loading: boolean;
  fetchServices: (force?: boolean) => () => void;
}

const toSerializableService = (docSnap: any): Service => {
    const data = docSnap.data();
    return { 
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Service;
};

export const useServiceStore = create<ServiceStore>((set) => ({
  services: [],
  loading: false,
  fetchServices: () => {
    set({ loading: true });
    const q = query(collection(db, "services"), orderBy("name"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newServices = snapshot.docs.map(toSerializableService);
      set({ services: newServices, loading: false });
    }, (error) => {
      console.error("Failed to fetch services:", error);
      set({ loading: false });
    });

    return unsubscribe;
  },
}));

    