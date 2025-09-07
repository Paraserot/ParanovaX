
"use client";

import { create } from 'zustand';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TicketCategory } from '@/services/ticket-categories';

interface TicketCategoryStore {
  ticketCategories: TicketCategory[];
  loading: boolean;
  fetched: boolean;
  fetchTicketCategories: (force?: boolean) => Promise<void>;
}

const toSerializableTicketCategory = (docSnap: any): TicketCategory => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as TicketCategory;
}

export const useTicketCategoryStore = create<TicketCategoryStore>((set, get) => ({
  ticketCategories: [],
  loading: false,
  fetched: false,
  fetchTicketCategories: async (force = false) => {
    const { loading, fetched } = get();
    if (!force && (loading || fetched)) {
      return;
    }

    set({ loading: true });
    try {
      const q = query(collection(db, "ticketCategories"), orderBy("label", "asc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(toSerializableTicketCategory);
      set({ ticketCategories: data, fetched: true });
    } catch (error) {
      console.error("Failed to fetch ticket categories:", error);
      set({ ticketCategories: [] });
    } finally {
      set({ loading: false });
    }
  },
}));

    
