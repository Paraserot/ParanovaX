
"use client";

import { create } from 'zustand';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Lead } from '@/services/leads';

interface LeadStore {
  leads: Lead[];
  loading: boolean;
  fetched: boolean;
  fetchLeads: (force?: boolean) => () => void;
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
  fetchLeads: (force = false) => {
     if (!force && get().fetched) return () => {};

    set({ loading: true });
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newLeads = snapshot.docs.map(toSerializableLead);
      set({ leads: newLeads, loading: false, fetched: true });
    }, (error) => {
      console.error("Failed to fetch leads:", error);
      set({ loading: false });
    });
    
    return unsubscribe;
  },
}));

    