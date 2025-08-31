
"use client";

import { create } from 'zustand';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Ticket } from '@/services/tickets';

interface TicketStore {
  tickets: Ticket[];
  loading: boolean;
  fetched: boolean;
  fetchTickets: (force?: boolean) => Promise<void>;
  forceRefresh: () => Promise<void>;
}

const toSerializableTicket = (docSnap: any): Ticket => {
    const data = docSnap.data();
    const remarks = (data.remarks || []).map((r: any) => ({
        ...r,
        createdAt: (r.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    }));

    return {
        id: docSnap.id,
        ...data,
        remarks,
        dueDate: (data.dueDate as Timestamp)?.toDate().toISOString() || null,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        closedAt: (data.closedAt as Timestamp)?.toDate().toISOString() || null,
    } as Ticket;
};

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [],
  loading: false,
  fetched: false,
  fetchTickets: async (force = false) => {
    if (!force && get().fetched) return;

    set({ loading: true });
    try {
      const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const newTickets = snapshot.docs.map(toSerializableTicket);

      set({ tickets: newTickets, fetched: true });
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      set({ loading: false });
    }
  },
  forceRefresh: async () => {
    set({ fetched: false });
    await get().fetchTickets(true);
  }
}));

    
