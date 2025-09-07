
"use client";

import { create } from 'zustand';
import { collection, onSnapshot, query, orderBy, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { Service } from '@/services/services';

interface ServiceStore {
  services: Service[];
  loading: boolean;
  fetched: boolean;
  fetchServices: (force?: boolean) => Promise<void>;
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
  fetchServices: async (force = false) => {
    if (!force && get().fetched) return;
    
    set({ loading: true });
    try {
        const q = query(collection(db, "services"), orderBy("name"));
        const snapshot = await getDocs(q);
        const newServices = snapshot.docs.map(toSerializableService);
        set({ services: newServices, loading: false, fetched: true });
    } catch(error) {
      console.error("Failed to fetch services:", error);
      set({ loading: false });
    }
  },
  forceRefresh: () => {
    set({fetched: false});
    get().fetchServices(true);
  }
}));
