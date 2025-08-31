
"use client";

import { create } from 'zustand';
import { collection, getDocs, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ClientType } from '@/services/client-types';

interface ClientTypeStore {
  clientTypes: ClientType[];
  loading: boolean;
  setClientTypes: (types: ClientType[]) => void; // For hydration
  fetchClientTypes: (force?: boolean) => void; // For background updates
}

const toSerializableClientType = (docSnap: any): ClientType => {
    const data = docSnap.data();
    return { 
      id: docSnap.id, 
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as ClientType;
};


export const useClientTypeStore = create<ClientTypeStore>((set, get) => ({
  clientTypes: [],
  loading: false,

  setClientTypes: (types) => {
    set({ clientTypes: types, loading: false });
  },

  fetchClientTypes: (force = false) => {
    set({ loading: true });
    try {
      const q = query(collection(db, "clientTypes"), orderBy("label"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(toSerializableClientType);
        set({ clientTypes: data, loading: false });
      }, (error) => {
        console.error("Failed to subscribe to client type updates:", error);
        set({ loading: false });
      });

    } catch (error) {
      console.error("Failed to fetch client types:", error);
      set({ clientTypes: [], loading: false });
    }
  },
}));

    
