"use client";

"use client";

import { create } from 'zustand';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { ClientType } from '@/services/client-types';

interface ClientTypeStore {
  clientTypes: ClientType[];
  loading: boolean;
  fetched: boolean;
  fetchClientTypes: (force?: boolean) => () => void;
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
  fetched: false,
  fetchClientTypes: (force = false) => {
    if (!force && get().fetched) {
      return () => {};
    }
    
    set({ loading: true });
    const q = query(collection(db, "clientTypes"), orderBy("label"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(toSerializableClientType);
        set({ clientTypes: data, loading: false, fetched: true });
    }, (error) => {
        console.error("Failed to subscribe to client type updates:", error);
        set({ loading: false });
    });

    return unsubscribe;
  },
}));

    
