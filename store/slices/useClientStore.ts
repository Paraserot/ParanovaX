
"use client";

import { create } from 'zustand';
import { collection, onSnapshot, query, orderBy, doc, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { Client } from '@/services/clients';

interface ClientStore {
  clientUser: Client | null;
  clients: Client[];
  loading: boolean;
  fetched: boolean;
  setClientUser: (client: Client | null) => void;
  fetchClients: (force?: boolean) => Promise<void>; 
  fetchClient: (uid: string) => () => void;
}

const toSerializableClient = (docSnap: any): Client => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        lastVisit: data.lastVisit instanceof Timestamp ? data.lastVisit.toDate().toISOString() : data.lastVisit,
    } as Client;
};

export const useClientStore = create<ClientStore>((set, get) => ({
  clientUser: null,
  clients: [],
  loading: true,
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
  fetchClient: (uid: string) => {
    set({ loading: true });
    const unsubscribe = onSnapshot(doc(db, "clients", uid), (doc) => {
        if (doc.exists()) {
            set({ clientUser: toSerializableClient(doc), loading: false });
        } else {
            set({ clientUser: null, loading: false });
        }
    }, (error) => {
        console.error("Failed to fetch client:", error);
        set({ loading: false });
    });
    return unsubscribe;
  }
}));

