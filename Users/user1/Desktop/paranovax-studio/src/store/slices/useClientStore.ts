
"use client";

import { create } from 'zustand';
import { collection, onSnapshot, query, orderBy, doc, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Client } from '@/services/clients';

interface ClientStore {
  clientUser: Client | null;
  clients: Client[];
  loading: boolean;
  fetched: boolean;
  setClientUser: (client: Client | null) => void;
  fetchClients: (force?: boolean) => Promise<void>; 
}

const toSerializableClient = (docSnap: any): Client => {
    const data = docSnap.data();
    const normalizeDate = (value: any): string => {
        if (!value) return new Date().toISOString();
        if (value instanceof Timestamp) return value.toDate().toISOString();
        if (value && typeof value.seconds === 'number') {
            return new Timestamp(value.seconds, value.nanoseconds).toDate().toISOString();
        }
        if (typeof value === 'string') return value;
        return new Date().toISOString();
    };

    return {
        id: docSnap.id,
        ...data,
        createdAt: normalizeDate(data.createdAt),
        updatedAt: normalizeDate(data.updatedAt),
        lastVisit: data.lastVisit ? normalizeDate(data.lastVisit) : undefined,
    } as Client;
};

export const useClientStore = create<ClientStore>((set, get) => ({
  clientUser: null,
  clients: [],
  loading: false,
  fetched: false,
  setClientUser: (client) => set({ clientUser: client }),
  fetchClients: async (force = false) => {
    if (!force && get().fetched) {
        set({ loading: false });
        return;
    }
    set({loading: true});
    try {
        const q = query(collection(db, "clients"), orderBy("firmName"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(toSerializableClient);
        set({ clients: data, loading: false, fetched: true });
    } catch(error) {
        console.error("Failed to fetch clients:", error);
        set({ loading: false });
    }
  },
}));
