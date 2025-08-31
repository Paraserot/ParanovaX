
"use client";

import { create } from 'zustand';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Outstanding } from '@/services/outstanding';

interface OutstandingStore {
  outstanding: Outstanding[];
  loading: boolean;
  fetched: boolean;
  fetchOutstanding: (force?: boolean) => Promise<void>;
}

const toSerializableOutstanding = (docSnap: any): Outstanding => {
    const data = docSnap.data();
    return { 
      id: docSnap.id, 
      ...data,
      dueDate: (data.dueDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      entryDate: (data.entryDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Outstanding;
};

export const useOutstandingStore = create<OutstandingStore>((set, get) => ({
  outstanding: [],
  loading: false,
  fetched: false,
  fetchOutstanding: async (force = false) => {
    if (!force && get().fetched) return;

    set({ loading: true });
    try {
      const q = query(collection(db, "outstanding"), orderBy("entryDate", "desc"));
      const snapshot = await getDocs(q);
      const newOutstanding = snapshot.docs.map(toSerializableOutstanding);
      
      set({ outstanding: newOutstanding, fetched: true });
    } catch (error) {
      console.error("Failed to fetch outstanding:", error);
    } finally {
      set({ loading: false });
    }
  },
}));

    
