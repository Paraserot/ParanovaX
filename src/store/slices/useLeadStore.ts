
"use client";

import { create } from 'zustand';
import { collection, onSnapshot, query, orderBy, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { Lead } from '@/services/leads';

interface LeadStore {
  leads: Lead[];
  loading: boolean;
  fetched: boolean;
  fetchLeads: (force?: boolean) => Promise<void>;
  forceRefresh: () => void;
}

const toSerializableLead = (docSnap: any): Lead => {
    const data = docSnap.data();
    return { 
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    } as Lead;
};

export const useLeadStore = create<LeadStore>((set, get) => ({
  leads: [],
  loading: false,
  fetched: false,
  fetchLeads: async (force = false) => {
     if (!force && get().fetched) return;

    set({ loading: true });
    try {
        const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const newLeads = snapshot.docs.map(toSerializableLead);
        set({ leads: newLeads, loading: false, fetched: true });
    } catch (error) {
        console.error("Failed to fetch leads:", error);
        set({ loading: false });
    }
  },
  forceRefresh: () => {
    set({fetched: false});
    get().fetchLeads(true);
  }
}));
