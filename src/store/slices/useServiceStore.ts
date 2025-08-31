
"use client";

import { create } from 'zustand';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Service } from '@/services/services';

interface ServiceStore {
  services: Service[];
  loading: boolean;
  fetched: boolean;
  setServices: (services: Service[]) => void;
  fetchServices: (force?: boolean) => () => void;
  forceRefresh: () => void;
}

const toSerializableService = (docSnap: any): Service => {
    const data = docSnap.data();
    return { 
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Service;
};

export const useServiceStore = create<ServiceStore>((set, get) => ({
  services: [],
  loading: false,
  fetched: false,

  setServices: (services) => {
    set({ services, loading: false, fetched: true });
  },

  fetchServices: (force = false) => {
    if (!force && get().fetched) return () => {};
    
    set({ loading: true });

    const q = query(collection(db, "services"), orderBy("name"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newServices = snapshot.docs.map(toSerializableService);
      set({ services: newServices, loading: false, fetched: true });
    }, (error) => {
      console.error("Failed to fetch services:", error);
      set({ loading: false });
    });

    return unsubscribe;
  },

  forceRefresh: () => {
    get().fetchServices(true);
  }
}));

    
