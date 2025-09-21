"use client";

import { create } from 'zustand';
import { collection, query, orderBy, doc, Timestamp, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { Client } from '@/services/clients';

interface ClientStore {
  clientUser: Client | null;
  clients: Client[];
  loading: boolean;
  fetched: boolean;
  setClientUser: (client: Client | null) => void;
  fetchClients: (force?: boolean) => Promise<void>; 
  fetchClient: (uid: string) => Promise<Client | null>;
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
  loading: false,
  fetched: false,
  setClientUser: (client) => set({ clientUser: client }),
  fetchClients: async (force = false) => {
    if (!force && get().fetched) {
        return;
    }
    set({loading: true, fetched: false});
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
  fetchClient: async (uid: string) => {
    set({ loading: true });
    try {
        const clientDocRef = doc(db, "clients", uid);
        const docSnap = await getDoc(clientDocRef);
        if (docSnap.exists()) {
            const clientData = toSerializableClient(docSnap);
            set({ clientUser: clientData, loading: false });
            return clientData;
        } else {
            set({ clientUser: null, loading: false });
            return null;
        }
    } catch (error) {
        console.error("Failed to fetch client:", error);
        set({ loading: false });
        return null;
    }
  }
}));
